"use client";

import { useState } from "react";
import { CopyButton } from "../copy-button";
import { Button } from "../ui/button";
import { cn } from "../ui/cn";
import { LinkIcon, SendIcon } from "../ui/icons";

/**
 * Send the quote link: copy it, or open the phone's own share sheet (WhatsApp,
 * Messages, email…). Where there's no share sheet, "Share" copies a ready-made
 * message instead.
 */
export function ShareActions({
  url,
  message,
  layout = "compact",
}: {
  url: string;
  message: string;
  /** No longer used: quotes are sent as a link, not to a stored number. */
  phone?: string | null;
  layout?: "compact" | "full";
}) {
  const [note, setNote] = useState<string | null>(null);
  const size = layout === "full" ? "lg" : "md";

  const share = async () => {
    setNote(null);
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ text: message, url });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return; // user closed the sheet
      }
    }
    try {
      await navigator.clipboard.writeText(message);
      setNote("Message copied — paste it into WhatsApp, a text or an email.");
    } catch {
      setNote("Couldn't open sharing — use Copy link instead.");
    }
  };

  return (
    <div>
      <div className={cn("grid gap-2", layout === "full" ? "sm:grid-cols-2" : "grid-cols-2")}>
        <CopyButton text={url} variant={layout === "full" ? "primary" : "secondary"} size={size} className="w-full min-w-0 px-3!">
          <LinkIcon width={18} height={18} /> Copy link
        </CopyButton>
        <Button variant="secondary" size={size} className="w-full min-w-0 px-3!" onClick={share}>
          <SendIcon width={18} height={18} /> Share
        </Button>
      </div>
      {note && (
        <p className="mt-2 text-sm text-ink-soft" role="status">
          {note}
        </p>
      )}
    </div>
  );
}
