import type { Metadata } from "next";
import { AdminReportsView } from "@/components/admin/AdminReportsView";

export const metadata: Metadata = {
  title: "Admin Raporlar",
};

export default function AdminReportsPage() {
  return <AdminReportsView />;
}
