"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

export interface User {
  userId: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return data.user;
      } else {
        setUser(null);
        return null;
      }
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load check with smart redirect
  useEffect(() => {
    let isMounted = true;

    async function checkInitialAuth() {
      const currentUser = await fetchUser();
      if (!isMounted) return;

      // Check if this is the first load of the browser session tab
      const hasCheckedInitialRedirect = sessionStorage.getItem("digiroute_initial_checked");

      if (!hasCheckedInitialRedirect) {
        sessionStorage.setItem("digiroute_initial_checked", "true");

        // First time reload / open:
        if (currentUser) {
          // If logged in and landed on public auth or home page, redirect to dashboard
          if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
            router.replace("/dashboard");
          }
        } else {
          // If not logged in and attempted to access protected dashboard, redirect to home
          if (pathname === "/dashboard") {
            router.replace("/");
          }
        }
      }
    }

    checkInitialAuth();

    return () => {
      isMounted = false;
    };
  }, [fetchUser, pathname, router]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    }
    setUser(null);
    router.push("/");
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser: fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
