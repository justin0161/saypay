"use client";

import { useState } from "react";
import { Button, type ButtonVariant } from "./ui/button";
import { CheckIcon } from "./ui/icons";

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older iOS / non-secure contexts.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function CopyButton({
  text,
  children,
  variant = "secondary",
  size = "sm",
  className,
}: {
  text: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={async () => {
        if (await copyText(text)) {
          setCopied(true);
          navigator.vibrate?.(10);
          window.setTimeout(() => setCopied(false), 1800);
        }
      }}
    >
      {copied ? (
        <>
          <CheckIcon /> Copied
        </>
      ) : (
        children
      )}
    </Button>
  );
}
