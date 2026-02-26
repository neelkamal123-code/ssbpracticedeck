import type {
  LecturetteItem,
  SRTItem,
  TATItem,
  WATItem,
} from "@/domain/ssb/types";

export interface SsbDataService {
  getWAT(): Promise<WATItem[]>;
  getSRT(): Promise<SRTItem[]>;
  getTAT(): Promise<TATItem[]>;
  getLecturette(): Promise<LecturetteItem[]>;
}
