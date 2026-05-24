import type { Metadata } from "next";
import { AdminDashboardView } from "@/components/admin/AdminDashboardView";

export const metadata: Metadata = {
  title: "Admin Panel",
};

export default function AdminPage() {
  return <AdminDashboardView />;
}
