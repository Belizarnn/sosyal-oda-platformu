import type { Metadata } from "next";
import { PremiumCancelPageContent } from "@/components/premium/PremiumCancelPageContent";

export const metadata: Metadata = {
  title: "Premium İptal",
};

export default function PremiumCancelPage() {
  return <PremiumCancelPageContent />;
}
