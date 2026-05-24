"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, getCommunityById } from "@/lib/api";

interface CommunityHomeRedirectProps {
  communityId: string;
}

export function CommunityHomeRedirect({ communityId }: CommunityHomeRedirectProps) {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    async function redirect() {
      try {
        const response = await getCommunityById(communityId);
        const first = response.channels[0];
        if (first) {
          router.replace(`/communities/${communityId}/channels/${first.id}`);
        }
      } catch (err) {
        if (err instanceof ApiError) {
          router.replace("/communities");
        }
      }
    }

    void redirect();
  }, [communityId, router]);

  return <LoadingState label={t("common.loading")} rows={2} className="min-h-[40vh]" />;
}
