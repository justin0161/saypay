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
import { MicIcon, PlusIcon, SendIcon, TrashIcon, XIcon } from "../ui/icons";

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
};

const QUICK_ITEMS = ["Labour", "Materials", "Call-out", "Waste removal", "Parts"];

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
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [scope, setScope] = useState(initial?.scope ?? "");
  const [clientName, setClientName] = useState(initial?.client_name ?? "");
  const [clientPhone, setClientPhone] = useState(initial?.client_phone ?? "");
  const [clientEmail, setClientEmail] = useState(initial?.client_email ?? "");
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
  const addRow = (description = "") => setRows((rs) => [...rs, { id: rid(), description, quantity: "1", price: "" }]);
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

  return (
    <div className="space-y-4 pb-40">
      {formError && (
        <p className="rounded-2xl bg-rose-50 p-4 font-medium text-rose-800 ring-1 ring-rose-200 ring-inset" role="alert">
          {formError}
        </p>
      )}

      {/* Job */}
      <Card className="space-y-4">
        <CardTitle>The job</CardTitle>
        <Field label="Job title" htmlFor="title" error={errors.title}>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Replace back bedroom radiator"
            maxLength={140}
            aria-invalid={!!errors.title}
            autoFocus={mode === "create"}
          />
        </Field>
        <Field label="Scope of work" htmlFor="scope" hint="Optional — your voice note can do the explaining.">
          <Textarea id="scope" value={scope} onChange={(e) => setScope(e.target.value)} rows={3} maxLength={5000} />
        </Field>
      </Card>

      {/* Client */}
      <Card className="space-y-4">
        <CardTitle>Client</CardTitle>
        <Field label="Client name" htmlFor="client_name" error={errors.client_name}>
          <Input
            id="client_name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            autoComplete="off"
            placeholder="Priya Shah"
            aria-invalid={!!errors.client_name}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mobile" htmlFor="client_phone" hint="For WhatsApp/SMS sharing" error={errors.client_phone}>
            <Input id="client_phone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} type="tel" inputMode="tel" placeholder="07700 900123" />
          </Field>
          <Field label="Email" htmlFor="client_email" error={errors.client_email}>
            <Input id="client_email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} type="email" inputMode="email" />
          </Field>
        </div>
      </Card>

      {/* Voice walkthrough */}
      <Card className={cn("space-y-4", !hasWalkthrough && "ring-2 ring-hivis")}>
        <div className="flex items-center justify-between">
          <CardTitle>Voice walkthrough</CardTitle>
          <span className="text-xs font-semibold text-muted">Up to 60s</span>
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
            <p className="text-sm text-muted">Record a new one below to replace it.</p>
            <VoiceRecorder onSave={saveWalkthrough} prompt="Record a new walkthrough" saveLabel="Replace walkthrough" />
          </div>
        ) : (
          <>
            <p className="flex gap-2 text-sm text-ink-soft">
              <MicIcon className="shrink-0 text-gold" width={18} height={18} />
              Quotes with a voice note get approved faster. Explain the job like you would on the doorstep.
            </p>
            <VoiceRecorder onSave={saveWalkthrough} prompt="Record walkthrough" />
          </>
        )}
      </Card>

      {/* Line items */}
      <Card className="space-y-4">
        <CardTitle>Line items</CardTitle>
        {errors.line_items && <p className="text-sm font-medium text-rose-700">{errors.line_items}</p>}
        <ul className="space-y-3">
          {rows.map((row, idx) => {
            const li = lineItems[idx];
            const err = (f: string) => errors[`line_items.${idx}.${f}`];
            return (
              <li key={row.id} className="rounded-[6px] bg-canvas p-3 ring-1 ring-line ring-inset">
                <div className="flex gap-2">
                  <input
                    value={row.description}
                    onChange={(e) => updateRow(row.id, { description: e.target.value })}
                    placeholder={`Item ${idx + 1}`}
                    className={cn(inputClass, "flex-1")}
                    aria-label={`Item ${idx + 1} description`}
                    aria-invalid={!!err("description")}
                    maxLength={300}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                    className="grid size-12 shrink-0 place-items-center rounded-xl text-muted hover:bg-white disabled:opacity-30"
                    aria-label={`Remove item ${idx + 1}`}
                  >
                    <XIcon />
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-[5rem_1fr_auto] items-center gap-2">
                  <input
                    value={row.quantity}
                    onChange={(e) => updateRow(row.id, { quantity: e.target.value })}
                    inputMode="decimal"
                    className={cn(inputClass, "text-center")}
                    aria-label="Quantity"
                    aria-invalid={!!err("quantity")}
                  />
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">
                      {formatMoney(0, currency).replace(/[\d.,\s]/g, "")}
                    </span>
                    <input
                      value={row.price}
                      onChange={(e) => updateRow(row.id, { price: e.target.value })}
                      inputMode="decimal"
                      placeholder="Unit price"
                      className={cn(inputClass, "pl-8")}
                      aria-label="Unit price"
                    />
                  </div>
                  <span className="tabular min-w-20 text-right font-semibold">
                    {formatMoney(Math.round((li?.quantity ?? 0) * (li?.unit_price_cents ?? 0)), currency)}
                  </span>
                </div>
                {(err("description") || err("quantity")) && (
                  <p className="mt-1.5 text-sm text-rose-700">{err("description") ?? err("quantity")}</p>
                )}
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => addRow()}>
            <PlusIcon width={18} height={18} /> Add item
          </Button>
          {QUICK_ITEMS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => addRow(q)}
              className="min-h-10 rounded-[5px] bg-surface px-3.5 text-sm font-semibold text-ink-soft ring-[1.5px] ring-ink/15 ring-inset transition hover:text-ink hover:ring-ink"
            >
              + {q}
            </button>
          ))}
        </div>
      </Card>

      {/* Tax & deposit */}
      <Card className="space-y-5">
        <CardTitle>Tax & deposit</CardTitle>
        <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3">
          <span className="font-semibold">Add {taxLabel}</span>
          <span className="flex items-center gap-3">
            {taxEnabled && (
              <span className="relative">
                <input
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  inputMode="decimal"
                  className={cn(inputClass, "w-20 pr-7 text-right")}
                  aria-label={`${taxLabel} rate`}
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted">%</span>
              </span>
            )}
            <input type="checkbox" checked={taxEnabled} onChange={(e) => setTaxEnabled(e.target.checked)} className="peer sr-only" />
            <span
              aria-hidden
              className={cn("relative h-7 w-12 rounded-full transition", taxEnabled ? "bg-ink" : "bg-slate-300")}
            >
              <span className={cn("absolute top-1 size-5 rounded-full bg-white shadow transition-all", taxEnabled ? "left-6" : "left-1")} />
            </span>
          </span>
        </label>

        <div className="space-y-2.5">
          <p className="font-semibold">Deposit to book</p>
          <div className="flex flex-wrap gap-2">
            {["0", "25", "50"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setDepositType("percent");
                  setDepositPercent(p);
                }}
                className={cn(
                  "min-h-11 min-w-16 rounded-[5px] px-4 text-sm font-semibold ring-[1.5px] ring-inset transition",
                  depositType === "percent" && Number(depositPercent) === Number(p) ? "bg-ink text-hivis ring-ink" : "bg-surface ring-ink/15 hover:ring-ink",
                )}
              >
                {p === "0" ? "None" : `${p}%`}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setDepositType("percent")}
              className={cn(
                "min-h-11 rounded-[5px] px-4 text-sm font-semibold ring-[1.5px] ring-inset transition",
                depositType === "percent" && !["0", "25", "50"].includes(String(Number(depositPercent))) ? "bg-ink text-hivis ring-ink" : "bg-surface ring-ink/15 hover:ring-ink",
              )}
            >
              Custom %
            </button>
            <button
              type="button"
              onClick={() => setDepositType("fixed")}
              className={cn("min-h-11 rounded-[5px] px-4 text-sm font-semibold ring-[1.5px] ring-inset transition", depositType === "fixed" ? "bg-ink text-hivis ring-ink" : "bg-surface ring-ink/15 hover:ring-ink")}
            >
              Fixed amount
            </button>
          </div>
          {depositType === "percent" ? (
            <div className="relative w-32">
              <input
                value={depositPercent}
                onChange={(e) => setDepositPercent(e.target.value)}
                inputMode="decimal"
                className={cn(inputClass, "pr-8")}
                aria-label="Deposit percent"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted">%</span>
            </div>
          ) : (
            <Input value={depositFixed} onChange={(e) => setDepositFixed(e.target.value)} inputMode="decimal" placeholder="e.g. 150" className="w-40" aria-label="Deposit amount" />
          )}
        </div>

        <Field label="Quote valid until" htmlFor="valid_until" hint="Optional. Clients can't approve after this date.">
          <Input id="valid_until" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-48" />
        </Field>
      </Card>

      {/* Media */}
      <Card className="space-y-4">
        <CardTitle>Site photos & video</CardTitle>
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
                <li key={s.path} className="relative aspect-square overflow-hidden rounded-xl bg-slate-200">
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
                    className="absolute top-1 right-1 grid size-9 place-items-center rounded-lg bg-white/90 text-rose-700 shadow"
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
          onUploaded={(file, preview) =>
            setStaged((s) => [...s, { ...file, preview, duration_seconds: null, is_walkthrough: false }])
          }
        />
      </Card>

      {/* Sticky summary */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-canvas/95 pb-safe backdrop-blur sm:bottom-0">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 pt-3">
          <div className="min-w-0 flex-1">
            <p className="tabular text-xl leading-tight font-semibold">{formatMoney(totals.total_cents, currency)}</p>
            <p className="tabular truncate text-sm text-muted">
              {taxEnabled ? `inc. ${formatMoney(totals.tax_cents, currency)} ${taxLabel}` : "No tax"}
              {totals.deposit_cents > 0 && ` · ${formatMoney(totals.deposit_cents, currency)} deposit`}
            </p>
          </div>
          <Button variant="hivis" size="lg" onClick={submit} disabled={pending} className="shrink-0">
            <SendIcon width={18} height={18} />
            {pending ? "Saving…" : mode === "create" ? "Create & share" : "Save & re-send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
