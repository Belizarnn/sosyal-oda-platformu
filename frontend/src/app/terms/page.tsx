import type { Metadata } from "next";
import { TermsPageContent } from "@/components/policy/TermsPageContent";

export const metadata: Metadata = {
  title: "Kullanım Şartları",
};

export default function TermsPage() {
  return <TermsPageContent />;
}
