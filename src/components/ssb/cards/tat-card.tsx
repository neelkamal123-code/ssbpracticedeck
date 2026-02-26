"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  Lock,
  LockOpen,
  Sparkles,
} from "lucide-react";
import type { TATItem } from "@/domain/ssb/types";
import { CardFrame } from "@/components/ssb/cards/card-frame";
import { resolveIcon } from "@/lib/icon-map";
import { UpgradePlansModal } from "@/components/billing/upgrade-plans-modal";
import { SampleModal } from "@/components/ssb/cards/sample-modal";
import { PLAN_UNLOCK_STORAGE_KEY } from "@/lib/billing/plans";

interface TatCardProps {
  item: TATItem;
  index: number;
  total: number;
}

interface TatSampleStory {
  character: string;
  mood: string;
  ageGroup: string;
  theme: string;
  majorAction: string;
  outcome: string;
  story: string;
}

const tat001SampleStories: TatSampleStory[] = [
  {
    character: "Rahul, 22-year-old college student",
    mood: "concerned but hopeful",
    ageGroup: "adult",
    theme: "emotional support and guidance",
    majorAction:
      "Rahul calmly speaks to his upset friend and offers practical help",
    outcome: "She regains confidence and focuses on her preparation",
    story:
      "Rahul, a final-year college student, noticed that his close friend Meera was sitting quietly on the window ledge outside his room. She appeared disturbed after receiving disappointing academic results. Instead of ignoring the situation, Rahul invited her inside and patiently listened to her concerns. He understood that she was anxious about her future and felt she had let her family down. Rahul shared his own experiences of setbacks and explained how temporary failures help in personal growth. He helped her analyze her mistakes and suggested a structured study plan to improve her performance. He also encouraged her to discuss her concerns openly with her parents. With renewed confidence and clarity, Meera decided to work systematically and prepare better for the next attempt. Rahul felt satisfied that he could support his friend during a difficult moment.",
  },
  {
    character: "Amit, 24-year-old civil services aspirant",
    mood: "serious and responsible",
    ageGroup: "adult",
    theme: "resolving misunderstanding",
    majorAction: "Amit communicates openly to clear a misunderstanding",
    outcome: "Mutual understanding is restored",
    story:
      "Amit, a civil services aspirant, was studying in his room when he saw his younger sister sitting outside on the window ledge looking upset. She had misunderstood a recent conversation with their parents regarding career choices and felt unsupported. Observing her body language, Amit realized she was emotionally disturbed. Instead of reacting impulsively, he calmly approached her and initiated a conversation. He listened carefully to her perspective and explained their parents' genuine concern about her stability rather than control. He suggested arranging a family discussion so that everyone could express their thoughts clearly. Through calm communication and maturity, Amit helped reduce her anxiety and misunderstandings. Later that evening, the family had a constructive discussion, and she felt reassured about her career path. Amit felt proud that he handled the situation responsibly and strengthened family harmony.",
  },
  {
    character: "Neha, 21-year-old psychology student",
    mood: "reflective and determined",
    ageGroup: "adult",
    theme: "self-realization and growth",
    majorAction: "Neha reflects on her goals after a disagreement",
    outcome: "She decides to take independent responsibility for her career",
    story:
      "Neha, a psychology student, had a minor disagreement with her classmate Arjun regarding project responsibilities. After the discussion, she sat on the window ledge outside his room, reflecting on the situation. Arjun, noticing her thoughtful silence, observed that she was not angry but introspective. Neha realized that instead of depending on others, she needed to take initiative and improve her leadership skills. She went back inside and discussed the project plan calmly with Arjun. They divided responsibilities clearly and set deadlines. Neha took charge of coordinating team members and ensured timely completion of tasks. The project was later appreciated by their professor for its clarity and teamwork. Through reflection and maturity, Neha transformed a minor conflict into an opportunity for growth and leadership.",
  },
];

