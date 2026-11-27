"use client";

import { useEffect, useRef, useState } from "react";
import { parseSpokenQuote, type VoiceQuoteDraft } from "@/lib/voice-parse";
import { Button } from "../ui/button";
import { cn } from "../ui/cn";
import { inputClass } from "../ui/field";
import { CheckIcon, MicIcon } from "../ui/icons";

// Minimal typings for the Web Speech API (not in TypeScript's DOM lib).
type SpeechResultEvent = { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionCtor = new () => Recognition;

function getRecognition(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type Phase = "idle" | "listening" | "done" | "blocked";

const nothingFound = (d: VoiceQuoteDraft) => !d.title && !d.client_name && d.line_items.length === 0 && d.vat.enabled == null && !d.payment.type;

/**
 * One-tap voice fill: tap to speak (the browser asks for the microphone at
 * that moment, as part of the tap), tap Done, and the quote fills itself in
 * using the free on-device parser. What was heard can be corrected.
 */
export function VoiceFill({ onFill }: { onFill: (draft: VoiceQuoteDraft) => void }) {
  const [supported, setSupported] = useState(true);
  const [phase, setPhaseState] = useState<Phase>("idle");
  const [heard, setHeard] = useState("");
  const [live, setLive] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const recRef = useRef<Recognition | null>(null);
  const keepGoing = useRef(false); // browsers stop after a pause; restart until Done
  const textRef = useRef(""); // latest final text, readable inside callbacks
  const phaseRef = useRef<Phase>("idle");
  const onFillRef = useRef(onFill);
  onFillRef.current = onFill;

  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };

  useEffect(() => {
    setSupported(Boolean(getRecognition()));
    return () => {
      keepGoing.current = false;
      recRef.current?.abort();
    };
  }, []);

  const apply = (text: string) => {
    const draft = parseSpokenQuote(text);
    if (!text.trim() || nothingFound(draft)) {
      setMessage("I didn't catch a job or any prices. Tap the button and try again — say each item, then its price.");
      setPhase(text.trim() ? "done" : "idle");
      return;
    }
    onFillRef.current(draft);
    setMessage(null);
    setPhase("done");
  };

  const start = () => {
    const Ctor = getRecognition();
    if (!Ctor) return;
    setMessage(null);
    setEditing(false);
    textRef.current = "";
    setHeard("");
    setLive("");
    const rec = new Ctor();
    rec.lang = "en-GB";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let finalPart = "";
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (!r) continue;
        if (r.isFinal) finalPart += r[0].transcript;
        else interim += r[0].transcript;
      }
      if (finalPart) {
        textRef.current = `${textRef.current} ${finalPart}`.replace(/\s+/g, " ").trim();
        setHeard(textRef.current);
      }
      setLive(interim);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        keepGoing.current = false;
        setPhase("blocked");
      }
    };
    rec.onend = () => {
      if (keepGoing.current) {
        try {
          rec.start();
          return;
        } catch {
          /* fall through and finish */
        }
      }
      setLive("");
      // Finished (tapped Done, or the browser stopped): fill in straight away.
      if (phaseRef.current === "listening") apply(textRef.current);
    };
    recRef.current = rec;
    keepGoing.current = true;
    try {
      rec.start();
      setPhase("listening");
    } catch {
      keepGoing.current = false;
      setMessage("Couldn't start the microphone — please try again.");
    }
  };

  const finish = () => {
    keepGoing.current = false;
    recRef.current?.stop(); // onend fills the quote in
  };

  // Browsers without live speech (e.g. Firefox, some in-app browsers): type or use the keyboard's mic.
  if (!supported) {
    return (
      <section className="rounded-card bg-surface p-5 ring-1 ring-line ring-inset sm:p-6">
        <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Fill in by voice</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Tap the box, then the microphone on your keyboard, and say the quote — e.g. &ldquo;Boiler swap for Sarah Okafor. Combi boiler,
          £2,150. Plus VAT. 25% deposit.&rdquo;
        </p>
        <textarea
          className={cn(inputClass, "mt-3 min-h-24")}
          value={heard}
          onChange={(e) => setHeard(e.target.value)}
          placeholder="Tap here, then the microphone on your keyboard"
        />
        {message && <p className="mt-2 text-sm text-stop">{message}</p>}
        {phase === "done" && !message && (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-go-ink">
            <CheckIcon width={15} height={15} strokeWidth={3} /> Filled in below — check it over.
          </p>
        )}
        <Button className="mt-3" onClick={() => apply(heard)} disabled={heard.trim().length < 3}>
          Fill in quote
        </Button>
      </section>
    );
  }

  const listening = phase === "listening";

  return (
    <section
      className={cn("rounded-card p-5 ring-1 ring-inset transition sm:p-6", listening ? "bg-hivis-soft ring-hivis/50" : "bg-surface ring-line")}
    >
      <button
        type="button"
        onClick={listening ? finish : start}
        className={cn(
          "flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl px-5 text-lg font-semibold transition active:scale-[0.99]",
          listening ? "bg-stop text-white" : "bg-hivis text-on-accent hover:bg-[#2549e6]",
        )}
      >
        {listening ? (
          <>
            <span className="relative grid size-7 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
              <span className="size-3 rounded-sm bg-white" />
            </span>
            Done — fill in my quote
          </>
        ) : (
          <>
            <MicIcon width={24} height={24} /> {phase === "done" ? "Speak again" : "Speak your quote"}
          </>
        )}
      </button>

      {listening ? (
        <p className="mt-3 min-h-12 text-[15px] leading-relaxed text-ink" aria-live="polite">
          {heard || live ? (
            <>
              {heard} <span className="text-muted">{live}</span>
            </>
          ) : (
            <span className="text-ink-soft">Listening… say the job, who it&apos;s for, then each item and its price.</span>
          )}
        </p>
      ) : phase === "blocked" ? (
        <div className="mt-3 rounded-xl bg-stop-soft p-3 text-sm text-ink" role="alert">
          <p className="font-semibold">Your phone said no to the microphone.</p>
          <p className="mt-1 text-ink-soft">
            Tap the <span className="font-semibold text-ink">aA</span> or lock icon next to the web address, set{" "}
            <span className="font-semibold text-ink">Microphone</span> to Allow, then tap the button again.
          </p>
        </div>
      ) : phase === "done" ? (
        <div className="mt-3 space-y-2">
          {message ? (
            <p className="text-sm font-medium text-stop" role="alert">
              {message}
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-sm font-medium text-go-ink" role="status">
              <CheckIcon width={15} height={15} strokeWidth={3} /> Filled in below — just check it over.
            </p>
          )}
          {editing ? (
            <div className="space-y-2">
              <textarea className={cn(inputClass, "min-h-24")} value={heard} onChange={(e) => setHeard(e.target.value)} />
              <Button size="sm" onClick={() => apply(heard)}>
                Fill in again
              </Button>
            </div>
          ) : (
            heard && (
              <p className="text-sm text-muted">
                Heard: &ldquo;{heard}&rdquo;{" "}
                <button type="button" onClick={() => setEditing(true)} className="font-semibold text-ink underline underline-offset-2">
                  Fix
                </button>
              </p>
            )
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink-soft">
          {message ?? <>e.g. &ldquo;Boiler swap for Sarah Okafor. Combi boiler, £2,150. Magnetic filter, £120. Plus VAT. 25% deposit.&rdquo;</>}
        </p>
      )}
    </section>
  );
}
