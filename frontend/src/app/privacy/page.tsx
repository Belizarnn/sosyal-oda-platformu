import type { Metadata } from "next";
import { PrivacyPageContent } from "@/components/policy/PrivacyPageContent";

export const metadata: Metadata = {
  title: "Gizlilik",
};

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}
