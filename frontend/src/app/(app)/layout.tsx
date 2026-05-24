import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { VoiceProvider } from "@/contexts/VoiceContext";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <VoiceProvider>
        <AppShell>{children}</AppShell>
      </VoiceProvider>
    </ProtectedRoute>
  );
}
