import type { Metadata } from "next";
import { AdminReportDetailView } from "@/components/admin/AdminReportDetailView";

export const metadata: Metadata = {
  title: "Rapor Detayı",
};

export default function AdminReportDetailPage() {
  return <AdminReportDetailView />;
}
