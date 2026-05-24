import type { Metadata } from "next";
import { InvitePageClient } from "@/components/invites/InvitePageClient";

interface InvitePageProps {
  params: Promise<{ inviteCode: string }>;
}

export const metadata: Metadata = {
  title: "Oda Daveti",
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { inviteCode } = await params;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-3xl items-center px-4 py-8">
      <InvitePageClient inviteCode={inviteCode} />
    </div>
  );
}
