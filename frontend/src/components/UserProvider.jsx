"use client";

import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const UserContext = createContext({
  user: null,
  loading: true,
  setUser: () => undefined,
  refreshUser: async () => null,
});

export const useUser = () => useContext(UserContext);

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/me", {
        withCredentials: true,
      });
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value = useMemo(
    () => ({ user, loading, setUser, refreshUser }),
    [user, loading, refreshUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
