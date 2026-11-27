"use client";

import { smsLink, whatsappLink } from "@/lib/share";
import { CopyButton } from "../copy-button";
import { buttonClass } from "../ui/button";
import { cn } from "../ui/cn";
import { ChatIcon, LinkIcon } from "../ui/icons";

/** One-tap share: copy link, copy message, or open WhatsApp / SMS prefilled. */
export function ShareActions({
  url,
  message,
  phone,
  layout = "compact",
}: {
  url: string;
  message: string;
  phone: string | null;
  layout?: "compact" | "full";
}) {
  if (layout === "compact") {
    return (
      <div className="flex gap-2">
        <CopyButton text={url} className="min-w-0 flex-1 px-3!">
          <LinkIcon width={18} height={18} /> Copy link
        </CopyButton>
        <CopyButton text={message} className="min-w-0 flex-1 px-3!">
          <ChatIcon width={18} height={18} /> Copy message
        </CopyButton>
      </div>
    );
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <a href={whatsappLink(phone, message)} target="_blank" rel="noopener noreferrer" className={cn(buttonClass("go", "lg"), "w-full")}>
        <ChatIcon /> Send on WhatsApp
      </a>
      <a href={smsLink(phone, message)} className={cn(buttonClass("primary", "lg"), "w-full")}>
        <ChatIcon /> Send by SMS
      </a>
      <CopyButton text={url} size="lg" className="w-full">
        <LinkIcon /> Copy share link
      </CopyButton>
      <CopyButton text={message} size="lg" className="w-full">
        <ChatIcon /> Copy WhatsApp/SMS message
      </CopyButton>
    </div>
  );
}
