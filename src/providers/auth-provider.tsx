"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  authService,
  type AuthUser,
  type EmailCredentials,
  type UserProfile,
} from "@/services/auth";

type EmailAuthMode = "sign-in" | "sign-up";

interface ProfileFieldValues {
  age: string;
  stateOfResidence: string;
  highestEducation: string;
  schoolName: string;
  collegeName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  profilePending: boolean;
  shouldPromptOnboarding: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (
    credentials: EmailCredentials,
    mode: EmailAuthMode,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  saveProfileFields: (fields: ProfileFieldValues) => Promise<void>;
  updateProfileFields: (fields: Partial<ProfileFieldValues>) => Promise<void>;
  skipProfileQuestions: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  setShouldPromptOnboarding: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toProfileUpdate(
  values: Partial<ProfileFieldValues>,
): Partial<UserProfile> {
  return {
    age: values.age,
    stateOfResidence: values.stateOfResidence,
    highestEducation: values.highestEducation,
    schoolName: values.schoolName,
    collegeName: values.collegeName,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [shouldPromptOnboarding, setShouldPromptOnboarding] = useState(false);
  const authEventTokenRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = authService.subscribeAuthState(async (nextUser) => {
      const currentToken = ++authEventTokenRef.current;

      if (!mounted) {
        return;
      }

      if (!nextUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const nextProfile =
          (await authService.getProfile(nextUser.id)) ??
          (await authService.ensureProfile(nextUser.id));

        if (!mounted || currentToken !== authEventTokenRef.current) {
          return;
        }

        setUser(nextUser);
        setProfile(nextProfile);
      } catch {
        if (!mounted || currentToken !== authEventTokenRef.current) {
          return;
        }

        setUser(nextUser);
        setProfile(null);
      } finally {
        if (mounted && currentToken === authEventTokenRef.current) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const profilePending = Boolean(user && !profile?.profileCompleted);

  const hydrateUser = useCallback(async (nextUser: AuthUser) => {
    const nextProfile =
      (await authService.getProfile(nextUser.id)) ??
      (await authService.ensureProfile(nextUser.id));
    setShouldPromptOnboarding(!nextProfile.profileCompleted);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const signedInUser = await authService.signInWithProvider("google");
    await hydrateUser(signedInUser);
  }, [hydrateUser]);

  const signInWithApple = useCallback(async () => {
    const signedInUser = await authService.signInWithProvider("apple");
    await hydrateUser(signedInUser);
  }, [hydrateUser]);

  const signInWithEmail = useCallback(
    async (credentials: EmailCredentials, mode: EmailAuthMode) => {
      const signedInUser =
        mode === "sign-up"
          ? await authService.signUpWithEmail(credentials)
          : await authService.signInWithEmail(credentials);

      await hydrateUser(signedInUser);
    },
    [hydrateUser],
  );

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
    setShouldPromptOnboarding(false);
  }, []);

  const saveProfileFields = useCallback(
    async (fields: ProfileFieldValues) => {
      if (!user) {
        return;
      }

      const nextProfile = await authService.saveProfile(user.id, {
        ...toProfileUpdate(fields),
        profileSkipped: false,
      });

      setProfile(nextProfile);
      setShouldPromptOnboarding(false);
    },
    [user],
  );

  const updateProfileFields = useCallback(
    async (fields: Partial<ProfileFieldValues>) => {
      if (!user) {
        return;
      }

      const nextProfile = await authService.saveProfile(user.id, {
        ...toProfileUpdate(fields),
      });
      setProfile(nextProfile);
    },
    [user],
  );

  const skipProfileQuestions = useCallback(async () => {
    if (!user) {
      return;
    }

    const nextProfile = await authService.saveProfile(user.id, {
      profileSkipped: true,
      profileCompleted: false,
    });

    setProfile(nextProfile);
    setShouldPromptOnboarding(false);
  }, [user]);

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!user) {
        return;
      }

      await authService.uploadAvatar(user.id, file);
      const nextProfile = await authService.getProfile(user.id);
      if (nextProfile) {
        setProfile(nextProfile);
      }
    },
    [user],
  );

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      profilePending,
      shouldPromptOnboarding,
      signInWithGoogle,
      signInWithApple,
      signInWithEmail,
      signOut,
      saveProfileFields,
      updateProfileFields,
      skipProfileQuestions,
      uploadAvatar,
      setShouldPromptOnboarding,
    }),
    [
      loading,
      profile,
      profilePending,
      saveProfileFields,
      shouldPromptOnboarding,
      signInWithApple,
      signInWithEmail,
      signInWithGoogle,
      signOut,
      skipProfileQuestions,
      updateProfileFields,
      uploadAvatar,
      user,
    ],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

export type { EmailAuthMode, ProfileFieldValues };
