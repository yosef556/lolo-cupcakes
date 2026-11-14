"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  UserSummary, 
  UserProfile, 
  registerUser, 
  loginUser, 
  getUserProfile, 
  RegisterRequest, 
  LoginRequest,
  UpdateProfileRequest,
  updateUserProfile
} from "@/lib/api";
import { playJoyfulChime } from "@/lib/soundFx";

interface AuthContextType {
  user: UserSummary | null;
  profile: UserProfile | null;
  token: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (reqOrIdentifier: LoginRequest | string, maybePassword?: string) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (req: UpdateProfileRequest) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "lolo_auth_token";
const USER_KEY = "lolo_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        getUserProfile(storedToken)
          .then((p) => {
            setProfile(p);
            setUser({
              id: p.id,
              fullName: p.fullName,
              email: p.email,
              phone: p.phone,
              status: p.status,
              isAdmin: p.isAdmin,
              avatarUrl: p.avatarUrl,
            });
          })
          .catch(() => {
            // Token expired or invalid
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
          });
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (reqOrIdentifier: LoginRequest | string, maybePassword?: string) => {
    const req: LoginRequest =
      typeof reqOrIdentifier === "string"
        ? { identifier: reqOrIdentifier, password: maybePassword || "" }
        : reqOrIdentifier;
    const res = await loginUser(req);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    playJoyfulChime();
    try {
      const p = await getUserProfile(res.token);
      setProfile(p);
      if (p.isAdmin !== undefined) {
        const updated = { ...res.user, isAdmin: p.isAdmin, avatarUrl: p.avatarUrl };
        setUser(updated);
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
      }
    } catch {
      // Ignore
    }
  };

  const register = async (req: RegisterRequest) => {
    const res = await registerUser(req);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    playJoyfulChime();
    try {
      const p = await getUserProfile(res.token);
      setProfile(p);
    } catch {
      // Ignore
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setProfile(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const p = await getUserProfile(token);
      setProfile(p);
      setUser({
        id: p.id,
        fullName: p.fullName,
        email: p.email,
        phone: p.phone,
        status: p.status,
      });
    } catch (e) {
      console.error("Failed to refresh profile", e);
    }
  };

  const updateProfile = async (req: UpdateProfileRequest) => {
    if (!token) throw new Error("يجب تسجيل الدخول أولاً");
    const updated = await updateUserProfile(token, req);
    setProfile(updated);
    setUser({
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      phone: updated.phone,
      status: updated.status,
    });
    localStorage.setItem(USER_KEY, JSON.stringify({
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      phone: updated.phone,
      status: updated.status,
    }));
    playJoyfulChime();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoggedIn: !!user && !!token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
