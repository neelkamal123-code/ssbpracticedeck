import lecturetteDocuments from "@/data/ssb/lecturette.json";
import srtDocuments from "@/data/ssb/srt.json";
import tatDocuments from "@/data/ssb/tat.json";
import watDocuments from "@/data/ssb/wat.json";
import type { SsbDataService } from "@/services/ssb/contracts";
import {
  mapLecturetteDocument,
  mapSRTDocument,
  mapTATDocument,
  mapWATDocument,
} from "@/services/ssb/mappers";

export const localSsbDataService: SsbDataService = {
  async getWAT() {
    return watDocuments.map(mapWATDocument);
  },
  async getSRT() {
    return srtDocuments.map(mapSRTDocument);
  },
  async getTAT() {
    return tatDocuments.map(mapTATDocument);
  },
  async getLecturette() {
    return lecturetteDocuments.map(mapLecturetteDocument);
  },
};
