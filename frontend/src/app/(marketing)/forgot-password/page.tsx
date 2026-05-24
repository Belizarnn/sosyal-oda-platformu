import type { Metadata } from "next";
import { ForgotPasswordPageContent } from "@/components/auth/ForgotPasswordPageContent";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const metadata: Metadata = {
  title: "Şifremi Unuttum",
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 glow-bg" />
      <ForgotPasswordPageContent />
    </div>
  );
}
