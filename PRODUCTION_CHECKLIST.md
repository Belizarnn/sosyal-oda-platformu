# Production Checklist — v1.0.0-beta

Canlıya almadan önce aşağıdaki maddeleri işaretleyin. Secret değerlerini bu dosyaya yazmayın.

## Build

- [ ] Frontend build geçti (`cd frontend && npm run build`)
- [ ] Backend build geçti (`cd backend && npm run build`)

## Veritabanı

- [ ] Neon (veya PostgreSQL) provision edildi
- [ ] `DATABASE_URL` backend env'de tanımlı
- [ ] Production'da `npx prisma migrate deploy` çalıştırıldı
- [ ] Demo seed production'da **bilinçli olarak çalıştırılmadı** (`ALLOW_DEMO_SEED` olmadan engellenir)

## Environment — Backend

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` güçlü (≥32 karakter, zayıf default yok)
- [ ] `CLIENT_URL` / `CORS_ORIGIN` / `FRONTEND_URL` frontend domain (https)
- [ ] `DATABASE_URL` kod içinde yok
- [ ] `LIVEKIT_*` voice için yapılandırıldı (veya voice devre dışı kabul edildi)
- [ ] `ENABLE_REDIS` / `REDIS_URL` çoklu instance için değerlendirildi
- [ ] `STRIPE_*` test veya live bilinçli seçildi
- [ ] `STRIPE_WEBHOOK_SECRET` webhook endpoint ile eşleşiyor
- [ ] `RESEND_API_KEY` ve `EMAIL_FROM` tanımlı (e-posta gerekiyorsa)
- [ ] `APP_URL` doğrulama linkleri için doğru
- [ ] `BETA_MODE` / `BETA_ACCESS_REQUIRED` beta stratejisine uygun

## Environment — Frontend

- [ ] `NEXT_PUBLIC_API_URL` backend https URL
- [ ] `NEXT_PUBLIC_APP_URL` frontend https URL
- [ ] E-posta / Stripe / Resend key'leri frontend env'de **yok**

## Güvenlik

- [ ] `.env` / `.env.local` git'e commitlenmedi (`.gitignore` kontrol)
- [ ] `passwordHash` API response'larında yok
- [ ] Admin endpointleri role protected
- [ ] Rate limit aktif
- [ ] Helmet aktif
- [ ] Socket auth (JWT) aktif
- [ ] CORS wildcard `*` kullanılmıyor
- [ ] Stripe webhook signature doğrulaması aktif

## Altyapı

- [ ] `GET /health` production'da çalışıyor (hassas veri yok)
- [ ] Backend health check path ayarlandı (`/health`)
- [ ] Frontend Vercel deploy tamam
- [ ] Backend Render/Railway deploy tamam

## Fonksiyonel smoke test

- [ ] Login çalışıyor
- [ ] Register çalışıyor (beta code gerekiyorsa test edildi)
- [ ] Email verification çalışıyor (Resend yapılandırıldıysa)
- [ ] Room create çalışıyor
- [ ] Chat çalışıyor
- [ ] DM çalışıyor
- [ ] Voice çalışıyor (LiveKit yapılandırıldıysa)
- [ ] Watch party link ekleme çalışıyor
- [ ] Notifications çalışıyor
- [ ] Admin panel çalışıyor (ADMIN/MODERATOR)
- [ ] Payment test mode checkout açılıyor (Stripe yapılandırıldıysa)
- [ ] Feedback modal çalışıyor
- [ ] Politika sayfaları açılıyor (`/privacy`, `/terms`, `/community-guidelines`, `/beta`)

## Monitoring (öneri)

- [ ] Backend logları izlenebilir (platform logs)
- [ ] Sentry veya Logtail değerlendirildi
- [ ] Stripe webhook delivery logları kontrol planı var

## Rollback

- [ ] Frontend önceki deployment'a dönüş planı biliniyor (Vercel)
- [ ] Backend önceki deploy'a rollback planı biliniyor
- [ ] [`DEPLOYMENT.md`](DEPLOYMENT.md) rollback bölümü okundu

## Dokümantasyon

- [ ] [`RELEASE_NOTES.md`](RELEASE_NOTES.md) gözden geçirildi
- [ ] [`SMOKE_TEST.md`](SMOKE_TEST.md) ekiple paylaşıldı
