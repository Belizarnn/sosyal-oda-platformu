import type { Metadata } from "next";
import { RoomDetailView } from "@/components/rooms/RoomDetailView";

interface RoomDetailPageProps {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ invite?: string }>;
}

export const metadata: Metadata = {
  title: "Oda",
};

export default async function RoomDetailPage({
  params,
  searchParams,
}: RoomDetailPageProps) {
  const { roomId } = await params;
  const { invite } = await searchParams;

  return <RoomDetailView roomId={roomId} inviteCodeFromUrl={invite} />;
}
