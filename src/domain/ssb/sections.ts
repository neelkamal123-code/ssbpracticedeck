import type { SsbCategory } from "@/domain/ssb/types";

export type SectionKey = "wat" | "srt" | "tat" | "lecturette";

export interface SectionDefinition {
  key: SectionKey;
  category: SsbCategory;
  label: string;
  subtitle: string;
}

export const sectionDefinitions: SectionDefinition[] = [
  {
    key: "wat",
    category: "WAT",
    label: "WAT",
    subtitle: "Word Association Test",
  },
  {
    key: "srt",
    category: "SRT",
    label: "SRT",
    subtitle: "Situation Reaction Test",
  },
  {
    key: "tat",
    category: "TAT",
    label: "TAT",
    subtitle: "Thematic Apperception Test",
  },
  {
    key: "lecturette",
    category: "LECTURETTE",
    label: "Lecturette",
    subtitle: "Quick topic briefing prompts",
  },
];
