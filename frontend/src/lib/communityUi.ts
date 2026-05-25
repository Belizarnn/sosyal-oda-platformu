import type { ChannelType, CommunityChannel } from "@/types/community";

export function formatChannelLabel(channel: Pick<CommunityChannel, "name" | "type">): string {
  switch (channel.type) {
    case "VOICE":
      return `🔊 ${channel.name}`;
    case "VIDEO":
      return `📹 ${channel.name}`;
    case "ANNOUNCEMENT":
      return `📢 ${channel.name}`;
    case "WATCH":
      return `# ${channel.name}`;
    case "TEXT":
    case "PRIVATE":
    default:
      return `# ${channel.name}`;
  }
}

export function groupChannelsBySection(channels: CommunityChannel[]) {
  const textLike: CommunityChannel[] = [];
  const voiceLike: CommunityChannel[] = [];

  for (const channel of [...channels].sort((a, b) => a.position - b.position)) {
    if (channel.type === "VOICE" || channel.type === "VIDEO") {
      voiceLike.push(channel);
    } else {
      textLike.push(channel);
    }
  }

  return { textLike, voiceLike };
}

export function findDefaultLandingChannel(channels: CommunityChannel[]): CommunityChannel | null {
  const sorted = [...channels].sort((a, b) => a.position - b.position);
  return (
    sorted.find((channel) => channel.slug === "sohbet") ??
    sorted.find((channel) => channel.slug === "genel") ??
    sorted[0] ??
    null
  );
}

export function channelTypeLabelKey(type: ChannelType): string {
  return `communities.channelTypes.${type.toLowerCase()}`;
}