const tat002SampleStories: TatSampleStory[] = [
  {
    character: "Rohit, 14-year-old school student",
    mood: "alert and responsible",
    ageGroup: "adolescent",
    theme: "presence of mind and safety awareness",
    majorAction: "Rohit stops his friend from cutting the unsafe branch",
    outcome: "Both boys climb down safely and learn about safety precautions",
    story:
      "Rohit and his friend were playing in a nearby orchard after school. While sitting on a tree branch, his friend began cutting the branch for fun without realizing the risk. Rohit quickly assessed the situation and understood that cutting the branch they were sitting on could lead to serious injury. He immediately stopped his friend and explained the danger. Rohit suggested they climb down safely and instead collect fallen branches from the ground for their project work. After coming down carefully, they discussed basic safety measures while climbing trees. Rohit's timely intervention prevented an accident and both boys learned the importance of thinking before acting.",
  },
  {
    character: "Arjun, 16-year-old NCC cadet",
    mood: "calm and decisive",
    ageGroup: "adolescent",
    theme: "leadership and risk management",
    majorAction: "Arjun guides his friend to safely descend from the tree",
    outcome:
      "They avoid injury and spread awareness about safety among peers",
    story:
      "Arjun and his classmate were attempting to cut a tree branch for a school craft competition. They climbed onto a branch without fully evaluating its strength. As his friend began sawing the branch, Arjun realized the danger of losing balance and falling. Using his training from NCC camps, he calmly instructed his friend to stop cutting and maintain balance. He guided him step by step to descend safely from the tree. After reaching the ground, Arjun explained the importance of planning and ensuring safety before taking any action. Later, he shared the experience with classmates and encouraged them to prioritize safety during outdoor activities.",
  },
  {
    character: "Vikas, 15-year-old village boy",
    mood: "practical and proactive",
    ageGroup: "adolescent",
    theme: "problem-solving and teamwork",
    majorAction: "Vikas suggests a safer method to complete the task",
    outcome: "The boys complete their work safely and efficiently",
    story:
      "Vikas and his cousin climbed a tree to cut a branch needed for fencing their small garden. While sitting on the branch, they started cutting it from the middle without thinking about the consequences. Vikas soon realized that the branch could break suddenly and cause injury. He stopped his cousin and suggested they climb down first and use a ladder and proper tools from home. After arranging the ladder and getting assistance from an elder, they safely cut the branch from the base. Their coordinated effort ensured safety and efficiency. Vikas felt satisfied that he handled the situation wisely and prevented possible harm.",
  },
];

const sampleStoriesByTatId: Record<string, TatSampleStory[]> = {
  tat_001: tat001SampleStories,
  tat_002: tat002SampleStories,
};

const freeSceneByTatId: Record<string, string> = {
  tat_001: "/images/tat/free/001.webp",
  tat_002: "/images/tat/free/002.webp",
};

