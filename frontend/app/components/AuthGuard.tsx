"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (!token || !user) {
      router.push("/login");
    } else {
      const userData = JSON.parse(user);
      // Optional: check role matches route
      if (pathname.startsWith("/patient") && userData.role !== "patient") {
        router.push("/doctor/dashboard");
      } else if (pathname.startsWith("/doctor") && userData.role !== "doctor") {
        router.push("/patient/dashboard");
      }
    }
  }, [router, pathname]);

  return <>{children}</>;
}