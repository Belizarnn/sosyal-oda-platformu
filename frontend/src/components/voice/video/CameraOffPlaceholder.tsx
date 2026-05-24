"use client";

import { Avatar } from "@/components/ui/Avatar";
import { useLanguage } from "@/contexts/LanguageContext";

interface CameraOffPlaceholderProps {
  name: string;
}

export function CameraOffPlaceholder({ name }: CameraOffPlaceholderProps) {
  const { t } = useLanguage();

  return (
    <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2 bg-surface/80 p-4">
      <Avatar name={name} size="md" />
      <p className="truncate text-sm font-medium text-foreground">{name}</p>
      <p className="text-xs text-muted">{t("voice.cameraOff")}</p>
    </div>
  );
}