export function TatCard({ item, index, total }: TatCardProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [planUnlocked, setPlanUnlocked] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(PLAN_UNLOCK_STORAGE_KEY) === "true";
  });
  const [expandedStoryIndex, setExpandedStoryIndex] = useState<number | null>(
    null,
  );
  const [useFallbackScene, setUseFallbackScene] = useState(false);
  const [sceneAspectRatio, setSceneAspectRatio] = useState(16 / 9);
  const Icon = resolveIcon(item.icon);
  const requiresPlanUnlock = item.id === "tat_002" && !planUnlocked;
  const sampleStories = sampleStoriesByTatId[item.id] ?? tat001SampleStories;
  const fallbackSceneSrc = `/tat/${item.id.replace("_", "-")}.svg`;
  const primarySceneSrc = freeSceneByTatId[item.id] ?? fallbackSceneSrc;
  const sceneSrc = useFallbackScene ? fallbackSceneSrc : primarySceneSrc;

  return (
    <CardFrame
      title={item.title}
      Icon={Icon}
      index={index}
      total={total}
      expanded={unlocked}
      hideTitle
      primaryAction={
        <button
          type="button"
          onClick={() => {
            if (requiresPlanUnlock) {
              setShowPlans(true);
              return;
            }
            setUnlocked((value) => !value);
          }}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
            requiresPlanUnlock
              ? "border-amber-200/45 bg-amber-300/14 text-amber-100 hover:bg-amber-300/22"
              : unlocked
              ? "border-emerald-200/45 bg-emerald-300/20 text-emerald-100"
              : "border-white/18 bg-white/[0.04] text-slate-200/90 hover:bg-white/[0.1]"
          }`}
        >
          {requiresPlanUnlock ? (
            <Lock className="h-3.5 w-3.5" />
          ) : unlocked ? (
            <LockOpen className="h-3.5 w-3.5" />
          ) : (
            <Lock className="h-3.5 w-3.5" />
          )}
          {requiresPlanUnlock
            ? "Unlock with Plan"
            : unlocked
              ? "Blur Unlocked"
              : "Unlock Blur"}
        </button>
      }
      extraActions={
        <button
          type="button"
          onClick={() => setShowSamples(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/[0.04] px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-200/90 transition-colors hover:bg-white/[0.1]"
        >
          <Eye className="h-3.5 w-3.5" />
          Sample Stories
        </button>
      }
    >
      <div className="space-y-3">
        <div
          className="relative w-full overflow-hidden rounded-3xl border border-white/12 bg-slate-950/25 transition-all duration-300"
          style={{ aspectRatio: sceneAspectRatio }}
        >
          <motion.img
            src={sceneSrc}
            alt={item.title}
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget;
              if (naturalWidth > 0 && naturalHeight > 0) {
                setSceneAspectRatio(naturalWidth / naturalHeight);
              }
            }}
            onError={() => {
              if (sceneSrc !== fallbackSceneSrc) {
                setUseFallbackScene(true);
              }
            }}
            animate={{
              filter: unlocked ? "blur(0px)" : "blur(12px)",
              scale: 1,
              opacity: unlocked ? 1 : 0.88,
            }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="h-full w-full object-contain object-center"
          />

          <AnimatePresence>
            {!unlocked ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/35 text-center"
              >
                <Sparkles className="h-6 w-6 text-cyan-100" />
                <p className="text-sm text-slate-100">
                  {requiresPlanUnlock
                    ? "This TAT unlock is included in paid plans."
                    : "Blur is locked for first impression practice."}
                </p>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-300/80">
                  {requiresPlanUnlock
                    ? "Tap unlock with plan to view full image"
                    : "Tap Unlock Blur to expand and reveal"}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <SampleModal
        title="TAT Sample Stories"
        subtitle="Simple formats you can relate to and build quickly."
        open={showSamples}
        onClose={() => {
          setShowSamples(false);
          setExpandedStoryIndex(null);
        }}
      >
        <div className="space-y-3">
          {sampleStories.map((story, sampleIndex) => (
            <article
              key={`${story.character}-${sampleIndex}`}
              className="overflow-hidden rounded-2xl border border-white/12 bg-slate-950/25 text-sm text-slate-200/95"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedStoryIndex((current) =>
                    current === sampleIndex ? null : sampleIndex,
                  )
                }
                className="w-full px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">
                    Story {sampleIndex + 1}
                  </p>
                  {expandedStoryIndex === sampleIndex ? (
                    <ChevronDown className="h-4 w-4 text-cyan-100/90" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-cyan-100/90" />
                  )}
                </div>
                <p>
                  <span className="text-slate-300/80">Character:</span>{" "}
                  {story.character}
                </p>
                <p>
                  <span className="text-slate-300/80">Mood:</span> {story.mood}
                </p>
                <p>
                  <span className="text-slate-300/80">Age Group:</span>{" "}
                  {story.ageGroup}
                </p>
                <p>
                  <span className="text-slate-300/80">Theme:</span>{" "}
                  {story.theme}
                </p>
                <p>
                  <span className="text-slate-300/80">Major Action:</span>{" "}
                  {story.majorAction}
                </p>
                <p>
                  <span className="text-slate-300/80">Outcome:</span>{" "}
                  {story.outcome}
                </p>
              </button>
              <AnimatePresence initial={false}>
                {expandedStoryIndex === sampleIndex ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="overflow-hidden border-t border-white/10 bg-slate-900/35"
                  >
                    <p className="px-4 py-3 leading-6 text-slate-100/95">
                      {story.story}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </article>
          ))}
        </div>
      </SampleModal>

      <UpgradePlansModal
        open={showPlans}
        onClose={() => setShowPlans(false)}
        onSuccess={() => {
          setPlanUnlocked(true);
          setUnlocked(true);
        }}
      />
    </CardFrame>
  );
}
