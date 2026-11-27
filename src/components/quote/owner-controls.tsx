"use client";

import { useState, useTransition } from "react";
import { deleteAttachment, deleteQuote, setDepositPaid } from "@/actions/quotes";
import type { MediaItem } from "@/lib/types";
import { MediaGallery } from "../media/media-gallery";
import { Button } from "../ui/button";
import { CheckIcon, TrashIcon } from "../ui/icons";

export function DepositToggle({ quoteId, paid }: { quoteId: string; paid: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <Button
        variant={paid ? "secondary" : "go"}
        className="w-full sm:w-auto"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await setDepositPaid(quoteId, !paid);
            if (!res.ok) setError(res.error);
          })
        }
      >
        {paid ? "Mark deposit as unpaid" : (
          <>
            <CheckIcon width={18} height={18} /> Mark deposit received
          </>
        )}
      </Button>
      {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
    </div>
  );
}

export function DeleteQuoteButton({ quoteId }: { quoteId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  if (!confirming)
    return (
      <Button variant="danger" onClick={() => setConfirming(true)}>
        <TrashIcon width={18} height={18} /> Delete quote
      </Button>
    );
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold">Delete permanently? The client link will stop working.</span>
      <Button
        variant="danger"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await deleteQuote(quoteId);
            if (res && !res.ok) setError(res.error);
          })
        }
      >
        {pending ? "Deleting…" : "Yes, delete"}
      </Button>
      <Button variant="ghost" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
      {error && <p className="w-full text-sm text-rose-700">{error}</p>}
    </div>
  );
}

export function OwnerGallery({ items, locked }: { items: MediaItem[]; locked: boolean }) {
  return (
    <MediaGallery
      items={items}
      emptyText="No photos or videos yet."
      onDelete={
        locked
          ? undefined
          : async (id) => {
              await deleteAttachment(id);
            }
      }
    />
  );
}
