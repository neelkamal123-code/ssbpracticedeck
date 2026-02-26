import type { AuthService } from "@/services/auth/contracts";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { firebaseAuthService } from "@/services/auth/firebase-auth-service";
import { localAuthService } from "@/services/auth/local-auth-service";

export const authService: AuthService = isFirebaseConfigured
  ? firebaseAuthService
  : localAuthService;

export type {
  AuthProviderType,
  AuthUser,
  EmailCredentials,
  UserProfile,
} from "@/services/auth/contracts";
