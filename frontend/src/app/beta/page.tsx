import type { Metadata } from "next";
import { BetaPageContent } from "@/components/policy/BetaPageContent";

export const metadata: Metadata = {
  title: "Beta Programı",
};

export default function BetaPage() {
  return <BetaPageContent />;
}
