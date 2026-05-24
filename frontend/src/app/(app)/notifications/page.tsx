import type { Metadata } from "next";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

export const metadata: Metadata = {
  title: "Bildirimler",
};

export default function NotificationsPage() {
  return <NotificationCenter />;
}
