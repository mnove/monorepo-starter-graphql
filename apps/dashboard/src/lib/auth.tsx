import { createContext, ReactNode, useContext } from "react";
import {
  signIn,
  signOut,
  signUp,
  useSession,
  type Session,
} from "./auth-client";

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Session["user"] | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  const value = {
    isAuthenticated: !!session,
    isLoading: isPending,
    user: session?.user || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export these for convenience
export { signIn, signOut, signUp };
