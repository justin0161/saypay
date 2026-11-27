"use client";

import { useEffect, useRef, useState } from "react";
import { parseSpokenQuote, type VoiceQuoteDraft } from "@/lib/voice-parse";
import { Button } from "../ui/button";
import { cn } from "../ui/cn";
import { inputClass } from "../ui/field";
import { CheckIcon, MicIcon, SparkleIcon, StopIcon } from "../ui/icons";

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
};
type RecognitionCtor = new () => Recognition;

function getRecognition(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type MicState = "checking" | "ready" | "blocked" | "unavailable";

/**
 * "Fill in by voice": asks for the microphone as soon as the builder opens,
 * transcribes speech live in the browser, then fills the quote using the free
 * on-device parser (no AI, no cost). The user can edit the transcript first.
 */
export function VoiceFill({ onFill }: { onFill: (draft: VoiceQuoteDraft) => void }) {
  const [mic, setMic] = useState<MicState>("checking");
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [filled, setFilled] = useState(false);
  const recRef = useRef<Recognition | null>(null);
  const wantRef = useRef(false); // keep listening through browser auto-stops

  // Ask for microphone access straight away, so recording is one tap later.
  useEffect(() => {
    setSupported(Boolean(getRecognition()));
    if (!navigator.mediaDevices?.getUserMedia) {
      setMic("unavailable");
      return;
    }
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop()); // only needed the permission
        if (!cancelled) setMic("ready");
      })
      .catch(() => !cancelled && setMic("blocked"));
    return () => {
      cancelled = true;
      wantRef.current = false;
      recRef.current?.stop();
    };
  }, []);

  const startListening = () => {
    const Ctor = getRecognition();
    if (!Ctor) return;
    setError(null);
    setFilled(false);
    const rec = new Ctor();
    rec.lang = "en-GB";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let done = "";
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (!r) continue;
        if (r.isFinal) done += r[0].transcript;
        else live += r[0].transcript;
      }
      if (done) setFinalText((t) => `${t} ${done}`.replace(/\s+/g, " ").trimStart());
      setInterim(live);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        wantRef.current = false;
        setMic("blocked");
      } else if (e.error !== "no-speech" && e.error !== "aborted") {
        setError("Couldn't hear that clearly — try again, or type below.");
      }
    };
    rec.onend = () => {
      // Browsers stop after a pause; carry on until the user taps Done.
      if (wantRef.current) {
        try {
          rec.start();
          return;
        } catch {
          /* fall through */
        }
      }
      setListening(false);
      setInterim("");
    };
    recRef.current = rec;
    wantRef.current = true;
    try {
      rec.start();
      setListening(true);
    } catch {
      wantRef.current = false;
      setError("Couldn't start the microphone. Try again, or type below.");
    }
  };

  const stopListening = () => {
    wantRef.current = false;
    recRef.current?.stop();
    setListening(false);
  };

  const transcript = `${finalText} ${interim}`.trim();

  const fill = () => {
    if (listening) stopListening();
    const text = `${finalText} ${interim}`.trim();
    setError(null);
    const draft = parseSpokenQuote(text);
    const found = draft.title || draft.client_name || draft.line_items.length || draft.vat.enabled != null || draft.payment.type;
    if (!found) {
      setFilled(false);
      return setError("I couldn't pick out a job or any prices. Try saying each item followed by its price, like the example.");
    }
    onFill(draft);
    setFilled(true);
  };

  return (
    <section className="relative overflow-hidden rounded-card bg-surface p-5 ring-1 ring-hivis/40 ring-inset sm:p-6">
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(200_255_61/0.14),transparent)]" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold tracking-[-0.03em]">
              <SparkleIcon width={18} height={18} className="text-hivis" /> Fill in by voice
            </h2>
            <p className="mt-1 max-w-lg text-sm text-ink-soft">
              Say the job and who it&apos;s for, then each item followed by its price. Add &ldquo;plus VAT&rdquo; and the deposit if you
              need them.
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
              mic === "ready" ? "bg-go-soft text-go-ink ring-go/30" : mic === "blocked" ? "bg-stop-soft text-stop ring-stop/30" : "bg-raised text-muted ring-line",
            )}
            role="status"
          >
            <span className={cn("size-1.5 rounded-full", mic === "ready" ? "bg-go" : mic === "blocked" ? "bg-stop" : "bg-muted")} />
            {mic === "ready" ? "Microphone on" : mic === "blocked" ? "Microphone blocked" : mic === "checking" ? "Asking for microphone…" : "No microphone"}
          </span>
        </div>

        {mic === "blocked" && (
          <p className="mt-3 text-sm text-ink-soft">
            Allow the microphone for this site in your browser settings (tap the lock or &ldquo;aA&rdquo; icon next to the address), then reload.
            You can also type below.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {supported && mic !== "blocked" && mic !== "unavailable" && (
            listening ? (
              <Button size="lg" variant="danger" onClick={stopListening}>
                <StopIcon width={16} height={16} /> Done talking
              </Button>
            ) : (
              <Button size="lg" onClick={startListening} disabled={mic === "checking"}>
                <MicIcon width={18} height={18} /> {finalText ? "Keep talking" : "Start talking"}
              </Button>
            )
          )}
          {listening && (
            <span className="flex items-center gap-2 text-sm font-medium text-stop">
              <span className="size-2 animate-pulse rounded-full bg-stop" /> Listening…
            </span>
          )}
        </div>

        {!supported && (
          <p className="mt-3 text-sm text-muted">
            Live voice isn&apos;t available in this browser — tap the microphone on your keyboard to dictate into the box below instead.
          </p>
        )}

        <label className="mt-4 block">
          <span className="sr-only">What you said</span>
          <textarea
            className={cn(inputClass, "min-h-28 resize-y")}
            value={listening ? transcript : finalText}
            onChange={(e) => {
              setFinalText(e.target.value);
              setInterim("");
            }}
            readOnly={listening}
            placeholder="e.g. Boiler swap for Sarah Okafor. Combi boiler, £2,150. Magnetic filter, £120. Plus VAT. 25% deposit."
          />
        </label>

        {error && (
          <p className="mt-3 text-sm font-medium text-stop" role="alert">
            {error}
          </p>
        )}
        {filled && !error && (
          <p className="mt-3 flex items-center gap-2 text-sm font-medium text-go-ink" role="status">
            <CheckIcon width={16} height={16} strokeWidth={3} /> Quote filled in below — check the details before sending.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={fill} disabled={transcript.length < 3}>
            <SparkleIcon width={16} height={16} /> Fill in quote
          </Button>
          {finalText && !listening && (
            <Button
              variant="ghost"
              onClick={() => {
                setFinalText("");
                setInterim("");
                setFilled(false);
                setError(null);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
