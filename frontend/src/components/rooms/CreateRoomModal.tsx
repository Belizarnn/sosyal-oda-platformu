"use client";



import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";

import { Input } from "@/components/ui/Input";

import { useToast } from "@/components/ui/ToastProvider";

import { useLanguage } from "@/contexts/LanguageContext";

import { getCategoryLabel, getRoomTypeLabel } from "@/i18n/utils";

import { ApiError, createRoom } from "@/lib/api";

import {

  ROOM_CATEGORY_OPTIONS,

  ROOM_TYPE_OPTIONS,

  type CreateRoomInput,

  type RoomCategory,

  type RoomListItem,

  type RoomType,

} from "@/types/room";

import { cn } from "@/lib/cn";



interface CreateRoomModalProps {

  open: boolean;

  onClose: () => void;

  onCreated: (room: RoomListItem) => void;

}



export function CreateRoomModal({ open, onClose, onCreated }: CreateRoomModalProps) {

  const router = useRouter();

  const { t } = useLanguage();

  const { success } = useToast();

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [category, setCategory] = useState<RoomCategory>("CHAT");

  const [type, setType] = useState<RoomType>("PUBLIC");

  const [maxUserCount, setMaxUserCount] = useState(20);

  const [password, setPassword] = useState("");

  const [showAdvanced, setShowAdvanced] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);



  if (!open) {

    return null;

  }



  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {

    event.preventDefault();

    setLoading(true);

    setError(null);



    const payload: CreateRoomInput = {

      name: name.trim(),

      description: description.trim() || null,

      category,

      type,

      maxUserCount,

      ...(type === "PASSWORD_PROTECTED" ? { password } : {}),

    };



    try {

      const { room } = await createRoom(payload);

      success(t("rooms.create.success"));

      onCreated(room);

      onClose();

      router.push(`/rooms/${room.id}`);

    } catch (err) {

      setError(err instanceof ApiError ? err.message : t("rooms.create.failed"));

    } finally {

      setLoading(false);

    }

  }



  return (

    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">

      <button

        type="button"

        className="absolute inset-0 bg-black/70 backdrop-blur-sm"

        onClick={onClose}

        aria-label={t("common.close")}

      />



      <div className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-dropdown p-6 shadow-[0_0_60px_var(--glow)] sm:rounded-2xl">

        <h2 className="text-xl font-semibold">{t("rooms.create")}</h2>

        <p className="mt-1 text-sm text-muted">{t("rooms.create.simpleSubtitle")}</p>



        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>

          <Input

            label={t("rooms.create.nameLabel")}

            value={name}

            onChange={(event) => setName(event.target.value)}

            placeholder={t("rooms.create.namePlaceholder")}

            required

            minLength={3}

            maxLength={60}

          />



          <div className="flex flex-col gap-1.5">

            <label htmlFor="category" className="text-sm font-medium text-foreground/90">

              {t("rooms.create.categoryLabel")}

            </label>

            <select

              id="category"

              value={category}

              onChange={(event) => setCategory(event.target.value as RoomCategory)}

              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"

            >

              {ROOM_CATEGORY_OPTIONS.map((option) => (

                <option key={option.value} value={option.value}>

                  {getCategoryLabel(option.value, t)}

                </option>

              ))}

            </select>

          </div>



          <button

            type="button"

            onClick={() => setShowAdvanced((current) => !current)}

            className="text-left text-sm text-accent hover:underline"

          >

            {showAdvanced ? t("rooms.create.hideAdvanced") : t("rooms.create.advancedSettings")}

          </button>



          {showAdvanced ? (

            <div className="space-y-4 rounded-xl border border-border bg-surface/50 p-4">

              <div className="flex flex-col gap-1.5">

                <label htmlFor="description" className="text-sm font-medium text-foreground/90">

                  {t("rooms.create.descriptionLabel")}

                </label>

                <textarea

                  id="description"

                  value={description}

                  onChange={(event) => setDescription(event.target.value)}

                  maxLength={240}

                  rows={3}

                  placeholder={t("rooms.create.descriptionPlaceholder")}

                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted/70 outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-[var(--accent-ring)]"

                />

              </div>



              <div className="grid gap-4 sm:grid-cols-2">

                <div className="flex flex-col gap-1.5">

                  <label htmlFor="type" className="text-sm font-medium text-foreground/90">

                    {t("rooms.create.typeLabel")}

                  </label>

                  <select

                    id="type"

                    value={type}

                    onChange={(event) => setType(event.target.value as RoomType)}

                    className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"

                  >

                    {ROOM_TYPE_OPTIONS.map((option) => (

                      <option key={option.value} value={option.value}>

                        {getRoomTypeLabel(option.value, t)}

                      </option>

                    ))}

                  </select>

                </div>



                <Input

                  label={t("rooms.create.maxMembersLabel")}

                  type="number"

                  min={2}

                  max={100}

                  value={maxUserCount}

                  onChange={(event) => setMaxUserCount(Number(event.target.value))}

                />

              </div>



              {type === "PASSWORD_PROTECTED" ? (

                <Input

                  label={t("rooms.passwordLabel")}

                  type="password"

                  value={password}

                  onChange={(event) => setPassword(event.target.value)}

                  placeholder="••••••"

                  required

                  minLength={4}

                />

              ) : null}



              {type === "INVITE_ONLY" ? (

                <p className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-muted">

                  {t("rooms.create.inviteOnlyNote")}

                </p>

              ) : null}

            </div>

          ) : null}



          {error ? <p className="text-sm text-red-300">{error}</p> : null}



          <div className="flex gap-3 pt-2">

            <Button

              type="button"

              variant="secondary"

              className="flex-1"

              onClick={onClose}

              disabled={loading}

            >

              {t("common.cancel")}

            </Button>

            <Button

              type="submit"

              className={cn("flex-1", loading && "opacity-60")}

              disabled={loading}

            >

              {loading ? t("rooms.create.submitting") : t("rooms.create")}

            </Button>

          </div>

        </form>

      </div>

    </div>

  );

}


