export type AuthProviderType = "google" | "apple" | "email";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  provider: AuthProviderType;
  photoUrl?: string;
  createdAt: string;
}

export interface UserProfile {
  age: string;
  stateOfResidence: string;
  highestEducation: string;
  schoolName: string;
  collegeName: string;
  avatarUrl: string;
  profileCompleted: boolean;
  profileSkipped: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCredentials {
  email: string;
  password: string;
}

export interface StoredEmailAccount {
  password: string;
  user: AuthUser;
}

export interface AuthService {
  getCurrentUser: () => AuthUser | null;
  subscribeAuthState: (listener: (user: AuthUser | null) => void) => () => void;
  signOut: () => Promise<void>;
  signInWithProvider: (
    provider: Exclude<AuthProviderType, "email">,
  ) => Promise<AuthUser>;
  signInWithEmail: (credentials: EmailCredentials) => Promise<AuthUser>;
  signUpWithEmail: (credentials: EmailCredentials) => Promise<AuthUser>;
  getProfile: (userId: string) => Promise<UserProfile | null>;
  saveProfile: (
    userId: string,
    updates: Partial<UserProfile>,
  ) => Promise<UserProfile>;
  ensureProfile: (userId: string) => Promise<UserProfile>;
  uploadAvatar: (userId: string, file: File) => Promise<string>;
}
