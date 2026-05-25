"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, listBotLogs, listCommunityBots, updateCommunityBot } from "@/lib/api";
import type { CommunityBot, CommunityBotType } from "@/types/communitySetup";
import { ALL_BOT_TYPES } from "@/types/communitySetup";

interface ServerBotsSettingsProps {
  communityId: string;
  canManage: boolean;
}

export function ServerBotsSettings({ communityId, canManage }: ServerBotsSettingsProps) {
  const { t } = useLanguage();
  const [bots, setBots] = useState<CommunityBot[]>([]);
  const [selectedType, setSelectedType] = useState<CommunityBotType | null>(null);
  const [logs, setLogs] = useState<
    Array<{ id: string; botType: CommunityBotType; action: string; createdAt: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [botsData, logsData] = await Promise.all([
        listCommunityBots(communityId),
        listBotLogs(communityId),
      ]);
      setBots(botsData.bots);
      setLogs(logsData.logs);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("states.error.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [communityId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleToggle(type: CommunityBotType, enabled: boolean) {
    if (!canManage) return;
    setLoading(true);
    try {
      await updateCommunityBot(communityId, type, { enabled });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("states.error.saveFailed"));
    } finally {
      setLoading(false);
    }
  }

  const selectedBot = bots.find((bot) => bot.type === selectedType);

  if (loading && bots.length === 0) {
    return <p className="text-sm text-muted">{t("common.loading")}</p>;
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <p className="text-sm text-muted">{t("communities.bots.settingsDesc")}</p>

      <div className="grid gap-3 lg:grid-cols-2">
        <ul className="space-y-2">
          {ALL_BOT_TYPES.map((type) => {
            const bot = bots.find((item) => item.type === type);
            const enabled = bot?.enabled ?? false;
            return (
              <li
                key={type}
                className={`rounded-xl border px-3 py-2.5 ${
                  selectedType === type ? "border-accent bg-accent-soft/30" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setSelectedType(type)}
                  >
                    <p className="text-sm font-medium">{t(`communities.bots.${type}.name`)}</p>
                    <p className="text-xs text-muted">{t(`communities.bots.${type}.desc`)}</p>
                  </button>
                  {canManage ? (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      disabled={loading}
                      onClick={() => void handleToggle(type, !enabled)}
                      className={`relative mt-1 h-6 w-11 shrink-0 rounded-full ${
                        enabled ? "bg-accent" : "bg-border"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                          enabled ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  ) : (
                    <span className="text-xs text-muted">
                      {enabled ? t("communities.bots.active") : t("communities.bots.inactive")}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="rounded-xl border border-border bg-surface/30 p-3">
          {selectedBot ? (
            <>
              <h3 className="text-sm font-semibold">
                {t(`communities.bots.${selectedBot.type}.name`)}
              </h3>
              <p className="mt-1 text-xs text-muted">
                {t("communities.bots.settingsHint")}
              </p>
              <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-surface p-2 text-[10px] text-muted">
                {JSON.stringify(selectedBot.settings, null, 2)}
              </pre>
            </>
          ) : (
            <p className="text-sm text-muted">{t("communities.bots.selectBot")}</p>
          )}

          <div className="mt-4 border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {t("communities.bots.recentLogs")}
            </p>
            <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-muted">
              {logs.slice(0, 20).map((log) => (
                <li key={log.id} className="rounded bg-surface px-2 py-1">
                  [{log.botType}] {log.action}
                </li>
              ))}
              {logs.length === 0 ? <li>{t("communities.bots.noLogs")}</li> : null}
            </ul>
          </div>
        </div>
      </div>

      {canManage ? (
        <Button variant="secondary" size="sm" onClick={() => void load()} disabled={loading}>
          {t("communities.bots.refresh")}
        </Button>
      ) : null}
    </div>
  );
}
