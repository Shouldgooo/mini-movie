import { Suspense } from "react";
import DiscoverPage from "@/components/DiscoverPage";

export default function Discover() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16" />
      }
    >
      <DiscoverPage />
    </Suspense>
  );
}
