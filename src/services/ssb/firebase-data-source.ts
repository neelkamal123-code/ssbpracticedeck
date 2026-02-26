import type { SsbDataService } from "@/services/ssb/contracts";
import {
  mapLecturetteDocument,
  mapSRTDocument,
  mapTATDocument,
  mapWATDocument,
} from "@/services/ssb/mappers";

export interface FirebaseCollectionReader {
  getCollection(path: string): Promise<unknown[]>;
}

const COLLECTION_PATHS = {
  wat: "ssb/wat/items",
  srt: "ssb/srt/items",
  tat: "ssb/tat/items",
  lecturette: "ssb/lecturette/items",
} as const;

export function createFirebaseSsbDataService(
  reader: FirebaseCollectionReader,
): SsbDataService {
  return {
    async getWAT() {
      const docs = await reader.getCollection(COLLECTION_PATHS.wat);
      return docs.map(mapWATDocument);
    },
    async getSRT() {
      const docs = await reader.getCollection(COLLECTION_PATHS.srt);
      return docs.map(mapSRTDocument);
    },
    async getTAT() {
      const docs = await reader.getCollection(COLLECTION_PATHS.tat);
      return docs.map(mapTATDocument);
    },
    async getLecturette() {
      const docs = await reader.getCollection(COLLECTION_PATHS.lecturette);
      return docs.map(mapLecturetteDocument);
    },
  };
}
