import type { Metadata } from "next";
import { LoginPageContent } from "@/components/auth/LoginPageContent";

export const metadata: Metadata = {
  title: "Giriş Yap",
};

export default function LoginPage() {
  return <LoginPageContent />;
}
