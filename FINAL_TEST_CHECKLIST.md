# Final MVP Test Checklist

Sosyal Oda Platformu — teslim öncesi manuel ve otomatik kontrol listesi (v1.0.0-beta).

> **İlgili dokümanlar:** [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) · [`SMOKE_TEST.md`](SMOKE_TEST.md) · [`PRODUCTION_CHECKLIST.md`](PRODUCTION_CHECKLIST.md) · [`DEPLOYMENT.md`](DEPLOYMENT.md) · [`RELEASE_NOTES.md`](RELEASE_NOTES.md) · [`README.md`](README.md)

---

## Build (otomatik)

- [ ] `cd backend && npm install && npx prisma generate && npm run build`
- [ ] `cd frontend && npm install && npm run build`
- [ ] TypeScript hatası yok

## Backend

- [ ] `npx prisma migrate dev` (local) veya `npx prisma migrate deploy` (production)
- [ ] `npm run prisma:seed` (yalnızca local/demo; production'da `ALLOW_DEMO_SEED` olmadan engellenir)
- [ ] `npm run dev` veya `npm run start`
- [ ] `GET /health` → `{ status: "ok", environment, message }` (secret yok)
- [ ] `GET /public/config` → beta flags
- [ ] `POST /auth/login` demo hesapla çalışıyor
- [ ] API yanıtlarında `passwordHash` yok

## Frontend

- [ ] `.env.local` oluşturuldu (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`)
- [ ] Landing (`/`) girişsiz açılıyor
- [ ] Login / register girişsiz açılıyor
- [ ] Politika sayfaları girişsiz: `/privacy`, `/terms`, `/community-guidelines`, `/beta`
- [ ] Korumalı sayfalar token olmadan `/login`'e yönlendiriyor

## Auth & Session

- [ ] Register (beta açıksa davet kodu ile)
- [ ] Login token localStorage'a kaydediliyor
- [ ] Logout token'ı temizliyor + socket disconnect
- [ ] Email verification / password reset akışı (Resend yapılandırıldıysa)

## Feature Tests

- [ ] Dashboard · Room create/join/detail · Chat
- [ ] Voice (LiveKit env ile)
- [ ] Watch party
- [ ] Profile · Friends · DM · Notifications · Settings
- [ ] Premium (Stripe test mode)
- [ ] Feedback modal
- [ ] Admin panel (reports, analytics, feedback, beta codes)
- [ ] Beta access code (register)

## Security Checks

- [ ] Normal kullanıcı admin endpointlerine erişemiyor
- [ ] CORS wildcard `*` yok; production domain allowlist
- [ ] `.env` / `.env.local` git'te yok
- [ ] Stripe / Resend / LiveKit secret frontend'de yok

## Route Smoke Test (Frontend)

**Public:** `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/privacy`, `/terms`, `/community-guidelines`, `/beta`

**Protected:** `/dashboard`, `/rooms`, `/rooms/[roomId]`, `/discover`, `/profile/[handle]`, `/friends`, `/messages`, `/notifications`, `/settings`, `/premium`, `/invite/[inviteCode]`, `/admin`, `/admin/*`, `/onboarding`

---

**Son kontrol tarihi:** _______________  
**Kontrol eden:** _______________  
**Sonuç:** ☐ Geçti · ☐ Kısmen · ☐ Kaldı
