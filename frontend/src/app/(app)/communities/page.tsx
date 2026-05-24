import type { Metadata } from "next";
import { Suspense } from "react";
import { CommunityExplorer } from "@/components/communities/CommunityExplorer";
import { LoadingSpinner } from "@/components/ui/LoadingState";

export const metadata: Metadata = {
  title: "Topluluklar",
};

export default function CommunitiesPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="min-h-[40vh]" />}>
      <CommunityExplorer />
    </Suspense>
  );
}
