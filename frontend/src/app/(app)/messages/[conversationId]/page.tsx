import type { Metadata } from "next";
import { DMChatPanel } from "@/components/dm/DMChatPanel";

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export const metadata: Metadata = {
  title: "Sohbet",
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;

  return <DMChatPanel conversationId={conversationId} />;
}
