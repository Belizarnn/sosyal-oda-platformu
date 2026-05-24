# Deployment Rehberi — Sosyal Oda Platformu

Bu doküman **v1.0.0-beta** production deploy sürecini özetler. Gerçek secret değerlerini bu dosyaya yazmayın; yalnızca platform environment variable alanlarına ekleyin.

## Mimari

| Bileşen | Önerilen provider |
|---------|-------------------|
| Frontend | [Vercel](https://vercel.com) |
| Backend API + Socket.IO | [Render](https://render.com) veya [Railway](https://railway.app) |
| PostgreSQL | [Neon](https://neon.tech) |
| Redis (opsiyonel, önerilir) | Upstash, Redis Cloud, Render Redis |
| Voice | [LiveKit Cloud](https://livekit.io) |
| Ödeme | Stripe (test → live geçişi bilinçli yapılır) |
| E-posta | [Resend](https://resend.com) |

Repoda `render.yaml` örnek backend blueprint içerir.

---

## 1. Veritabanı (Neon)

1. Neon projesi oluşturun.
2. Connection string alın (`?sslmode=require` önerilir).
3. Backend ortamına `DATABASE_URL` olarak ekleyin.
4. **Migration deploy** (production'da `migrate dev` kullanılmaz):

```bash
cd backend
npx prisma migrate deploy
```

### Seed uyarısı

`npm run prisma:seed` **yalnızca local/demo** içindir. Production'da otomatik çalışmaz; `NODE_ENV=production` iken seed bilinçli olarak `ALLOW_DEMO_SEED=true` olmadan engellenir.

---

## 2. Backend (Render / Railway)

### Build & start

```bash
cd backend
npm install
npm run build
npx prisma generate
npm run start
```

Önerilen build command:

```bash
npm install && npm run build && npx prisma generate
```

Start command:

```bash
npm run start
```

Health check path: **`/health`**

### Backend environment variables

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `NODE_ENV` | Evet | `production` |
| `PORT` | Genelde otomatik | Render/Railway atar |
| `DATABASE_URL` | Evet | Neon connection string |
| `JWT_SECRET` | Evet | En az 32 karakter; `openssl rand -base64 48` |
| `CLIENT_URL` | Evet | Frontend origin (https) |
| `CORS_ORIGIN` | Evet | Frontend origin — **wildcard `*` kullanmayın** |
| `FRONTEND_URL` | Önerilir | E-posta linkleri için |
| `APP_URL` | Önerilir | Doğrulama / şifre sıfırlama URL'leri |
| `LIVEKIT_URL` | Voice için | LiveKit wss URL |
| `LIVEKIT_API_KEY` | Voice için | LiveKit API key |
| `LIVEKIT_API_SECRET` | Voice için | LiveKit secret |
| `ENABLE_REDIS` | Önerilir | Çoklu instance için `true` |
| `REDIS_URL` | Redis açıksa | Redis connection string |
| `STRIPE_SECRET_KEY` | Premium için | Test: `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Premium için | Stripe webhook signing secret |
| `STRIPE_PREMIUM_MONTHLY_PRICE_ID` | Premium için | Stripe price ID |
| `STRIPE_PREMIUM_YEARLY_PRICE_ID` | Premium için | Stripe price ID |
| `RESEND_API_KEY` | E-posta için | Resend API key |
| `EMAIL_FROM` | E-posta için | Örn. `Sosyal Oda <noreply@domain.com>` |
| `BETA_MODE` | Opsiyonel | `true` / `false` |
| `BETA_ACCESS_REQUIRED` | Opsiyonel | Beta kayıt kodu zorunluluğu |

---

## 3. Frontend (Vercel)

1. Repo'yu Vercel'e bağlayın; root directory: `frontend`
2. Framework: Next.js (otomatik algılanır)
3. Build: `npm run build`

### Frontend environment variables

| Değişken | Açıklama |
|----------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (https) |
| `NEXT_PUBLIC_APP_URL` | Frontend URL (https) |

Socket.IO aynı backend URL'ini kullanır; ayrı `NEXT_PUBLIC_SOCKET_URL` gerekmez.

---

## 4. CORS

Production'da backend `CORS_ORIGIN` ve `CLIENT_URL` değerleri **frontend domain** ile eşleşmelidir.

Örnek:

```
CORS_ORIGIN=https://app.ornek.com
CLIENT_URL=https://app.ornek.com
FRONTEND_URL=https://app.ornek.com
```

Kod tabanı wildcard `*` kullanmaz; `backend/src/config/cors.ts` allowlist mantığı uygular.

---

## 5. LiveKit (Voice)

1. LiveKit Cloud projesi oluşturun.
2. `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` backend env'e ekleyin.
3. Oda içi voice panelinden token alımını test edin.

Voice çalışmazsa: env eksik veya LiveKit projesi yapılandırılmamış olabilir.

---

## 6. Stripe webhook

1. Stripe Dashboard → Developers → Webhooks
2. Endpoint: `https://BACKEND_DOMAIN/payments/webhook`
3. İlgili event'leri seçin (checkout, subscription vb.)
4. Signing secret → `STRIPE_WEBHOOK_SECRET`
5. Webhook endpoint **raw body** ile imza doğrular (`constructEvent`)

Test mode ile başlayın; live geçişte ayrı endpoint ve live key kullanın.

---

## 7. Resend (E-posta)

1. Resend hesabı ve domain doğrulama
2. `RESEND_API_KEY` backend env
3. `EMAIL_FROM` gönderen adresi
4. `APP_URL` veya `FRONTEND_URL` doğrulama linkleri için

`RESEND_API_KEY` yoksa e-posta gönderilmez; uygulama diğer akışlarda çalışmaya devam eder.

---

## 8. Deploy sonrası smoke test

Detaylı adımlar: [`SMOKE_TEST.md`](SMOKE_TEST.md)

Hızlı kontrol:

- [ ] `GET /health` → `{ "status": "ok" }`
- [ ] Landing açılıyor
- [ ] Register / login
- [ ] Oda oluşturma + chat
- [ ] Admin panel (ADMIN rolü)

Tam checklist: [`PRODUCTION_CHECKLIST.md`](PRODUCTION_CHECKLIST.md)

---

## 9. Rollback planı

### Frontend (Vercel)

1. Vercel Dashboard → Deployments
2. Önceki başarılı deployment → **Promote to Production**
3. Gerekirse environment variable değişikliklerini geri al

### Backend (Render / Railway)

1. Önceki deploy image/commit'e rollback
2. Migration geri alma genelde **gerekmez**; schema değişikliği geri alınacaksa ayrı migration planlayın
3. `DATABASE_URL` ve secret'ların doğru olduğunu doğrula

### Veritabanı

- Production'da `prisma migrate dev` kullanmayın
- Acil durumda Neon point-in-time restore veya backup'tan dönüş değerlendirilir
- Demo seed production'da çalıştırmayın

### Stripe / LiveKit

- Webhook endpoint geçici kapatılabilir
- LiveKit key rotation LiveKit dashboard'dan yapılır

---

## 10. Monitoring (öneri)

Bu sprintte Sentry zorunlu değil; production için önerilir:

- **Sentry** veya **Logtail** — backend hata ve exception izleme
- Backend stdout logları (Render/Railway logs) — request log satırları method/path/status/duration içerir; **body veya token loglanmaz**
- Stripe webhook delivery logları — Dashboard'dan failed event kontrolü

---

## 11. Migration özeti

| Ortam | Komut |
|-------|--------|
| Local geliştirme | `npx prisma migrate dev` |
| Production deploy | `npx prisma migrate deploy` |

Deploy sırası önerisi:

1. `npx prisma migrate deploy`
2. Backend deploy / restart
3. Frontend deploy
4. Smoke test
