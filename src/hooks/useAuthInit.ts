import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/services/authService";

export function useAuthInit() {
  const { setUser, setLoading, isAuthenticated } = useAuthStore();
  const initCalled = useRef(false);

  useEffect(() => {
    // Only run once and skip if already authenticated (from storage)
    if (initCalled.current || isAuthenticated) {
      setLoading(false);
      return;
    }

    initCalled.current = true;

    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      console.log("useAuthInit: checking token", {
        token: !!token,
        isAuthenticated,
      });

      if (!token) {
        console.log("useAuthInit: no token, setting loading false");
        setLoading(false);
        return;
      }

      try {
        console.log("useAuthInit: calling /auth/me");
        const res = await authService.me();
        console.log("useAuthInit: /auth/me response", res);

        if (res.Status && res.ResultOnDb) {
          setUser(res.ResultOnDb);
        } else {
          console.log("useAuthInit: /auth/me failed, clearing user");
          setUser(null);
        }
      } catch (error) {
        console.error("useAuthInit: error", error);
        setUser(null);
      }
    };

    initAuth();
  }, [isAuthenticated, setUser, setLoading]);
}
