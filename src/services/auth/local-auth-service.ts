import type {
  AuthProviderType,
  AuthService,
  AuthUser,
  EmailCredentials,
  StoredEmailAccount,
  UserProfile,
} from "@/services/auth/contracts";

const CURRENT_USER_KEY = "ssb_auth_current_user";
const EMAIL_ACCOUNTS_KEY = "ssb_auth_email_accounts";
const OAUTH_USERS_KEY = "ssb_auth_oauth_users";
const USER_PROFILES_KEY = "ssb_auth_user_profiles";
const DEFAULT_AVATAR_URL = "/avatars/default-user.svg";

type EmailAccountMap = Record<string, StoredEmailAccount>;
type OAuthUserMap = Partial<Record<Exclude<AuthProviderType, "email">, AuthUser>>;
type UserProfileMap = Record<string, UserProfile>;
type AuthStateListener = (user: AuthUser | null) => void;

const authStateListeners = new Set<AuthStateListener>();

function canUseStorage() {
  return typeof window !== "undefined";
}

function readJSON<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function formatNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "cadet";
  const words = localPart
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  return words.join(" ") || "Cadet";
}

function createUserProfile(): UserProfile {
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

function getCurrentUserStorage() {
  return readJSON<AuthUser | null>(CURRENT_USER_KEY, null);
}

function setCurrentUserStorage(user: AuthUser | null) {
  writeJSON<AuthUser | null>(CURRENT_USER_KEY, user);
  authStateListeners.forEach((listener) => listener(user));
}

function getEmailAccountsStorage() {
  return readJSON<EmailAccountMap>(EMAIL_ACCOUNTS_KEY, {});
}

function setEmailAccountsStorage(accounts: EmailAccountMap) {
  writeJSON(EMAIL_ACCOUNTS_KEY, accounts);
}

function getOAuthUsersStorage() {
  return readJSON<OAuthUserMap>(OAUTH_USERS_KEY, {});
}

function setOAuthUsersStorage(accounts: OAuthUserMap) {
  writeJSON(OAUTH_USERS_KEY, accounts);
}

function getProfilesStorage() {
  return readJSON<UserProfileMap>(USER_PROFILES_KEY, {});
}

function setProfilesStorage(profiles: UserProfileMap) {
  writeJSON(USER_PROFILES_KEY, profiles);
}

function ensureUserProfile(userId: string): UserProfile {
  const profiles = getProfilesStorage();
  const existing = profiles[userId];
  if (existing) {
    return existing;
  }

  const created = createUserProfile();
  profiles[userId] = created;
  setProfilesStorage(profiles);
  return created;
}

function saveUserProfile(userId: string, updates: Partial<UserProfile>) {
  const profiles = getProfilesStorage();
  const base = profiles[userId] ?? createUserProfile();
  const merged: UserProfile = {
    ...base,
    ...updates,
    updatedAt: nowIso(),
  };

  const completed = isProfileCompleted(merged);
  merged.profileCompleted = completed;
  if (completed) {
    merged.profileSkipped = false;
  }

  profiles[userId] = merged;
  setProfilesStorage(profiles);
  return merged;
}

function createProviderUser(provider: Exclude<AuthProviderType, "email">): AuthUser {
  const now = nowIso();
  if (provider === "google") {
    return {
      id: `google_${crypto.randomUUID()}`,
      name: "Google Cadet",
      email: "google.cadet@ssb.practice",
      provider,
      photoUrl: DEFAULT_AVATAR_URL,
      createdAt: now,
    };
  }

  return {
    id: `apple_${crypto.randomUUID()}`,
    name: "Apple Cadet",
    email: "apple.cadet@ssb.practice",
    provider,
    photoUrl: DEFAULT_AVATAR_URL,
    createdAt: now,
  };
}

function dataUrlFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to read selected image."));
      }
    };
    reader.onerror = () => reject(new Error("Unable to read selected image."));
    reader.readAsDataURL(file);
  });
}

export const localAuthService: AuthService = {
  getCurrentUser() {
    return getCurrentUserStorage();
  },

  subscribeAuthState(listener) {
    authStateListeners.add(listener);
    listener(getCurrentUserStorage());

    return () => {
      authStateListeners.delete(listener);
    };
  },

  async signOut() {
    setCurrentUserStorage(null);
  },

  async signInWithProvider(provider) {
    const oauthUsers = getOAuthUsersStorage();
    const existing = oauthUsers[provider];

    if (existing) {
      setCurrentUserStorage(existing);
      ensureUserProfile(existing.id);
      return existing;
    }

    const user = createProviderUser(provider);
    oauthUsers[provider] = user;
    setOAuthUsersStorage(oauthUsers);
    setCurrentUserStorage(user);
    ensureUserProfile(user.id);
    return user;
  },

  async signInWithEmail(credentials: EmailCredentials) {
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password.trim();

    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const accounts = getEmailAccountsStorage();
    const account = accounts[email];
    if (!account || account.password !== password) {
      throw new Error("Invalid email or password.");
    }

    setCurrentUserStorage(account.user);
    ensureUserProfile(account.user.id);
    return account.user;
  },

  async signUpWithEmail(credentials: EmailCredentials) {
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password.trim();

    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    if (password.length < 6) {
      throw new Error("Password should be at least 6 characters.");
    }

    const accounts = getEmailAccountsStorage();
    if (accounts[email]) {
      throw new Error("An account already exists for this email.");
    }

    const user: AuthUser = {
      id: `email_${crypto.randomUUID()}`,
      name: formatNameFromEmail(email),
      email,
      provider: "email",
      photoUrl: DEFAULT_AVATAR_URL,
      createdAt: nowIso(),
    };

    accounts[email] = {
      password,
      user,
    };

    setEmailAccountsStorage(accounts);
    setCurrentUserStorage(user);
    ensureUserProfile(user.id);
    return user;
  },

  async getProfile(userId: string) {
    const profiles = getProfilesStorage();
    return profiles[userId] ?? null;
  },

  async ensureProfile(userId: string) {
    return ensureUserProfile(userId);
  },

  async saveProfile(userId: string, updates: Partial<UserProfile>) {
    return saveUserProfile(userId, updates);
  },

  async uploadAvatar(userId: string, file: File) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please select an image file.");
    }

    const dataUrl = await dataUrlFromFile(file);
    saveUserProfile(userId, { avatarUrl: dataUrl });
    return dataUrl;
  },
};
