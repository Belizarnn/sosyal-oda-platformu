"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

interface LocalVideoPreviewProps {
  active: boolean;
  onStart: (videoElement: HTMLVideoElement) => void;
  onStop: () => void;
  className?: string;
}

export function LocalVideoPreview({
  active,
  onStart,
  onStop,
  className,
}: LocalVideoPreviewProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      onStop();
    };
  }, [onStop]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="overflow-hidden rounded-xl border border-border bg-black/40">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="aspect-video w-full object-cover"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={active}
          onClick={() => {
            if (videoRef.current) {
              void onStart(videoRef.current);
            }
          }}
        >
          {t("voice.previewStart")}
        </Button>
        <Button size="sm" variant="secondary" disabled={!active} onClick={onStop}>
          {t("voice.previewStop")}
        </Button>
      </div>
    </div>
  );
}
