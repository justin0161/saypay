"use client";

import { useActionState } from "react";
import { updateWorkspace } from "@/actions/workspace";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { formatSortCode } from "@/lib/format";
import type { Workspace } from "@/lib/types";

export function ProfileForm({ workspace: w }: { workspace: Workspace }) {
  const [state, action, pending] = useActionState(updateWorkspace, undefined);
  const e = state?.fieldErrors ?? {};
  // After a rejected save, show what the user typed rather than the saved values.
  const v = (name: string, saved: string) => state?.values?.[name] ?? saved;
  return (
    <form action={action} className="space-y-4">
      <Field label="Business name" htmlFor="business_name" error={e.business_name}>
        <Input id="business_name" name="business_name" defaultValue={v("business_name", w.business_name)} required maxLength={120} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="contact_name" hint="Shown on replies">
          <Input id="contact_name" name="contact_name" defaultValue={v("contact_name", w.contact_name ?? "")} autoComplete="name" />
        </Field>
        <Field label="Trade / tagline" htmlFor="trade">
          <Input id="trade" name="trade" defaultValue={v("trade", w.trade ?? "")} placeholder="Gas Safe · Plumbing & Heating" />
        </Field>
        <Field label="Phone" htmlFor="contact_phone" hint="Clients can tap to call">
          <Input id="contact_phone" name="contact_phone" type="tel" defaultValue={v("contact_phone", w.contact_phone ?? "")} />
        </Field>
        <Field label="Email" htmlFor="contact_email" error={e.contact_email}>
          <Input id="contact_email" name="contact_email" type="email" defaultValue={v("contact_email", w.contact_email ?? "")} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Currency" htmlFor="currency" error={e.currency}>
          <Input id="currency" name="currency" defaultValue={v("currency", w.currency)} maxLength={3} className="uppercase" />
        </Field>
        <Field label="Tax label" htmlFor="tax_label">
          <Input id="tax_label" name="tax_label" defaultValue={v("tax_label", w.tax_label)} maxLength={20} />
        </Field>
        <Field label="Default tax %" htmlFor="default_tax_rate" error={e.default_tax_rate}>
          <Input id="default_tax_rate" name="default_tax_rate" inputMode="decimal" defaultValue={v("default_tax_rate", String(w.default_tax_rate))} />
        </Field>
        <Field label="Default deposit %" htmlFor="default_deposit_percent" error={e.default_deposit_percent}>
          <Input id="default_deposit_percent" name="default_deposit_percent" inputMode="decimal" defaultValue={v("default_deposit_percent", String(w.default_deposit_percent))} />
        </Field>
      </div>
      <Field label="Brand colour" htmlFor="brand_color" error={e.brand_color} hint="Used for the header on your client links">
        <div className="flex items-center gap-3">
          <input
            id="brand_color"
            name="brand_color"
            type="color"
            defaultValue={v("brand_color", w.brand_color)}
            className="h-12 w-16 cursor-pointer rounded-xl border-0 bg-transparent"
          />
          <span className="text-sm text-muted">Pick a dark colour for best contrast.</span>
        </div>
      </Field>
      <fieldset className="space-y-4 rounded-2xl bg-canvas p-4 sm:p-5">
        <legend className="sr-only">Bank transfer</legend>
        <div>
          <p className="font-display text-lg font-bold">Bank transfer</p>
          <p className="mt-0.5 text-sm text-muted">
            Add your account so clients can pay by bank transfer. They only see these details after accepting a quote, with a reference
            for each job.
          </p>
        </div>
        <Field label="Account name" htmlFor="bank_account_name" error={e.bank_account_name}>
          <Input id="bank_account_name" name="bank_account_name" defaultValue={v("bank_account_name", w.bank_account_name ?? "")} maxLength={70} placeholder="Harper & Sons Plumbing Ltd" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Sort code" htmlFor="bank_sort_code" error={e.bank_sort_code}>
            <Input
              id="bank_sort_code"
              name="bank_sort_code"
              inputMode="numeric"
              defaultValue={v("bank_sort_code", w.bank_sort_code ? formatSortCode(w.bank_sort_code) : "")}
              placeholder="12-34-56"
              maxLength={8}
            />
          </Field>
          <Field label="Account number" htmlFor="bank_account_number" error={e.bank_account_number}>
            <Input
              id="bank_account_number"
              name="bank_account_number"
              inputMode="numeric"
              defaultValue={v("bank_account_number", w.bank_account_number ?? "")}
              placeholder="12345678"
              maxLength={8}
            />
          </Field>
        </div>
      </fieldset>
      <Field
        label="Card payment link"
        htmlFor="deposit_link_url"
        error={e.deposit_link_url}
        hint="Optional — only needed if you don't connect Stripe below. E.g. a Stripe Payment Link or SumUp link."
      >
        <Input id="deposit_link_url" name="deposit_link_url" type="url" inputMode="url" defaultValue={v("deposit_link_url", w.deposit_link_url ?? "")} placeholder="https://" />
      </Field>
      {state?.error && <p className="text-sm font-medium text-stop" role="alert">{state.error}</p>}
      {state?.ok && <p className="text-sm font-semibold text-go-ink" role="status">Saved ✓</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
