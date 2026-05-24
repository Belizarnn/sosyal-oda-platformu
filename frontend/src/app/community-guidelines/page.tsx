import type { Metadata } from "next";
import { CommunityGuidelinesPageContent } from "@/components/policy/CommunityGuidelinesPageContent";

export const metadata: Metadata = {
  title: "Topluluk Kuralları",
};

export default function CommunityGuidelinesPage() {
  return <CommunityGuidelinesPageContent />;
}
