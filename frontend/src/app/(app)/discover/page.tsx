import type { Metadata } from "next";
import { DiscoverExplorer } from "@/components/discover/DiscoverExplorer";

export const metadata: Metadata = {
  title: "Keşfet",
};

export default function DiscoverPage() {
  return <DiscoverExplorer />;
}
