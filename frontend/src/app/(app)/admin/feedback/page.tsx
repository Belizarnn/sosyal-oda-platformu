import type { Metadata } from "next";
import { AdminFeedbackView } from "@/components/admin/AdminFeedbackView";

export const metadata: Metadata = {
  title: "Admin Geri Bildirim",
};

export default function AdminFeedbackPage() {
  return <AdminFeedbackView />;
}
