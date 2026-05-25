import type { Metadata } from "next";
import { CreateServerWizard } from "@/components/communities/CreateServerWizard";

export const metadata: Metadata = {
  title: "Sunucu Oluştur",
};

export default function CreateCommunityPage() {
  return <CreateServerWizard />;
}
