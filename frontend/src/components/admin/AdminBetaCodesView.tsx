"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import {
  ApiError,
  createAdminBetaCode,
  getAdminBetaCodes,
  type BetaAccessCode,
} from "@/lib/api";
import { formatShortDate } from "@/lib/formatDate";
import { isAdminRole } from "@/types/admin";

export function AdminBetaCodesView() {
  const { t } = useLanguage();
  const { loading, forbidden, isReady, user } = useAdminAccess();
  const [codes, setCodes] = useState<BetaAccessCode[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [maxUses, setMaxUses] = useState("10");
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const canManage = isAdminRole(user?.role);

  const loadCodes = useCallback(async () => {
    setListLoading(true);
    setError(null);

    try {
      const response = await getAdminBetaCodes();
      setCodes(response.codes);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("admin.betaCodes.loadFailed"),
      );
    } finally {
      setListLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isReady || forbidden || !canManage) {
      return;
    }

    void loadCodes();
  }, [canManage, forbidden, isReady, loadCodes]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const parsedMaxUses = Number.parseInt(maxUses, 10);
      const response = await createAdminBetaCode({
        code: code.trim(),
        maxUses: Number.isFinite(parsedMaxUses) ? parsedMaxUses : 1,
        expiresAt: null,
      });
      setSuccess(response.message);
      setCode("");
      await loadCodes();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("admin.betaCodes.createFailed"),
      );
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <LoadingState
        label={t("states.loading.admin")}
        rows={2}
        className="mx-auto max-w-5xl"
      />
    );
  }

  if (forbidden || !canManage) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState
          title={t("common.accessDeniedTitle")}
          description={t("common.accessDenied")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <Link href="/admin" className="text-sm text-muted hover:text-foreground">
          {t("admin.backToPanel")}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{t("admin.betaCodes.title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("admin.betaCodes.subtitle")}</p>
      </div>

      <Card className="space-y-4">
        <div>
          <h2 className="font-semibold">{t("admin.betaCodes.createTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t("admin.betaCodes.createDesc")}</p>
        </div>

        <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-[1fr_120px_auto] sm:items-end">
          <Input
            label={t("admin.betaCodes.codeLabel")}
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="INVITE2026"
            required
            maxLength={64}
          />
          <Input
            label={t("admin.betaCodes.maxUsesLabel")}
            type="number"
            min={1}
            max={10000}
            value={maxUses}
            onChange={(event) => setMaxUses(event.target.value)}
            required
          />
          <Button type="submit" disabled={creating}>
            {creating ? t("common.submitting") : t("admin.betaCodes.create")}
          </Button>
        </form>

        {success ? <p className="text-sm text-emerald-300">{success}</p> : null}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </Card>

      {listLoading ? (
        <LoadingState label={t("admin.betaCodes.loading")} rows={3} />
      ) : codes.length === 0 ? (
        <EmptyState
          icon="🔑"
          title={t("admin.betaCodes.emptyTitle")}
          description={t("admin.betaCodes.emptyDesc")}
        />
      ) : (
        <div className="space-y-3">
          {codes.map((item) => (
            <Card key={item.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-sm font-semibold">{item.code}</p>
                <p className="mt-1 text-sm text-muted">
                  {t("admin.betaCodes.usage", {
                    used: item.usedCount,
                    max: item.maxUses,
                  })}
                  {" · "}
                  {item.isActive ? t("admin.betaCodes.active") : t("admin.betaCodes.inactive")}
                </p>
                <p className="text-xs text-muted">
                  {t("admin.betaCodes.createdAt")}: {formatShortDate(item.createdAt)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
