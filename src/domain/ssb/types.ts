export type SsbCategory = "WAT" | "SRT" | "TAT" | "LECTURETTE";

export interface SsbBaseItem {
  id: string;
  title: string;
  icon: string;
  category: SsbCategory;
}

export interface WATItem extends SsbBaseItem {
  category: "WAT";
  suggestions: string[];
}

export interface SRTItem extends SsbBaseItem {
  category: "SRT";
  suggestions: string[];
}

export interface TATAnchors {
  protagonist: string;
  challenge: string;
  action: string;
  positiveOutcome: string;
}

export interface TATItem extends SsbBaseItem {
  category: "TAT";
  anchors: TATAnchors;
}

export interface LecturetteItem extends SsbBaseItem {
  category: "LECTURETTE";
  facts: string[];
  externalLink?: string;
}

export type SsbItem = WATItem | SRTItem | TATItem | LecturetteItem;

export interface SsbSectionPayload {
  wat: WATItem[];
  srt: SRTItem[];
  tat: TATItem[];
  lecturette: LecturetteItem[];
}
