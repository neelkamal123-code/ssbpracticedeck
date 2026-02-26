"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CircleDot,
  Download,
  Lock,
  Mic,
  Pause,
  Play,
  Sparkles,
  Square,
  Trash2,
} from "lucide-react";
import type { LecturetteItem } from "@/domain/ssb/types";
import { CardFrame } from "@/components/ssb/cards/card-frame";
import { resolveIcon } from "@/lib/icon-map";
import { UpgradePlansModal } from "@/components/billing/upgrade-plans-modal";
import { PLAN_UNLOCK_STORAGE_KEY } from "@/lib/billing/plans";

interface LecturetteCardProps {
  item: LecturetteItem;
  index: number;
  total: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const MAX_RECORD_SECONDS = 60;

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function LecturetteCard({
  item,
  index,
  total,
  onSwipeLeft,
  onSwipeRight,
}: LecturetteCardProps) {
  const [planUnlocked, setPlanUnlocked] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(PLAN_UNLOCK_STORAGE_KEY) === "true";
  });
  const [showPlans, setShowPlans] = useState(false);
  const [open, setOpen] = useState(false);
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(MAX_RECORD_SECONDS);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const countdownIntervalRef = useRef<number | null>(null);
  const autoStopTimeoutRef = useRef<number | null>(null);

  const Icon = resolveIcon(item.icon);
  const requiresPlanUnlockForRecorder = !planUnlocked;
  const elapsedRatio =
    (MAX_RECORD_SECONDS - remainingSeconds) / MAX_RECORD_SECONDS;

  const clearCountdowns = () => {
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (autoStopTimeoutRef.current !== null) {
      window.clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
  };

  const stopMediaStream = () => {
    if (!mediaStreamRef.current) {
      return;
    }

    mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const resetRecordingState = () => {
    clearCountdowns();
    setIsRecording(false);
    setRemainingSeconds(MAX_RECORD_SECONDS);
  };

  const stopRecording = () => {
    clearCountdowns();

    const recorder = mediaRecorderRef.current;
    if (!recorder) {
      stopMediaStream();
      setIsRecording(false);
      return;
    }

    if (recorder.state === "recording") {
      recorder.stop();
      return;
    }

    stopMediaStream();
    setIsRecording(false);
  };

  const startRecording = async () => {
    if (requiresPlanUnlockForRecorder) {
      setShowPlans(true);
      return;
    }

    setRecordingError(null);
    setRecorderOpen(true);

    if (isRecording) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordingError("Microphone access is not supported in this browser.");
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      setRecordingError("Media recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setIsPlaying(false);
      setRemainingSeconds(MAX_RECORD_SECONDS);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setRecordingError("Recording failed. Please try again.");
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const nextAudioUrl = URL.createObjectURL(blob);
        setAudioUrl(nextAudioUrl);
        resetRecordingState();
        stopMediaStream();
      };

      recorder.start(250);
      setIsRecording(true);

      countdownIntervalRef.current = window.setInterval(() => {
        setRemainingSeconds((current) => (current > 0 ? current - 1 : 0));
      }, 1000);

      autoStopTimeoutRef.current = window.setTimeout(() => {
        stopRecording();
      }, MAX_RECORD_SECONDS * 1000);
    } catch {
      stopMediaStream();
      setRecordingError("Microphone permission denied. Please allow access.");
    }
  };

  const toggleAudioPlayback = async () => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setRecordingError("Unable to play recording on this device.");
    }
  };

  const deleteRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsPlaying(false);
    setAudioUrl(null);
    setRecordingError(null);
    setRemainingSeconds(MAX_RECORD_SECONDS);
  };

  useEffect(() => {
    const syncPlanState = () => {
      setPlanUnlocked(
        window.localStorage.getItem(PLAN_UNLOCK_STORAGE_KEY) === "true",
      );
    };

    syncPlanState();
    window.addEventListener("ssb:plan-unlocked", syncPlanState);
    return () => {
      window.removeEventListener("ssb:plan-unlocked", syncPlanState);
    };
  }, []);

  useEffect(() => {
    return () => {
      clearCountdowns();
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      stopMediaStream();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <CardFrame
      title={item.title}
      Icon={Icon}
      index={index}
      total={total}
      expanded={open || recorderOpen}
      onSwipeLeft={onSwipeLeft}
      onSwipeRight={onSwipeRight}
      primaryAction={
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
            open
              ? "border-cyan-200/45 bg-cyan-300/20 text-cyan-100"
              : "border-white/18 bg-white/[0.04] text-slate-200/90 hover:bg-white/[0.1]"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Explore More
        </button>
      }
      extraActions={
        <button
          type="button"
          onClick={() => {
            if (requiresPlanUnlockForRecorder) {
              setShowPlans(true);
              return;
            }
            setRecorderOpen((current) => !current || isRecording);
          }}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
            requiresPlanUnlockForRecorder
              ? "border-amber-200/45 bg-amber-300/14 text-amber-100 hover:bg-amber-300/22"
              : "border-rose-300/52 bg-rose-400/18 text-rose-100 shadow-[0_0_16px_rgba(251,113,133,0.2)] hover:bg-rose-400/26"
          }`}
        >
          {requiresPlanUnlockForRecorder ? (
            <Lock className="h-3.5 w-3.5" />
          ) : (
            <CircleDot className="h-3.5 w-3.5 text-rose-200" />
          )}
          {requiresPlanUnlockForRecorder ? "Record with Plan" : "Record"}
        </button>
      }
      chips={item.externalLink ? [{ label: "Read more", href: item.externalLink }] : []}
    >
      <AnimatePresence initial={false}>
        {open ? (
          <motion.ul
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="space-y-3"
          >
            {item.facts.map((fact) => (
              <li
                key={fact}
                className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3 text-sm text-slate-200/95"
              >
                {fact}
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {recorderOpen ? (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`${open ? "mt-4" : "mt-2"} rounded-2xl border border-rose-200/24 bg-slate-950/32 p-4`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-rose-100/82">
                  Lecturette Recorder
                </p>
                <p className="mt-1 text-sm text-slate-200/88">
                  Record for up to {formatSeconds(MAX_RECORD_SECONDS)}.
                </p>
              </div>
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                  isRecording
                    ? "border-rose-200/55 bg-rose-400/24 text-rose-100"
                    : "border-slate-200/25 bg-slate-200/8 text-slate-200/80"
                }`}
              >
                <CircleDot className={`h-4 w-4 ${isRecording ? "animate-pulse" : ""}`} />
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={false}
                animate={{ width: `${Math.max(0, Math.min(1, elapsedRatio)) * 100}%` }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-rose-300/85 to-red-400/85"
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs uppercase tracking-[0.14em]">
              <span className="text-slate-300/78">
                {isRecording ? "Recording" : "Ready"}
              </span>
              <span className="font-semibold text-rose-100">
                {formatSeconds(remainingSeconds)}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/55 bg-rose-400/24 px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-rose-100 transition-colors hover:bg-rose-400/34"
                >
                  <Square className="h-3.5 w-3.5" />
                  Stop
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/50 bg-rose-400/18 px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-rose-100 transition-colors hover:bg-rose-400/28"
                >
                  <Mic className="h-3.5 w-3.5" />
                  Start {formatSeconds(MAX_RECORD_SECONDS)}
                </button>
              )}

              {audioUrl ? (
                <>
                  <button
                    type="button"
                    onClick={toggleAudioPlayback}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-100 transition-colors hover:bg-white/[0.12]"
                  >
                    {isPlaying ? (
                      <Pause className="h-3.5 w-3.5" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    {isPlaying ? "Pause" : "Play"}
                  </button>

                  <a
                    href={audioUrl}
                    download={`lecturette-${item.id}.webm`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-100 transition-colors hover:bg-white/[0.12]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </>
              ) : null}
            </div>

            {recordingError ? (
              <p className="mt-3 rounded-xl border border-rose-300/35 bg-rose-400/12 px-3 py-2 text-xs text-rose-100">
                {recordingError}
              </p>
            ) : null}

            {audioUrl ? (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={deleteRecording}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-300/58 bg-rose-500/18 text-rose-100 shadow-[0_0_18px_rgba(244,63,94,0.45),inset_0_0_10px_rgba(244,63,94,0.22)] transition-colors hover:bg-rose-500/28"
                  aria-label="Delete recording"
                  title="Delete recording"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : null}

            <audio
              ref={audioRef}
              src={audioUrl ?? undefined}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </motion.section>
        ) : null}
      </AnimatePresence>

      <UpgradePlansModal
        open={showPlans}
        onClose={() => setShowPlans(false)}
        onSuccess={() => {
          setPlanUnlocked(true);
          setShowPlans(false);
          setRecorderOpen(true);
        }}
      />
    </CardFrame>
  );
}
