import type { Metadata } from "next";
import { PremiumPageContent } from "@/components/premium/PremiumPageContent";

export const metadata: Metadata = {
  title: "Premium",
};

export default function PremiumPage() {
  return <PremiumPageContent />;
}
