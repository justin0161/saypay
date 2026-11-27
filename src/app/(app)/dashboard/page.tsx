import type { Metadata } from "next";
import Link from "next/link";
import { ShareActions } from "@/components/quote/share-actions";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { CardIcon, ChatIcon, CheckIcon, MicIcon, PlusIcon, SearchIcon, SendIcon } from "@/components/ui/icons";
import { DepositPill, StatusPill } from "@/components/ui/pill";
import { requireWorkspace } from "@/lib/auth";
import { publicEnv } from "@/lib/env";
import { timeAgo } from "@/lib/format";
import { formatMoney } from "@/lib/quote-math";
import { shareMessage, shareUrl } from "@/lib/share";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Quotes" };

const FILTERS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "awaiting", label: "Awaiting reply" },
  { key: "approved", label: "Approved" },
  { key: "deposit", label: "Deposit secured" },
  { key: "declined", label: "Declined" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];
const OPEN = ["sent", "viewed", "changes_requested"] as const;

/** Strip characters that have meaning in PostgREST filter syntax. */
function sanitizeSearch(q: string): string {
  return q.replace(/[%,()*\\:."']/g, " ").trim().slice(0, 60);
}

const STAT_ICON = {
  open: <SendIcon width={16} height={16} />,
  awaiting: <ChatIcon width={16} height={16} />,
  approved: <CheckIcon width={16} height={16} />,
  deposit: <CardIcon width={16} height={16} />,
} as const;

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const sp = await searchParams;
  const filter: FilterKey = FILTERS.some((f) => f.key === sp.status) ? (sp.status as FilterKey) : "all";
  const q = typeof sp.q === "string" ? sanitizeSearch(sp.q) : "";
  const welcome = sp.welcome === "1";

  const { workspace } = await requireWorkspace();
  const supabase = await createClient();

  // Light query for stats across the whole workspace.
  const statsRes = await supabase
    .from("quotes")
    .select("status, deposit_status, deposit_cents, last_message_role")
    .eq("workspace_id", workspace.id);
  const all = statsRes.data ?? [];
  const isOpen = (s: string) => (OPEN as readonly string[]).includes(s);
  const paid = all.filter((r) => r.deposit_status === "paid");
  const stats = [
    { key: "open", label: "Open quotes", value: String(all.filter((r) => isOpen(r.status)).length) },
    {
      key: "awaiting",
      label: "Awaiting your reply",
      value: String(all.filter((r) => isOpen(r.status) && (r.last_message_role === "client" || r.status === "changes_requested")).length),
    },
    { key: "approved", label: "Approved", value: String(all.filter((r) => r.status === "approved").length) },
    {
      key: "deposit",
      label: `Deposits secured (${paid.length})`,
      value: formatMoney(paid.reduce((s, r) => s + r.deposit_cents, 0), workspace.currency),
    },
  ] as const;

  // Filtered list.
  let list = supabase
    .from("quotes")
    .select(
      "id, share_token, title, client_name, client_phone, total_cents, deposit_cents, currency, status, deposit_status, last_message_role, last_message_at, created_at, updated_at",
    )
    .eq("workspace_id", workspace.id)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (filter === "open") list = list.in("status", [...OPEN]);
  if (filter === "awaiting") list = list.in("status", [...OPEN]).or("last_message_role.eq.client,status.eq.changes_requested");
  if (filter === "approved") list = list.eq("status", "approved");
  if (filter === "deposit") list = list.eq("deposit_status", "paid");
  if (filter === "declined") list = list.eq("status", "declined");
  if (q) list = list.or(`title.ilike.*${q}*,client_name.ilike.*${q}*`);
  const { data: quotes, error } = await list;
  if (error) throw new Error(error.message);

  const filterHref = (key: string) => {
    const p = new URLSearchParams();
    if (key !== "all") p.set("status", key);
    if (q) p.set("q", q);
    const s = p.toString();
    return s ? `/dashboard?${s}` : "/dashboard";
  };

  return (
    <div className="space-y-6">
      {welcome && (
        <div className="overflow-hidden rounded-card bg-night text-white">
          <div className="p-6">
          <p className="font-display text-3xl leading-none font-bold">Welcome to <span className="text-hivis">SayPay</span></p>
          <p className="mt-2 text-white/70">
            Add your logo and contact number in <Link href="/settings" className="font-semibold text-hivis underline underline-offset-2">Settings</Link>, then send your first voice quote.
          </p>
          </div>
        </div>
      )}

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted">{workspace.business_name}</p>
          <h1 className="mt-1 text-5xl leading-none font-bold sm:text-6xl">Quotes</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.key}
            href={filterHref(s.key)}
            className={cn(
              "group rounded-card bg-surface p-4 ring-1 ring-line ring-inset transition hover:ring-ink sm:p-5",
              filter === s.key && "bg-hivis ring-2 ring-ink",
            )}
          >
            <p className="flex items-start justify-between gap-2 text-sm leading-snug font-medium text-muted">
              <span>{s.label}</span>
              <span className="shrink-0 text-ink/50 transition group-hover:text-ink max-sm:hidden">{STAT_ICON[s.key]}</span>
            </p>
            <p className="tabular mt-3 font-display text-4xl leading-none font-bold sm:text-5xl">{s.value}</p>
          </Link>
        ))}
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <form action="/dashboard" className="relative">
          {filter !== "all" && <input type="hidden" name="status" value={filter} />}
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by job or client"
            className="min-h-12 w-full rounded-xl bg-surface pr-4 pl-11 ring-1 ring-[#cfcabd] ring-inset transition placeholder:text-[#a5a39c] focus:ring-2 focus:ring-ink focus:shadow-[0_0_0_4px_rgb(255_184_28/0.35)] focus:outline-none"
            aria-label="Search quotes"
          />
        </form>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={filterHref(f.key)}
              className={cn(
                "flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold ring-1 ring-inset transition",
                filter === f.key ? "bg-hivis text-on-accent ring-hivis" : "bg-surface text-ink-soft ring-line hover:text-ink hover:ring-ink/25",
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* List */}
      {quotes.length === 0 ? (
        <div className="relative overflow-hidden rounded-card bg-surface p-12 text-center ring-2 ring-ink">
          <div className="relative mx-auto grid size-14 place-items-center rounded-2xl bg-hivis text-on-accent shadow-card">
            <MicIcon width={24} height={24} />
          </div>
          <p className="relative mt-6 font-display text-3xl leading-none font-bold">{all.length === 0 ? "Send your first voice quote" : "Nothing here yet"}</p>
          <p className="relative mx-auto mt-1 max-w-sm text-muted">
            {all.length === 0
              ? "It takes about 60 seconds: add a few line items, record a quick walkthrough, and share the link."
              : "Try a different filter or search."}
          </p>
          {all.length === 0 && (
            <Link href="/quotes/new" className={buttonClass("hivis", "lg", "relative mt-6")}>
              <PlusIcon /> New quote
            </Link>
          )}
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {quotes.map((quote) => {
            const awaiting =
              (OPEN as readonly string[]).includes(quote.status) &&
              (quote.last_message_role === "client" || quote.status === "changes_requested");
            return (
              <li
                key={quote.id}
                className={cn(
                  "relative min-w-0 overflow-hidden rounded-card bg-surface p-4 ring-1 ring-line ring-inset transition hover:ring-ink sm:p-5",
                  awaiting && "ring-2 ring-ink before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-hivis",
                )}
              >
                <Link href={`/quotes/${quote.id}`} className="block">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-display text-xl leading-tight font-bold">{quote.title}</p>
                      <p className="truncate text-sm text-muted">
                        {quote.client_name} · {timeAgo(quote.updated_at)}
                      </p>
                    </div>
                    <p className="tabular shrink-0 text-[17px] font-semibold">{formatMoney(quote.total_cents, quote.currency)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <StatusPill status={quote.status} />
                    <DepositPill status={quote.deposit_status} />
                    {awaiting && (
                      <span className="rounded-full bg-hivis px-2.5 py-1 text-xs font-semibold text-on-accent">New reply</span>
                    )}
                  </div>
                </Link>
                <div className="mt-4">
                  <ShareActions
                    url={shareUrl(publicEnv.siteUrl, quote.share_token)}
                    message={shareMessage(publicEnv.siteUrl, quote, workspace.business_name)}
                    phone={quote.client_phone}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
