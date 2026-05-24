import { CommunityHomeRedirect } from "@/components/communities/CommunityHomeRedirect";

interface CommunityPageProps {
  params: Promise<{ communityId: string }>;
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { communityId } = await params;
  return <CommunityHomeRedirect communityId={communityId} />;
}
