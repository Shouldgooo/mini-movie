"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken } from "@/lib/api";

export function useGuestPage() {
  const router = useRouter();

  useEffect(() => {
    if (getStoredToken()) {
      router.replace("/my");
    }
  }, [router]);
}
