"use client";

import { useState } from "react";
import { InterestTag } from "@/components/profile/InterestTag";
import { useLanguage } from "@/contexts/LanguageContext";
import { PROFILE_INTEREST_SUGGESTIONS } from "@/types/user";

interface ProfileInterestEditorProps {
  interests: string[];
  onChange: (interests: string[]) => void;
  disabled?: boolean;
}

export function ProfileInterestEditor({
  interests,
  onChange,
  disabled = false,
}: ProfileInterestEditorProps) {
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function addInterest(value: string) {
    const trimmed = value.trim();

    if (!trimmed) {
      return;
    }

    if (trimmed.length > 24) {
      setError(t("profile.interestMaxLength"));
      return;
    }

    if (interests.length >= 12) {
      setError(t("profile.interestMaxCount"));
      return;
    }

    const exists = interests.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase(),
    );

    if (exists) {
      setError(t("profile.interestDuplicate"));
      return;
    }

    onChange([...interests, trimmed]);
    setInput("");
    setError(null);
  }

  function removeInterest(label: string) {
    onChange(interests.filter((item) => item !== label));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {interests.map((interest) => (
          <button
            key={interest}
            type="button"
            disabled={disabled}
            onClick={() => removeInterest(interest)}
            className="group inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs transition hover:border-red-500/30 hover:bg-red-500/10"
            title={t("profile.interestRemove")}
          >
            {interest}
            <span className="text-muted group-hover:text-red-200">×</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          disabled={disabled}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addInterest(input);
            }
          }}
          placeholder={t("profile.interestAddPlaceholder")}
          className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-[var(--accent-ring)]"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => addInterest(input)}
          className="rounded-xl border border-border bg-surface px-4 py-2 text-sm transition hover:bg-surface"
        >
          {t("common.add")}
        </button>
      </div>

      {error ? <p className="text-xs text-red-300">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        {PROFILE_INTEREST_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={disabled}
            onClick={() => addInterest(suggestion)}
            className="rounded-full border border-dashed border-border px-2.5 py-1 text-[11px] text-muted transition hover:border-accent/30 hover:text-foreground"
          >
            + {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
