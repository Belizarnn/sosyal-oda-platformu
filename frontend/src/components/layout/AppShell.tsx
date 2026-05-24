"use client";

import { useState } from "react";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { MobileBottomNav } from "./MobileBottomNav";
import { Sidebar } from "./Sidebar";
import { SidebarToggleButton } from "./SidebarToggleButton";
import { Topbar } from "./Topbar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh] bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <SidebarToggleButton
        visible={!sidebarOpen}
        onClick={() => setSidebarOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="mobile-app-main flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
        <MobileBottomNav />
      </div>
      <FeedbackButton />
    </div>
  );
}
