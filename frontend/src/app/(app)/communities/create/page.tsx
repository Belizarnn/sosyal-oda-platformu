import type { Metadata } from "next";
import { CreateCommunityForm } from "@/components/communities/CreateCommunityForm";

export const metadata: Metadata = {
  title: "Topluluk Oluştur",
};

export default function CreateCommunityPage() {
  return <CreateCommunityForm />;
}
