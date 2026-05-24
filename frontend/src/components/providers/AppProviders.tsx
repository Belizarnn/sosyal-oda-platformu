"use client";



import { ThemeProvider } from "@/contexts/ThemeContext";

import { LanguageProvider } from "@/contexts/LanguageContext";

import { ToastProvider } from "@/components/ui/ToastProvider";



export function AppProviders({ children }: { children: React.ReactNode }) {

  return (

    <ThemeProvider>

      <LanguageProvider>

        <ToastProvider>{children}</ToastProvider>

      </LanguageProvider>

    </ThemeProvider>

  );

}

