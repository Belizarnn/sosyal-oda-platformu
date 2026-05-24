import { CommunityInvitePageClient } from "@/components/communities/CommunityInvitePageClient";

interface CommunityInvitePageProps {
  params: Promise<{ inviteCode: string }>;
}

export default async function CommunityInvitePage({ params }: CommunityInvitePageProps) {
  const { inviteCode } = await params;
  return <CommunityInvitePageClient inviteCode={inviteCode} />;
}
