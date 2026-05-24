import type { Metadata } from "next";
import { PremiumSuccessPageContent } from "@/components/premium/PremiumSuccessPageContent";

export const metadata: Metadata = {
  title: "Premium Başarılı",
};

export default function PremiumSuccessPage() {
  return <PremiumSuccessPageContent />;
}
