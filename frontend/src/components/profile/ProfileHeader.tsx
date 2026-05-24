"use client";



import type { UserProfile } from "@/types/user";

import { PremiumBadge } from "@/components/premium/PremiumBadge";

import { PremiumProfileFrame } from "@/components/premium/PremiumProfileFrame";

import { Avatar } from "@/components/ui/Avatar";

import { Badge } from "@/components/ui/Badge";

import { Button } from "@/components/ui/Button";

import { useLanguage } from "@/contexts/LanguageContext";

import { getPresenceLabel } from "@/lib/presence";



interface ProfileHeaderProps {

  user: UserProfile;

  isOwnProfile?: boolean;

  onEditClick?: () => void;

  friendAction?: React.ReactNode;

}



export function ProfileHeader({

  user,

  isOwnProfile = false,

  onEditClick,

  friendAction,

}: ProfileHeaderProps) {

  const { t } = useLanguage();

  const presenceLabel = getPresenceLabel(user.presenceStatus, t);

  const showPremiumBadge = Boolean(user.isPremium && user.premiumBadgeVisible);



  return (

    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_0_40px_var(--glow)]">

      <div

        className="relative h-32 bg-gradient-to-r from-accent/30 via-[#5b9bd5]/20 to-[#e879a9]/20 sm:h-44"

        style={

          user.bannerUrl

            ? {

                backgroundImage: `url(${user.bannerUrl})`,

                backgroundSize: "cover",

                backgroundPosition: "center",

              }

            : undefined

        }

      >

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,var(--accent-soft),transparent_60%)]" />

        {user.bannerUrl ? (

          <div className="absolute inset-0 bg-surface" />

        ) : null}

        {user.isPremium ? (

          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-indigo-500/10" />

        ) : null}

      </div>



      <div className="relative px-5 pb-5 sm:px-6">

        <div className="-mt-10 mb-4 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">

          <div className="relative inline-flex">

            <PremiumProfileFrame

              frame={user.isPremium ? user.premiumProfileFrame : null}

              effect={user.isPremium ? user.premiumAvatarEffect : null}

            >

              <Avatar

                name={user.username}

                src={user.avatarUrl}

                size="xl"

                className="ring-4 ring-ring-offset"

              />

            </PremiumProfileFrame>

            {showPremiumBadge ? (

              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">

                <PremiumBadge size="sm" />

              </div>

            ) : null}

          </div>

          <div className="flex flex-wrap items-center gap-2">

            <Badge variant="accent">{presenceLabel}</Badge>

            {isOwnProfile && onEditClick ? (

              <Button variant="secondary" onClick={onEditClick}>

                {t("profile.editTitle")}

              </Button>

            ) : null}

            {!isOwnProfile ? friendAction : null}

          </div>

        </div>



        <h1 className="text-2xl font-semibold">{user.username}</h1>

        <p className="text-muted">@{user.handle}</p>



        {user.statusMessage ? (

          <p className="mt-2 text-sm text-accent-foreground/90">

            “{user.statusMessage}”

          </p>

        ) : null}



        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/85">

          {user.bio ?? t("profile.noBio")}

        </p>

      </div>

    </div>

  );

}


