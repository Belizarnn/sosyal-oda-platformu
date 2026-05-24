import { CommunityChannelView } from "@/components/communities/CommunityChannelView";

interface CommunityChannelPageProps {
  params: Promise<{ communityId: string; channelId: string }>;
}

export default async function CommunityChannelPage({ params }: CommunityChannelPageProps) {
  const { communityId, channelId } = await params;
  return <CommunityChannelView communityId={communityId} channelId={channelId} />;
}
