import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";

const AuthContext = createContext(null);
const TOKEN_KEY = "gcms_token";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsReady(true);
      return;
    }
    apiFetch("/auth/me", { token })
      .then((data) => setCurrentUser(data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsReady(true));
  }, []);

  const login = async ({ identifier, password }) => {
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: { identifier, password }
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      setCurrentUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const loginStaff = async ({ username, password }) => {
    try {
      const data = await apiFetch("/auth/staff-login", {
        method: "POST",
        body: { username, password }
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      setCurrentUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const registerCitizen = async ({ name, cnic, email, password }) => {
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: { name, cnic, email, password }
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      setCurrentUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setCurrentUser(null);
  };

  const value = useMemo(
    () => ({
      currentUser,
      isReady,
      login,
      loginStaff,
      registerCitizen,
      logout
    }),
    [currentUser, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
