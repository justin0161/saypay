import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { MicIcon, PlusIcon, SearchIcon } from "@/components/ui/icons";
import { DepositPill, StatusPill } from "@/components/ui/pill";
import { requireWorkspace } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import { formatMoney } from "@/lib/quote-math";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Quotes" };

const FILTERS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "awaiting", label: "Awaiting reply" },
  { key: "approved", label: "Accepted" },
  { key: "deposit", label: "Deposit secured" },
  { key: "declined", label: "Declined" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];
const OPEN = ["sent", "viewed", "changes_requested"] as const;

/** Strip characters that have meaning in PostgREST filter syntax. */
function sanitizeSearch(q: string): string {
  return q.replace(/[%,()*\\:."']/g, " ").trim().slice(0, 60);
}

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

  const chips = FILTERS.filter((f) => ["all", "awaiting", "approved", "deposit"].includes(f.key));
  const chipLabel: Record<string, string> = { all: "All", awaiting: "Waiting on you", approved: "Accepted", deposit: "Paid" };
  const summary = stats.filter((s) => s.key !== "open");

  return (
    <div className="space-y-5">
      {welcome && (
        <div className="rounded-card bg-hivis-soft p-5 ring-1 ring-hivis/20 ring-inset">
          <p className="text-lg font-semibold">Welcome to SayPay 👋</p>
          <p className="mt-1 text-ink-soft">
            First, set up how you get paid in{" "}
            <Link href="/settings#get-paid" className="font-semibold text-hivis underline underline-offset-2">
              Settings
            </Link>
            . Then send your first quote.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold sm:text-4xl">Quotes</h1>
      </div>

      {/* Summary */}
      {all.length > 0 && (
        <div className="grid grid-cols-3 divide-x divide-line rounded-card bg-surface shadow-card ring-1 ring-line ring-inset">
          {summary.map((s) => (
            <Link key={s.key} href={filterHref(s.key)} className="min-w-0 px-3 py-4 text-center transition hover:bg-raised sm:px-5">
              <p className="tabular truncate text-xl font-bold sm:text-2xl">{s.value}</p>
              <p className="mt-0.5 truncate text-xs text-muted sm:text-sm">{chipLabel[s.key] ?? s.label}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Search + filters */}
      {all.length > 0 && (
        <div className="space-y-3">
          <form action="/dashboard" className="relative">
            {filter !== "all" && <input type="hidden" name="status" value={filter} />}
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" width={18} height={18} />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search quotes"
              className="min-h-11 w-full rounded-xl bg-surface pr-4 pl-10 ring-1 ring-[#d5dcea] ring-inset placeholder:text-[#94a1b8] focus:ring-2 focus:ring-hivis focus:outline-none"
              aria-label="Search quotes"
            />
          </form>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
            {chips.map((f) => (
              <Link
                key={f.key}
                href={filterHref(f.key)}
                className={cn(
                  "flex min-h-9 shrink-0 items-center rounded-full px-3.5 text-sm font-medium transition",
                  filter === f.key ? "bg-ink text-white" : "bg-surface text-ink-soft ring-1 ring-line ring-inset hover:text-ink",
                )}
              >
                {chipLabel[f.key]}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      {quotes.length === 0 ? (
        <div className="rounded-card bg-surface px-6 py-14 text-center shadow-card ring-1 ring-line ring-inset">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-hivis-soft text-hivis">
            <MicIcon width={24} height={24} />
          </span>
          <p className="mt-5 text-xl font-bold">{all.length === 0 ? "Send your first quote" : "No quotes here"}</p>
          <p className="mx-auto mt-1 max-w-sm text-ink-soft">
            {all.length === 0 ? "Tap the button, say the job and the prices, and send the link." : "Try another filter or search."}
          </p>
          {all.length === 0 && (
            <Link href="/quotes/new" className={buttonClass("primary", "lg", "mt-6")}>
              <PlusIcon /> New quote
            </Link>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-card bg-surface shadow-card ring-1 ring-line ring-inset">
          {quotes.map((quote) => {
            const awaiting =
              (OPEN as readonly string[]).includes(quote.status) &&
              (quote.last_message_role === "client" || quote.status === "changes_requested");
            return (
              <li key={quote.id}>
                <Link href={`/quotes/${quote.id}`} className="flex items-center gap-3 px-4 py-4 transition hover:bg-raised sm:px-5">
                  <span className={cn("size-2 shrink-0 rounded-full", awaiting ? "bg-hivis" : "bg-transparent")} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{quote.title}</p>
                    <p className="truncate text-sm text-muted">
                      {quote.client_name} · {awaiting ? <span className="font-medium text-hivis">New reply</span> : timeAgo(quote.updated_at)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tabular font-semibold">{formatMoney(quote.total_cents, quote.currency)}</p>
                    <div className="mt-1 flex justify-end">
                      {quote.deposit_status === "paid" ? <DepositPill status="paid" /> : <StatusPill status={quote.status} />}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
