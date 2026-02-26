import type { SsbDataService } from "@/services/ssb/contracts";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { createFirebaseSsbDataService } from "@/services/ssb/firebase-data-source";
import { localSsbDataService } from "@/services/ssb/local-data-source";

const SECTION_ITEM_LIMITS = {
  wat: 4,
  srt: 3,
  tat: 2,
  lecturette: 2,
} as const;

let activeDataService: SsbDataService = localSsbDataService;
let firebaseServicePromise: Promise<SsbDataService | null> | null = null;

export function setSsbDataService(service: SsbDataService) {
  activeDataService = service;
}

async function getFirebaseDataService(): Promise<SsbDataService | null> {
  if (typeof window === "undefined" || !isFirebaseConfigured) {
    return null;
  }

  if (firebaseServicePromise) {
    return firebaseServicePromise;
  }

  firebaseServicePromise = (async () => {
    const [{ collection, getDocs }, { getFirebaseFirestoreClient }] =
      await Promise.all([
        import("firebase/firestore"),
        import("@/lib/firebase/client"),
      ]);

    const db = getFirebaseFirestoreClient();
    return createFirebaseSsbDataService({
      async getCollection(path: string) {
        const snapshot = await getDocs(collection(db, path));
        return snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));
      },
    });
  })();

  return firebaseServicePromise;
}

async function getActiveDataService() {
  const firebaseService = await getFirebaseDataService();
  return firebaseService ?? activeDataService;
}

function limitItems<T>(items: T[], limit: number) {
  return items.slice(0, limit);
}

export async function getWAT() {
  const service = await getActiveDataService();
  try {
    const items = await service.getWAT();
    if (service !== activeDataService && items.length === 0) {
      return limitItems(await activeDataService.getWAT(), SECTION_ITEM_LIMITS.wat);
    }
    return limitItems(items, SECTION_ITEM_LIMITS.wat);
  } catch {
    if (service !== activeDataService) {
      return limitItems(await activeDataService.getWAT(), SECTION_ITEM_LIMITS.wat);
    }
    throw new Error("Unable to load WAT items.");
  }
}

export async function getSRT() {
  const service = await getActiveDataService();
  try {
    const items = await service.getSRT();
    if (service !== activeDataService && items.length === 0) {
      return limitItems(await activeDataService.getSRT(), SECTION_ITEM_LIMITS.srt);
    }
    return limitItems(items, SECTION_ITEM_LIMITS.srt);
  } catch {
    if (service !== activeDataService) {
      return limitItems(await activeDataService.getSRT(), SECTION_ITEM_LIMITS.srt);
    }
    throw new Error("Unable to load SRT items.");
  }
}

export async function getTAT() {
  const service = await getActiveDataService();
  try {
    const items = await service.getTAT();
    if (service !== activeDataService && items.length === 0) {
      return limitItems(await activeDataService.getTAT(), SECTION_ITEM_LIMITS.tat);
    }
    return limitItems(items, SECTION_ITEM_LIMITS.tat);
  } catch {
    if (service !== activeDataService) {
      return limitItems(await activeDataService.getTAT(), SECTION_ITEM_LIMITS.tat);
    }
    throw new Error("Unable to load TAT items.");
  }
}

export async function getLecturette() {
  const service = await getActiveDataService();
  try {
    const items = await service.getLecturette();
    if (service !== activeDataService && items.length === 0) {
      return limitItems(
        await activeDataService.getLecturette(),
        SECTION_ITEM_LIMITS.lecturette,
      );
    }
    return limitItems(items, SECTION_ITEM_LIMITS.lecturette);
  } catch {
    if (service !== activeDataService) {
      return limitItems(
        await activeDataService.getLecturette(),
        SECTION_ITEM_LIMITS.lecturette,
      );
    }
    throw new Error("Unable to load Lecturette items.");
  }
}
