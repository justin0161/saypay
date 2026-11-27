"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { requestLogoUpload, saveLogo } from "@/actions/workspace";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/format";
import { uploadMedia } from "@/lib/upload-client";

export function LogoUploader({ logoUrl, businessName, brandColor }: { logoUrl: string | null; businessName: string; brandColor: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [preview, setPreview] = useState(logoUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const up = await uploadMedia(file, requestLogoUpload);
      const res = await saveLogo(up.path);
      if (!res.ok) throw new Error(res.error);
      setPreview(URL.createObjectURL(file));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl text-lg font-semibold text-white" style={{ backgroundColor: brandColor }}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Logo" className="size-full object-cover" />
        ) : (
          initials(businessName)
        )}
      </div>
      <div>
        <Button variant="secondary" onClick={() => ref.current?.click()} disabled={busy}>
          {busy ? "Uploading…" : preview ? "Change logo" : "Upload logo"}
        </Button>
        <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => void onFile(e.target.files?.[0])} />
        {error && <p className="mt-1 text-sm text-stop">{error}</p>}
      </div>
    </div>
  );
}
