"use client";

import { useMemo, useState, useTransition } from "react";
import { createQuote, deleteAttachment, requestOwnerUpload, updateQuote } from "@/actions/quotes";
import { formatDuration } from "@/lib/media";
import { computeTotals, formatMoney, parseMoneyToCents, type DepositInput } from "@/lib/quote-math";
import type { LineItem, MediaItem } from "@/lib/types";
import { uploadMedia, type UploadedFile } from "@/lib/upload-client";
import type { QuoteInput } from "@/lib/validation";
import { AudioPlayer } from "../media/audio-player";
import { MediaGallery } from "../media/media-gallery";
import { MediaPicker } from "../media/media-picker";
import { VoiceRecorder } from "../media/voice-recorder";
import { Button } from "../ui/button";
import { Card, CardTitle } from "../ui/card";
import { cn } from "../ui/cn";
import { Field, Input, inputClass, Textarea } from "../ui/field";
import { LinkIcon, PlusIcon, TrashIcon, XIcon } from "../ui/icons";

type Row = { id: string; description: string; quantity: string; price: string };

type Staged = UploadedFile & { preview: string; duration_seconds: number | null; is_walkthrough: boolean };

export type BuilderInitial = {
  title: string;
  scope: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  line_items: LineItem[];
  tax_rate: number;
  deposit_type: "percent" | "fixed";
  deposit_percent: number | null;
  deposit_cents: number;
  valid_until: string | null;
  accept_card?: boolean;
  accept_bank?: boolean;
};

const rid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));
const centsToInput = (c: number) => (c / 100).toFixed(2).replace(/\.00$/, "");

