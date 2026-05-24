import type { Metadata } from "next";
import { ProfileView } from "@/components/profile/ProfileView";

interface ProfilePageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { handle } = await params;
  return { title: `@${handle}` };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params;
  return <ProfileView handle={handle} />;
}
