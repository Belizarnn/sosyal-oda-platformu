"use client";

import { useEffect, useState } from "react";
import { getPublicConfig } from "@/lib/api";
import type { PublicConfig } from "@/types/public";

const DEFAULT_CONFIG: PublicConfig = {
  betaMode: false,
  betaAccessRequired: false,
};

export function usePublicConfig() {
  const [config, setConfig] = useState<PublicConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void getPublicConfig()
      .then((data) => {
        if (active) {
          setConfig(data);
        }
      })
      .catch(() => {
        if (active) {
          setConfig(DEFAULT_CONFIG);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { config, loading };
}
