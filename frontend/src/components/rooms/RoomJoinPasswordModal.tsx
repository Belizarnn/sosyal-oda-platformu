"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";

interface RoomJoinPasswordModalProps {
  open: boolean;
  roomName: string;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (password: string) => void;
}

export function RoomJoinPasswordModal({
  open,
  roomName,
  loading = false,
  error = null,
  onClose,
  onSubmit,
}: RoomJoinPasswordModalProps) {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");

  if (!open) {
    return null;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(password);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("common.close")}
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-dropdown p-6 shadow-[0_0_60px_var(--glow)]">
        <h2 className="text-lg font-semibold">{t("rooms.passwordRequired")}</h2>
        <p className="mt-1 text-sm text-muted">
          {t("rooms.passwordRequiredDesc", { name: roomName })}
        </p>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <Input
            label={t("rooms.passwordLabel")}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={4}
            autoFocus
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? t("rooms.joining") : t("rooms.join")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
