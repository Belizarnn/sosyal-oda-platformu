import type { Metadata } from "next";
import { RegisterPageContent } from "@/components/auth/RegisterPageContent";

export const metadata: Metadata = {
  title: "Kayıt Ol",
};

export default function RegisterPage() {
  return <RegisterPageContent />;
}
