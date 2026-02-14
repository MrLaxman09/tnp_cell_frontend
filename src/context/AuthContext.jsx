import { createContext, useContext, useEffect, useState } from "react";
import api from "@/api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // If a token was stored by login, attach it so /auth/me uses it.
      const token = localStorage.getItem("token");
      if (token) {
        api.defaults.headers = api.defaults.headers || {};
        api.defaults.headers.common = api.defaults.headers.common || {};
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      try {
        const res = await api.get("/auth/me", {
          withCredentials: true,
        });

        // ✅ USE EXACT USER FROM BACKEND (no admin trick)
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
        // If token is invalid/expired, remove stored auth flags to avoid retry loops
        if (err.response?.status === 401) {
          localStorage.removeItem("logged_in");
          localStorage.removeItem("token");
          if (api.defaults?.headers?.common) {
            delete api.defaults.headers.common["Authorization"];
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const updateProfile = async (data) => {
    try {
      await api.put("/auth/updatedetails", data, {
        withCredentials: true,
      });

      if (data.password) {
        await api.put(
          "/auth/updatepassword",
          { password: data.password },
          { withCredentials: true }
        );
      }

      const res = await api.get("/auth/me", {
        withCredentials: true,
      });

      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Update failed",
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
