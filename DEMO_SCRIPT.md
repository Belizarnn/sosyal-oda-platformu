# Demo Script — Sosyal Oda Platformu MVP

Sunum ve teslim demo akışı. Tahmini süre: **10–15 dakika**.

---

## Projenin Amacı

Kullanıcıların **sosyal odalar** oluşturup katılabildiği, **gerçek zamanlı sohbet**, **watch party**, **arkadaşlık**, **DM** ve **moderasyon** özelliklerini bir arada sunan modern bir dijital buluşma platformu.

## Hedef Kullanıcı

- Gece sohbeti, oyun lobby, ders çalışma veya anime izleme gibi **ortak ilgi alanı odalarında** vakit geçirmek isteyen kullanıcılar
- Küçük topluluklar ve arkadaş grupları
- MVP demo: geliştiriciler, jüri, erken kullanıcı testleri

## Neden Sosyal Oda Platformu?

- Discord/Zoom karışımı değil; **oda merkezli sosyal deneyim**
- Text chat + watch party + profil + arkadaşlık **tek platformda**
- Moderasyon ve admin report paneli ile **güvenli topluluk** altyapısı
- Modern stack (Next.js, Express, Prisma, Socket.IO) ile **ölçeklenebilir MVP**

---

## Demo Öncesi Hazırlık

```bash
# Terminal 1 — Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev

# Terminal 2 — Frontend
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

**Demo hesap:** `sudenaz@example.com` / `password123` (ADMIN)  
**Moderator test:** `yavuzhan@example.com` / `password123`  
**Beta kayıt kodu (seed):** `BETA-TEST-2026` (`BETA_ACCESS_REQUIRED=true` ise)

> Production deploy: [`DEPLOYMENT.md`](DEPLOYMENT.md) · Smoke test: [`SMOKE_TEST.md`](SMOKE_TEST.md)

---

## Demo Akışı (Sunum Sırası)

| # | Adım | Ne gösterilir |
|---|------|----------------|
| 1 | Landing page (`/`) | Hero, beta banner, footer (privacy/terms), feedback butonu |
| 2 | Login / Register | Beta kodu (açıksa), onboarding |
| 3 | Dashboard | Presence, yönlendirme kartları |
| 4 | Discover | Oda keşfi, filtreler |
| 5 | Rooms | Oda listesi, yeni oda oluşturma |
| 6 | Oda detayı | Katılma, üye listesi, paneller |
| 7 | Chat | Realtime mesaj gönderme |
| 8 | Voice panel | UI (LiveKit placeholder — gerçek ses yok) |
| 9 | Watch party | YouTube linki ekleme |
| 10 | Invite link | Davet kodu kopyalama / `/invite/DEMOCHAT01` |
| 11 | Profile | Profil düzenleme (`/profile/sudenaz`) |
| 12 | Friends | Arkadaş listesi, pending istek (Kaan → Sudenaz) |
| 13 | Messages | Yavuzhan ile DM |
| 14 | Notifications | Demo bildirimler |
| 15 | Settings | Hesap ayarları, şifre alanı |
| 16 | Admin panel | `/admin` özet, analytics, feedback, beta codes |
| 17 | Admin reports | Rapor listesi, detay, status güncelleme |
| 18 | Feedback modal | Sağ alt veya settings üzerinden geri bildirim |
| 19 | Logout | Oturum kapanır, korumalı sayfalar engellenir |

---

## Kullanılan Teknolojiler

| Katman | Stack |
|--------|-------|
| Frontend | Next.js App Router, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | Neon PostgreSQL + Prisma |
| Realtime | Socket.IO |
| Auth | JWT + bcrypt |
| Deploy hedefi | Vercel + Render/Railway |

---

## MVP'de Olanlar

- Auth, profil, presence
- Oda CRUD, katılma, invite link
- Realtime oda chat
- Watch party altyapısı (YouTube URL sync)
- Voice panel UI (token placeholder)
- Discover, friends, DM, notifications
- Oda moderasyonu (kick/mute/ban/report)
- Admin report paneli (ADMIN/MODERATOR)
- Settings, onboarding, toast UX
- Deployment hazırlığı (env, CORS, build)

## Sonraki Geliştirmeler

- Gerçek LiveKit voice entegrasyonu
- Tam YouTube IFrame API sync
- Premium / ödeme sistemi
- E-posta doğrulama, hesap silme
- Push notification, PWA / mobil app
- Gelişmiş admin analytics
- Rate limiting, captcha, spam detection

---

## Ekran Görüntüleri

Sunum materyali için `screenshots/` klasörüne ekran görüntüleri eklenebilir. Detay: `screenshots/README.md`

---

## Soru-Cevap Hazırlığı

**LiveKit neden çalışmıyor?**  
MVP'de voice panel UI ve token endpoint taslağı var; gerçek ses entegrasyonu sonraki sprint.

**Production'a nasıl deploy edilir?**  
README → Deployment bölümü (Vercel + Render/Railway + Neon).

**Güvenlik?**  
JWT auth, role-based admin, oda ban/mute, passwordHash asla API'de dönmez.