export function QuoteBuilder({
  mode,
  draftId,
  currency,
  taxLabel,
  defaultTaxRate,
  defaultDepositPercent,
  initial,
  existingWalkthrough,
  existingMedia = [],
  cardReady = false,
  bankReady = false,
}: {
  mode: "create" | "edit";
  draftId: string;
  currency: string;
  taxLabel: string;
  defaultTaxRate: number;
  defaultDepositPercent: number;
  initial?: BuilderInitial;
  existingWalkthrough?: MediaItem | null;
  existingMedia?: MediaItem[];
  /** The business can take card payments (Stripe connected or own payment link). */
  cardReady?: boolean;
  /** The business has saved bank details for transfers. */
  bankReady?: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [scope, setScope] = useState(initial?.scope ?? "");
  const [clientName, setClientName] = useState(initial?.client_name ?? "");
  const [clientPhone] = useState(initial?.client_phone ?? "");
  const [clientEmail] = useState(initial?.client_email ?? "");
  const [validUntil, setValidUntil] = useState(initial?.valid_until ?? "");
  const [rows, setRows] = useState<Row[]>(
    initial?.line_items.length
      ? initial.line_items.map((i) => ({ id: i.id, description: i.description, quantity: String(i.quantity), price: centsToInput(i.unit_price_cents) }))
      : [{ id: rid(), description: "", quantity: "1", price: "" }],
  );
  const [taxEnabled, setTaxEnabled] = useState(initial ? initial.tax_rate > 0 : defaultTaxRate > 0);
  const [taxRate, setTaxRate] = useState(String(initial?.tax_rate || defaultTaxRate || 20));
  const [depositType, setDepositType] = useState<"percent" | "fixed">(initial?.deposit_type ?? "percent");
  const [depositPercent, setDepositPercent] = useState(String(initial?.deposit_percent ?? defaultDepositPercent));
  const [depositFixed, setDepositFixed] = useState(initial?.deposit_type === "fixed" ? centsToInput(initial.deposit_cents) : "");
  const [staged, setStaged] = useState<Staged[]>([]);
  const [existing, setExisting] = useState<MediaItem[]>(existingMedia);
  const [walkthroughExisting, setWalkthroughExisting] = useState<MediaItem | null>(existingWalkthrough ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(Boolean(initial?.scope || initial?.valid_until));
  const [acceptCard, setAcceptCard] = useState(initial?.accept_card ?? true);
  const [acceptBank, setAcceptBank] = useState(initial?.accept_bank ?? true);
  const [pending, startTransition] = useTransition();

  const requestUpload = (meta: Parameters<typeof requestOwnerUpload>[1]) => requestOwnerUpload(draftId, meta);

  const lineItems: LineItem[] = useMemo(
    () =>
      rows.map((r) => ({
        id: r.id,
        description: r.description.trim(),
        quantity: Number(r.quantity.replace(",", ".")) || 0,
        unit_price_cents: parseMoneyToCents(r.price) ?? 0,
      })),
    [rows],
  );

  const deposit: DepositInput =
    depositType === "percent"
      ? { type: "percent", percent: Number(depositPercent) || 0 }
      : { type: "fixed", cents: parseMoneyToCents(depositFixed) ?? 0 };
  const taxRateNum = taxEnabled ? Number(taxRate) || 0 : 0;
  const totals = computeTotals(lineItems, taxRateNum, deposit);
  const walkthroughStaged = staged.find((s) => s.is_walkthrough);
  const hasWalkthrough = Boolean(walkthroughStaged || walkthroughExisting);

  const updateRow = (id: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, { id: rid(), description: "", quantity: "1", price: "" }]);
  const removeRow = (id: string) => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs));

  const saveWalkthrough = async (blob: Blob, seconds: number) => {
    const up = await uploadMedia(blob, requestUpload);
    setStaged((s) => [
      ...s.filter((x) => !x.is_walkthrough),
      { ...up, preview: URL.createObjectURL(blob), duration_seconds: seconds, is_walkthrough: true },
    ]);
  };

  const submit = () => {
    setFormError(null);
    setErrors({});
    const payload: QuoteInput = {
      draft_id: draftId,
      title,
      scope,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      line_items: lineItems,
      tax_enabled: taxEnabled,
      tax_rate: taxRateNum,
      deposit,
      valid_until: validUntil,
      accept_card: acceptCard,
      accept_bank: acceptBank,
      attachments: staged.map((s) => ({
        path: s.path,
        kind: s.kind,
        caption: null,
        duration_seconds: s.duration_seconds,
        is_walkthrough: s.is_walkthrough,
      })),
    };
    startTransition(async () => {
      const res = mode === "create" ? await createQuote(payload) : await updateQuote(draftId, payload);
      if (res && !res.ok) {
        setFormError(res.error);
        setErrors(res.fieldErrors ?? {});
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  // Payment choice shown as three simple options.
  const pctNum = Number(depositPercent) || 0;
  const payMode: "full" | "deposit" | "later" =
    depositType === "percent" && pctNum >= 100 ? "full" : depositType === "percent" && pctNum <= 0 ? "later" : "deposit";
  const setPayMode = (m: "full" | "deposit" | "later") => {
    setDepositType("percent");
    if (m === "full") setDepositPercent("100");
    else if (m === "later") setDepositPercent("0");
    else setDepositPercent(String(defaultDepositPercent > 0 && defaultDepositPercent < 100 ? defaultDepositPercent : 25));
  };
  const currencySymbol = formatMoney(0, currency).replace(/[\d.,\s]/g, "");
  const choice = (active: boolean) =>
    cn(
      "min-h-12 rounded-2xl px-2 text-sm font-semibold whitespace-nowrap ring-1 ring-inset transition sm:px-4 sm:text-[15px]",
      active ? "bg-hivis text-on-accent ring-hivis" : "bg-surface text-ink-soft ring-line hover:text-ink hover:ring-[#b8c3d8]",
    );

  return (
    <div className="space-y-4 pb-40">
      {formError && (
        <p className="rounded-2xl bg-stop-soft p-4 font-medium text-stop ring-1 ring-stop/30 ring-inset" role="alert">
          {formError}
        </p>
      )}


      {/* Job & client */}
      <Card className="grid gap-4 sm:grid-cols-2">
        <Field label="Job" htmlFor="title" error={errors.title}>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New combi boiler"
            maxLength={140}
            aria-invalid={!!errors.title}
          />
        </Field>
        <Field label="Client name" htmlFor="client_name" error={errors.client_name}>
          <Input
            id="client_name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            autoComplete="off"
            placeholder="e.g. Sarah Okafor"
            aria-invalid={!!errors.client_name}
          />
        </Field>
      </Card>

      {/* Items */}
      <Card className="space-y-3">
        <CardTitle>Items</CardTitle>
        {errors.line_items && <p className="text-sm font-medium text-stop">{errors.line_items}</p>}
        <ul className="space-y-3">
          {rows.map((row, idx) => {
            const li = lineItems[idx];
            const err = (f: string) => errors[`line_items.${idx}.${f}`];
            return (
              <li key={row.id} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_4.5rem_8rem_auto] sm:items-center">
                <input
                  value={row.description}
                  onChange={(e) => updateRow(row.id, { description: e.target.value })}
                  placeholder={idx === 0 ? "What's the work? e.g. Supply & fit boiler" : "Another item"}
                  className={cn(inputClass, "sm:col-span-1")}
                  aria-label={`Item ${idx + 1}`}
                  aria-invalid={!!err("description")}
                  maxLength={300}
                />
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length === 1}
                  className="row-span-2 grid size-12 place-items-center self-start rounded-xl text-muted hover:bg-raised disabled:opacity-30 sm:order-last sm:row-span-1"
                  aria-label={`Remove item ${idx + 1}`}
                >
                  <XIcon />
                </button>
                <div className="flex gap-2 sm:contents">
                  <label className="relative w-20 shrink-0 sm:w-auto">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted">×</span>
                    <input
                      value={row.quantity}
                      onChange={(e) => updateRow(row.id, { quantity: e.target.value })}
                      inputMode="decimal"
                      className={cn(inputClass, "pl-7 text-center")}
                      aria-label={`Item ${idx + 1} quantity`}
                      aria-invalid={!!err("quantity")}
                    />
                  </label>
                  <label className="relative min-w-0 flex-1">
                    <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">{currencySymbol}</span>
                    <input
                      value={row.price}
                      onChange={(e) => updateRow(row.id, { price: e.target.value })}
                      inputMode="decimal"
                      placeholder="Price"
                      className={cn(inputClass, "pl-8")}
                      aria-label={`Item ${idx + 1} price`}
                    />
                  </label>
                </div>
                {(li?.quantity ?? 1) !== 1 && (li?.unit_price_cents ?? 0) > 0 && (
                  <p className="tabular col-span-full -mt-1 text-right text-sm text-muted sm:col-span-full">
                    {li?.quantity} × {formatMoney(li?.unit_price_cents ?? 0, currency)} ={" "}
                    {formatMoney(Math.round((li?.quantity ?? 0) * (li?.unit_price_cents ?? 0)), currency)}
                  </p>
                )}
                {(err("description") || err("quantity")) && (
                  <p className="col-span-full text-sm text-stop">{err("description") ?? err("quantity")}</p>
                )}
              </li>
            );
          })}
        </ul>
        <Button variant="ghost" onClick={addRow} className="-ml-2 text-hivis">
          <PlusIcon width={18} height={18} /> Add another item
        </Button>
      </Card>

      {/* Payment */}
      <Card className="space-y-4">
        <CardTitle>When they accept, they pay</CardTitle>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" className={choice(payMode === "full")} onClick={() => setPayMode("full")}>
            Pay in full
          </button>
          <button type="button" className={choice(payMode === "deposit")} onClick={() => setPayMode("deposit")}>
            Deposit
          </button>
          <button type="button" className={choice(payMode === "later")} onClick={() => setPayMode("later")}>
            Pay later
          </button>
        </div>

        {payMode === "deposit" &&
          (depositType === "fixed" ? (
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative w-36">
                <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">{currencySymbol}</span>
                <input
                  value={depositFixed}
                  onChange={(e) => setDepositFixed(e.target.value)}
                  inputMode="decimal"
                  className={cn(inputClass, "pl-8")}
                  aria-label="Deposit amount"
                />
              </label>
              <Button variant="ghost" size="sm" onClick={() => setPayMode("deposit")}>
                Use a % instead
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {["25", "50"].map((p) => (
                <button key={p} type="button" className={cn(choice(pctNum === Number(p)), "min-h-11 px-5")} onClick={() => setDepositPercent(p)}>
                  {p}%
                </button>
              ))}
              <label className="relative w-28">
                <input
                  value={pctNum === 25 || pctNum === 50 ? "" : depositPercent}
                  onChange={(e) => setDepositPercent(e.target.value)}
                  inputMode="decimal"
                  placeholder="Other"
                  className={cn(inputClass, "min-h-11 pr-8")}
                  aria-label="Other deposit percent"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted">%</span>
              </label>
            </div>
          ))}

        {payMode !== "later" && (
          <div className="space-y-2 border-t border-line pt-4">
            <p className="font-semibold">How they can pay</p>
            {!cardReady && !bankReady ? (
              <p className="rounded-xl bg-hivis-soft p-3 text-sm text-ink">
                You haven&apos;t set up how you get paid yet.{" "}
                <a href="/settings#get-paid" className="font-semibold text-hivis underline underline-offset-2">
                  Set it up in 2 minutes
                </a>{" "}
                — until then, the client is told you&apos;ll send payment details.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["Card", cardReady, acceptCard, setAcceptCard],
                    ["Bank transfer", bankReady, acceptBank, setAcceptBank],
                  ] as const
                ).map(([label, ready, on, set]) =>
                  ready ? (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set(!on)}
                      className={cn(choice(on), "flex items-center justify-center gap-2")}
                    >
                      <span className={cn("grid size-5 place-items-center rounded-md ring-1 ring-inset", on ? "bg-white text-hivis ring-white" : "ring-line")}>
                        {on && "✓"}
                      </span>
                      {label}
                    </button>
                  ) : (
                    <a
                      key={label}
                      href="/settings#get-paid"
                      className="flex min-h-12 flex-col items-center justify-center rounded-2xl border border-dashed border-[#c9d2e3] bg-surface px-2 text-center text-sm text-muted hover:text-ink"
                    >
                      <span className="font-semibold">{label}</span>
                      <span className="text-xs">Set up →</span>
                    </a>
                  ),
                )}
              </div>
            )}
            {errors.accept_card && <p className="text-sm font-medium text-stop">{errors.accept_card}</p>}
          </div>
        )}

        <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 border-t border-line pt-4">
          <span className="font-semibold">
            Add {taxLabel} {taxEnabled && <span className="font-normal text-muted">at {taxRate}%</span>}
          </span>
          <input type="checkbox" checked={taxEnabled} onChange={(e) => setTaxEnabled(e.target.checked)} className="peer sr-only" />
          <span aria-hidden className={cn("relative h-7 w-12 shrink-0 rounded-full transition", taxEnabled ? "bg-hivis" : "bg-line")}>
            <span className={cn("absolute top-1 size-5 rounded-full bg-white shadow transition-all", taxEnabled ? "left-6" : "left-1")} />
          </span>
        </label>
      </Card>

      {/* Voice note & photos */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Voice note for your client</CardTitle>
          <span className="rounded-full bg-hivis-soft px-2.5 py-1 text-xs font-semibold text-hivis-ink">Wins more jobs</span>
        </div>
        {walkthroughStaged ? (
          <div className="space-y-2">
            <AudioPlayer src={walkthroughStaged.preview} durationHint={walkthroughStaged.duration_seconds} size="lg" />
            <Button variant="ghost" size="sm" onClick={() => setStaged((s) => s.filter((x) => !x.is_walkthrough))}>
              <TrashIcon width={18} height={18} /> Re-record
            </Button>
          </div>
        ) : walkthroughExisting ? (
          <div className="space-y-2">
            <AudioPlayer src={walkthroughExisting.url} durationHint={walkthroughExisting.duration_seconds} size="lg" />
            <VoiceRecorder onSave={saveWalkthrough} prompt="Record a new one" saveLabel="Replace voice note" />
          </div>
        ) : (
          <>
            <p className="text-sm text-ink-soft">Explain the job in up to 60 seconds, like you would on the doorstep.</p>
            <VoiceRecorder onSave={saveWalkthrough} prompt="Record voice note" />
          </>
        )}

        <div className="space-y-3 border-t border-line pt-4">
          <p className="text-sm font-medium text-muted">Photos or video (optional)</p>
          {existing.length > 0 && (
            <MediaGallery
              items={existing}
              onDelete={async (id) => {
                const res = await deleteAttachment(id);
                if (res.ok) setExisting((e) => e.filter((x) => x.id !== id));
              }}
            />
          )}
          {staged.filter((s) => !s.is_walkthrough).length > 0 && (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {staged
                .filter((s) => !s.is_walkthrough)
                .map((s) => (
                  <li key={s.path} className="relative aspect-square overflow-hidden rounded-xl bg-raised">
                    {s.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.preview} alt="" className="size-full object-cover" />
                    ) : s.kind === "video" ? (
                      <video src={s.preview} muted playsInline className="size-full object-cover" />
                    ) : (
                      <span className="grid size-full place-items-center text-sm">{formatDuration(s.duration_seconds)}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setStaged((list) => list.filter((x) => x.path !== s.path))}
                      className="absolute top-1 right-1 grid size-9 place-items-center rounded-lg bg-white/95 text-stop shadow"
                      aria-label="Remove"
                    >
                      <TrashIcon width={16} height={16} />
                    </button>
                  </li>
                ))}
            </ul>
          )}
          <MediaPicker
            requestUpload={requestUpload}
            onUploaded={(file, preview) => setStaged((s) => [...s, { ...file, preview, duration_seconds: null, is_walkthrough: false }])}
          />
        </div>
      </Card>

      {/* More options (rarely needed) */}
      <div>
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="flex min-h-11 items-center gap-2 px-1 text-sm font-semibold text-muted hover:text-ink"
          aria-expanded={showMore}
        >
          <span className={cn("inline-block transition", showMore && "rotate-90")}>›</span> More options
        </button>
        {showMore && (
          <Card className="mt-2 space-y-4">
            <Field label="Notes for the client" htmlFor="scope" hint="Optional — your voice note can do the explaining.">
              <Textarea id="scope" value={scope} onChange={(e) => setScope(e.target.value)} rows={3} maxLength={5000} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Quote valid until" htmlFor="valid_until" hint="Clients can't accept after this date.">
                <Input id="valid_until" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </Field>
              {taxEnabled && (
                <Field label={`${taxLabel} rate`} htmlFor="tax_rate">
                  <Input id="tax_rate" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} inputMode="decimal" />
                </Field>
              )}
            </div>
            {payMode === "deposit" && depositType === "percent" && (
              <Button variant="ghost" size="sm" className="-ml-2" onClick={() => setDepositType("fixed")}>
                Set the deposit as a fixed amount instead
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Sticky summary */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/90 pb-safe backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 pt-3">
          <div className="min-w-0 flex-1">
            <p className="tabular text-xl leading-tight font-semibold">{formatMoney(totals.total_cents, currency)}</p>
            <p className="tabular truncate text-sm text-muted">
              {payMode === "full"
                ? "Paid in full when accepted"
                : payMode === "later"
                  ? "Nothing to pay upfront"
                  : `${formatMoney(totals.deposit_cents, currency)} deposit when accepted`}
              {taxEnabled ? ` · inc. ${taxLabel}` : ""}
            </p>
          </div>
          <Button size="lg" onClick={submit} disabled={pending} className="shrink-0">
            <LinkIcon width={18} height={18} />
            {pending ? "Saving…" : mode === "create" ? "Create link" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
