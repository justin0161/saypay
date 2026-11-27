"use client";

import { useActionState } from "react";
import { updateWorkspace } from "@/actions/workspace";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import type { Workspace } from "@/lib/types";

export function ProfileForm({ workspace: w }: { workspace: Workspace }) {
  const [state, action, pending] = useActionState(updateWorkspace, undefined);
  const e = state?.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4">
      <Field label="Business name" htmlFor="business_name" error={e.business_name}>
        <Input id="business_name" name="business_name" defaultValue={w.business_name} required maxLength={120} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="contact_name" hint="Shown on replies">
          <Input id="contact_name" name="contact_name" defaultValue={w.contact_name ?? ""} autoComplete="name" />
        </Field>
        <Field label="Trade / tagline" htmlFor="trade">
          <Input id="trade" name="trade" defaultValue={w.trade ?? ""} placeholder="Gas Safe · Plumbing & Heating" />
        </Field>
        <Field label="Phone" htmlFor="contact_phone" hint="Clients can tap to call">
          <Input id="contact_phone" name="contact_phone" type="tel" defaultValue={w.contact_phone ?? ""} />
        </Field>
        <Field label="Email" htmlFor="contact_email" error={e.contact_email}>
          <Input id="contact_email" name="contact_email" type="email" defaultValue={w.contact_email ?? ""} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Currency" htmlFor="currency" error={e.currency}>
          <Input id="currency" name="currency" defaultValue={w.currency} maxLength={3} className="uppercase" />
        </Field>
        <Field label="Tax label" htmlFor="tax_label">
          <Input id="tax_label" name="tax_label" defaultValue={w.tax_label} maxLength={20} />
        </Field>
        <Field label="Default tax %" htmlFor="default_tax_rate" error={e.default_tax_rate}>
          <Input id="default_tax_rate" name="default_tax_rate" inputMode="decimal" defaultValue={String(w.default_tax_rate)} />
        </Field>
        <Field label="Default deposit %" htmlFor="default_deposit_percent" error={e.default_deposit_percent}>
          <Input id="default_deposit_percent" name="default_deposit_percent" inputMode="decimal" defaultValue={String(w.default_deposit_percent)} />
        </Field>
      </div>
      <Field label="Brand colour" htmlFor="brand_color" error={e.brand_color} hint="Used for the header on your client links">
        <div className="flex items-center gap-3">
          <input
            id="brand_color"
            name="brand_color"
            type="color"
            defaultValue={w.brand_color}
            className="h-12 w-16 cursor-pointer rounded-xl border-0 bg-transparent"
          />
          <span className="text-sm text-muted">Pick a dark colour for best contrast.</span>
        </div>
      </Field>
      <Field
        label="Deposit payment link"
        htmlFor="deposit_link_url"
        error={e.deposit_link_url}
        hint="Optional fallback if you don't connect Stripe — e.g. a Stripe Payment Link or PayPal.me"
      >
        <Input id="deposit_link_url" name="deposit_link_url" type="url" inputMode="url" defaultValue={w.deposit_link_url ?? ""} placeholder="https://" />
      </Field>
      {state?.error && <p className="text-sm font-medium text-rose-700" role="alert">{state.error}</p>}
      {state?.ok && <p className="text-sm font-semibold text-go-ink" role="status">Saved ✓</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
