"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, acceptCommunityInvite, getCommunityInvitePreview } from "@/lib/api";

interface CommunityInvitePageClientProps {
  inviteCode: string;
}

export function CommunityInvitePageClient({ inviteCode }: CommunityInvitePageClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [communityName, setCommunityName] = useState<string | null>(null);
  const [communityId, setCommunityId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const preview = await getCommunityInvitePreview(inviteCode);
        setCommunityName(preview.invite.community.name);
        setCommunityId(preview.invite.community.id);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t("invite.invalidDesc"));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [inviteCode, t]);

  async function handleAccept() {
    setJoining(true);
    setError(null);
    try {
      const result = await acceptCommunityInvite(inviteCode);
      const firstChannel = result.channels[0];
      if (firstChannel) {
        router.push(`/communities/${result.community.id}/channels/${firstChannel.id}`);
      } else {
        router.push(`/communities/${result.community.id}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("communities.joinFailed"));
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return <LoadingState label={t("common.loading")} rows={2} className="min-h-[40vh]" />;
  }

  if (error && !communityName) {
    return (
      <div className="space-y-3">
        <ErrorState title={t("invite.invalidTitle")} description={error} />
        <div className="text-center">
          <Button variant="secondary" href="/communities">
            {t("communities.backToList")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 rounded-xl border border-border bg-surface p-6 text-center">
      <h1 className="text-xl font-semibold">{t("communities.inviteTitle")}</h1>
      <p className="text-sm text-muted">
        {t("communities.inviteJoinDesc", { name: communityName ?? "" })}
      </p>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <Button onClick={() => void handleAccept()} disabled={joining} className="w-full">
        {joining ? t("common.loading") : t("communities.join")}
      </Button>
      {communityId ? (
        <Button
          variant="secondary"
          href={`/communities/${communityId}`}
          className="w-full"
        >
          {t("communities.viewCommunity")}
        </Button>
      ) : null}
    </div>
  );
}
