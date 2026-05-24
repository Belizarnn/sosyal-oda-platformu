import type { Metadata } from "next";
import { AdminBetaCodesView } from "@/components/admin/AdminBetaCodesView";

export const metadata: Metadata = {
  title: "Admin Beta Kodları",
};

export default function AdminBetaCodesPage() {
  return <AdminBetaCodesView />;
}
