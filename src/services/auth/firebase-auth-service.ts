import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  type DocumentData,
  type Firestore,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  getFirebaseAuthClient,
  getFirebaseFirestoreClient,
  getFirebaseStorageClient,
} from "@/lib/firebase/client";
import type {
  AuthProviderType,
  AuthService,
  AuthUser,
  EmailCredentials,
  UserProfile,
} from "@/services/auth/contracts";

const PROFILE_COLLECTION = "profiles";
const DEFAULT_AVATAR_URL = "/avatars/default-user.svg";

function nowIso() {
  return new Date().toISOString();
}

function formatNameFromEmail(email?: string | null) {
  if (!email) {
    return "Cadet";
  }

  const localPart = email.split("@")[0] ?? "cadet";
  const words = localPart
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  return words.join(" ") || "Cadet";
}

function normalizeProvider(providerId?: string): AuthProviderType {
  if (providerId === "google.com") {
    return "google";
  }

  if (providerId === "apple.com") {
    return "apple";
  }

  return "email";
}

function createDefaultProfile(): UserProfile {
  const now = nowIso();
  return {
    age: "",
    stateOfResidence: "",
    highestEducation: "",
    schoolName: "",
    collegeName: "",
    avatarUrl: DEFAULT_AVATAR_URL,
    profileCompleted: false,
    profileSkipped: false,
    createdAt: now,
    updatedAt: now,
  };
}

function isProfileCompleted(profile: UserProfile) {
  const ageValue = Number(profile.age);
  const hasValidAge = Number.isFinite(ageValue) && ageValue > 0;
  return (
    hasValidAge &&
    profile.stateOfResidence.trim().length > 0 &&
    profile.highestEducation.trim().length > 0 &&
    profile.schoolName.trim().length > 0 &&
    profile.collegeName.trim().length > 0
  );
}

function mapFirebaseUser(user: User): AuthUser {
  const providerId =
    user.providerData[0]?.providerId ?? user.providerId ?? "password";
  const provider = normalizeProvider(providerId);
  return {
    id: user.uid,
    name: user.displayName || formatNameFromEmail(user.email),
    email: user.email || "unknown@ssb.practice",
    provider,
    photoUrl: user.photoURL ?? DEFAULT_AVATAR_URL,
    createdAt: user.metadata.creationTime
      ? new Date(user.metadata.creationTime).toISOString()
      : nowIso(),
  };
}

function getProfileRef(db: Firestore, userId: string) {
  return doc(db, PROFILE_COLLECTION, userId);
}

function mapProfileDocument(data: DocumentData | undefined): UserProfile | null {
  if (!data) {
    return null;
  }

  const createdAt =
    typeof data.createdAt === "string" ? data.createdAt : nowIso();
  const updatedAt =
    typeof data.updatedAt === "string" ? data.updatedAt : createdAt;

  const profile: UserProfile = {
    age: typeof data.age === "string" ? data.age : "",
    stateOfResidence:
      typeof data.stateOfResidence === "string" ? data.stateOfResidence : "",
    highestEducation:
      typeof data.highestEducation === "string" ? data.highestEducation : "",
    schoolName: typeof data.schoolName === "string" ? data.schoolName : "",
    collegeName: typeof data.collegeName === "string" ? data.collegeName : "",
    avatarUrl: typeof data.avatarUrl === "string" ? data.avatarUrl : DEFAULT_AVATAR_URL,
    profileCompleted: Boolean(data.profileCompleted),
    profileSkipped: Boolean(data.profileSkipped),
    createdAt,
    updatedAt,
  };

  const completed = isProfileCompleted(profile);
  profile.profileCompleted = completed;
  if (completed) {
    profile.profileSkipped = false;
  }

  return profile;
}

async function getProfileInternal(userId: string) {
  const db = getFirebaseFirestoreClient();
  const snapshot = await getDoc(getProfileRef(db, userId));
  return mapProfileDocument(snapshot.data());
}

async function saveProfileInternal(userId: string, updates: Partial<UserProfile>) {
  const db = getFirebaseFirestoreClient();
  const existing = (await getProfileInternal(userId)) ?? createDefaultProfile();
  const nextProfile: UserProfile = {
    ...existing,
    ...updates,
    updatedAt: nowIso(),
  };

  const completed = isProfileCompleted(nextProfile);
  nextProfile.profileCompleted = completed;
  if (completed) {
    nextProfile.profileSkipped = false;
  }

  await setDoc(getProfileRef(db, userId), nextProfile, { merge: true });
  return nextProfile;
}

export const firebaseAuthService: AuthService = {
  getCurrentUser() {
    const currentUser = getFirebaseAuthClient().currentUser;
    return currentUser ? mapFirebaseUser(currentUser) : null;
  },

  subscribeAuthState(listener) {
    const auth = getFirebaseAuthClient();
    return onAuthStateChanged(auth, (user) => {
      listener(user ? mapFirebaseUser(user) : null);
    });
  },

  async signOut() {
    await firebaseSignOut(getFirebaseAuthClient());
  },

  async signInWithProvider(provider) {
    const auth = getFirebaseAuthClient();
    const selectedProvider =
      provider === "google"
        ? new GoogleAuthProvider()
        : new OAuthProvider("apple.com");

    if (provider === "apple") {
      selectedProvider.addScope("email");
      selectedProvider.addScope("name");
    }

    try {
      const credential = await signInWithPopup(auth, selectedProvider);
      return mapFirebaseUser(credential.user);
    } catch (error) {
      console.error("Error during sign-in:", error);
      throw error;
    }
  },

  async signInWithEmail(credentials: EmailCredentials) {
    const auth = getFirebaseAuthClient();
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password.trim();

    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const credential = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(credential.user);
  },

  async signUpWithEmail(credentials: EmailCredentials) {
    const auth = getFirebaseAuthClient();
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password.trim();

    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    if (password.length < 6) {
      throw new Error("Password should be at least 6 characters.");
    }

    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const formattedName = formatNameFromEmail(email);
    await updateProfile(credential.user, { displayName: formattedName });
    return mapFirebaseUser(credential.user);
  },

  async getProfile(userId: string) {
    return getProfileInternal(userId);
  },

  async ensureProfile(userId: string) {
    const existing = await getProfileInternal(userId);
    if (existing) {
      return existing;
    }

    const nextProfile = createDefaultProfile();
    const db = getFirebaseFirestoreClient();
    await setDoc(getProfileRef(db, userId), nextProfile, { merge: true });
    return nextProfile;
  },

  async saveProfile(userId: string, updates: Partial<UserProfile>) {
    return saveProfileInternal(userId, updates);
  },

  async uploadAvatar(userId: string, file: File) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please select an image file.");
    }

    const storage = getFirebaseStorageClient();
    const safeName = file.name.replace(/[^\w.-]+/g, "-").toLowerCase();
    const objectRef = ref(
      storage,
      `avatars/${userId}/${Date.now()}-${safeName || "avatar"}`,
    );
    await uploadBytes(objectRef, file, { contentType: file.type });
    const avatarUrl = await getDownloadURL(objectRef);
    await saveProfileInternal(userId, { avatarUrl });
    return avatarUrl;
  },
};
