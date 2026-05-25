"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ApiError,
  completeCommunitySetup,
  createCommunity,
  saveSetupBots,
  saveSetupChannels,
} from "@/lib/api";
import { findDefaultLandingChannel } from "@/lib/communityUi";
import {
  ALL_BOT_TYPES,
  DEFAULT_SELECTED_BOTS,
  DEFAULT_SELECTED_CHANNELS,
  type ChannelTemplateKey,
  type CommunityBotType,
} from "@/types/communitySetup";
import type { CommunityVisibility } from "@/types/community";

type WizardStep = "basic" | "channels" | "bots" | "summary";

const VISIBILITIES: CommunityVisibility[] = ["PUBLIC", "INVITE_ONLY", "PRIVATE"];

const CHANNEL_ORDER: ChannelTemplateKey[] = [
  "announcements",
  "rules",
  "complaint",
  "chat",
  "watch",
  "voice",
  "video",
  "ticket",
  "stats",
  "logs",
];

const CHANNEL_LABELS: Record<ChannelTemplateKey, string> = {
  announcements: "# duyurular",
  rules: "# kurallar",
  complaint: "# şikayet",
  chat: "# sohbet",
  watch: "# birlikte-izle",
  voice: "🔊 Genel Ses",
  video: "🎥 Görüntülü Sohbet",
  ticket: "🎫 ticket-destek",
  stats: "📊 sunucu-istatistik",
  logs: "📝 log-kayıtları",
};

export function CreateServerWizard() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState<WizardStep>("basic");
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<CommunityVisibility>("PUBLIC");
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<ChannelTemplateKey[]>(
    DEFAULT_SELECTED_CHANNELS,
  );
  const [selectedBots, setSelectedBots] =
    useState<Record<CommunityBotType, boolean>>(DEFAULT_SELECTED_BOTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleChannel(key: ChannelTemplateKey) {
    setSelectedChannels((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  }

  function toggleBot(type: CommunityBotType) {
    setSelectedBots((prev) => ({ ...prev, [type]: !prev[type] }));
  }

  async function handleBasicNext(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await createCommunity({ name: name.trim(), visibility });
      setCommunityId(result.community.id);
      setStep("channels");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("communities.createFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleChannelsNext() {
    if (!communityId || selectedChannels.length === 0) {
      setError(t("communities.wizard.channelsRequired"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await saveSetupChannels(communityId, selectedChannels);
      setStep("bots");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("states.error.saveFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleBotsNext() {
    if (!communityId) return;
    setLoading(true);
    setError(null);
    try {
      await saveSetupBots(communityId, selectedBots);
      setStep("summary");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("states.error.saveFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    if (!communityId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await completeCommunitySetup(communityId);
      const landing = findDefaultLandingChannel(result.channels);
      if (landing) {
        router.push(`/communities/${communityId}/channels/${landing.id}`);
      } else {
        router.push(`/communities/${communityId}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("communities.wizard.completeFailed"));
    } finally {
      setLoading(false);
    }
  }

  const steps: WizardStep[] = ["basic", "channels", "bots", "summary"];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{t("communities.wizard.title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("communities.wizard.subtitle")}</p>
      </div>

      <ol className="flex flex-wrap gap-2 text-xs">
        {steps.map((item, index) => (
          <li
            key={item}
            className={`rounded-full px-3 py-1 ${
              step === item
                ? "bg-accent-soft font-medium text-foreground"
                : "bg-surface text-muted"
            }`}
          >
            {index + 1}. {t(`communities.wizard.steps.${item}`)}
          </li>
        ))}
      </ol>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {step === "basic" && (
        <form className="space-y-4" onSubmit={(event) => void handleBasicNext(event)}>
          <Input
            label={t("communities.form.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("communities.form.namePlaceholder")}
            required
          />
          <fieldset className="space-y-2">
            <legend className="text-sm text-muted">{t("communities.form.visibility")}</legend>
            {VISIBILITIES.map((item) => (
              <label
                key={item}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface/50 px-3 py-2.5"
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === item}
                  onChange={() => setVisibility(item)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium">
                    {t(`communities.visibility.${item.toLowerCase()}`)}
                  </span>
                  <span className="block text-xs text-muted">
                    {t(`communities.visibilityHint.${item.toLowerCase()}`)}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
          <Button type="submit" disabled={loading || name.trim().length < 3}>
            {loading ? t("common.loading") : t("communities.wizard.next")}
          </Button>
        </form>
      )}

      {step === "channels" && (
        <div className="space-y-4">
          <p className="text-sm text-muted">{t("communities.wizard.channelsDesc")}</p>
          <ul className="space-y-2">
            {CHANNEL_ORDER.map((key) => {
              const checked = selectedChannels.includes(key);
              const recommended = ["announcements", "rules", "chat", "watch", "voice"].includes(key);
              return (
                <li key={key}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2.5 hover:bg-surface-hover">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleChannel(key)}
                    />
                    <span className="flex-1 text-sm">{CHANNEL_LABELS[key]}</span>
                    {recommended ? (
                      <span className="text-[10px] text-accent">{t("communities.wizard.recommended")}</span>
                    ) : null}
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep("basic")}>
              {t("communities.wizard.back")}
            </Button>
            <Button onClick={() => void handleChannelsNext()} disabled={loading}>
              {loading ? t("common.loading") : t("communities.wizard.next")}
            </Button>
          </div>
        </div>
      )}

      {step === "bots" && (
        <div className="space-y-4">
          <p className="text-sm text-muted">{t("communities.wizard.botsDesc")}</p>
          <ul className="space-y-2">
            {ALL_BOT_TYPES.map((type) => (
              <li
                key={type}
                className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t(`communities.bots.${type}.name`)}</p>
                  <p className="text-xs text-muted">{t(`communities.bots.${type}.desc`)}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={selectedBots[type]}
                  onClick={() => toggleBot(type)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    selectedBots[type] ? "bg-accent" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                      selectedBots[type] ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep("channels")}>
              {t("communities.wizard.back")}
            </Button>
            <Button onClick={() => void handleBotsNext()} disabled={loading}>
              {loading ? t("common.loading") : t("communities.wizard.next")}
            </Button>
          </div>
        </div>
      )}

      {step === "summary" && (
        <div className="space-y-4">
          <p className="text-sm text-muted">{t("communities.wizard.summaryDesc")}</p>
          <div className="rounded-xl border border-border bg-surface/40 p-3 text-sm">
            <p className="font-medium">{name}</p>
            <p className="mt-2 text-muted">
              {t("communities.wizard.summaryChannels", { count: String(selectedChannels.length) })}
            </p>
            <p className="text-muted">
              {t("communities.wizard.summaryBots", {
                count: String(Object.values(selectedBots).filter(Boolean).length),
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep("bots")}>
              {t("communities.wizard.back")}
            </Button>
            <Button onClick={() => void handleComplete()} disabled={loading}>
              {loading ? t("common.loading") : t("communities.wizard.complete")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
