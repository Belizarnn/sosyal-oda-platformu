# Sosyal Oda Platformu

Final MVP — kullanıcıların oda oluşturabildiği, katılabildiği, gerçek zamanlı sohbet edebildiği, birlikte YouTube izleyebildiği ve arkadaşlarıyla dijital ortamda vakit geçirebildiği sosyal platform.

Monorepo: `frontend/` (Next.js) + `backend/` (Express + Socket.IO).

**Teslim dokümanları:** [`DEPLOYMENT.md`](DEPLOYMENT.md) · [`PRODUCTION_CHECKLIST.md`](PRODUCTION_CHECKLIST.md) · [`SMOKE_TEST.md`](SMOKE_TEST.md) · [`RELEASE_NOTES.md`](RELEASE_NOTES.md) · [`FINAL_TEST_CHECKLIST.md`](FINAL_TEST_CHECKLIST.md) · [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) · [`screenshots/`](screenshots/)

## Proje Özeti

Sosyal Oda Platformu, **oda merkezli** bir sosyal deneyim sunar: kullanıcılar ilgi alanlarına göre odalar keşfeder, katılır, chat/DM yapar, watch party düzenler ve moderasyon/admin araçlarıyla güvenli kalır. **v1.0.0-beta** production release adayı; deploy öncesi [`PRODUCTION_CHECKLIST.md`](PRODUCTION_CHECKLIST.md) ve [`SMOKE_TEST.md`](SMOKE_TEST.md) kullanın.

## Temel Özellikler

| Modül | Açıklama |
|-------|----------|
| **Auth** | Register, login, JWT oturum |
| **Profil** | Görüntüleme, düzenleme, avatar/bio |
| **Presence** | Online durum ve status mesajı |
| **Odalar** | Oluşturma, katılma, üye yönetimi |
| **Realtime Chat** | Socket.IO oda mesajlaşması |
| **Voice Panel** | LiveKit tabanlı oda içi sesli sohbet (Sprint 24) |
| **YouTube Watch Party** | Oda içi video sync altyapısı |
| **Discover** | Oda keşfi ve filtreler |
| **Invite Link** | Davet kodu ile oda erişimi |
| **Friends** | Arkadaşlık istekleri ve listesi |
| **DM** | Birebir mesajlaşma (arkadaşlar arası) |
| **Notifications** | Uygulama içi bildirimler |
| **Moderation** | Kick, mute, ban, report |
| **Admin Report Panel** | Rapor listeleme ve status yönetimi |
| **Settings** | Hesap ayarları, şifre değiştirme |

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js App Router, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Auth | JWT, bcrypt |
| Realtime | Socket.IO |
| Veritabanı | PostgreSQL (Neon) |
| ORM | Prisma |
| Deployment | Vercel (frontend), Render/Railway (backend) |

## Klasör Yapısı

```
sosyal-oda-platformu/
├── frontend/              # Next.js (port 3000)
├── backend/               # Express API + Socket.IO (port 5000)
├── DEPLOYMENT.md          # Production deploy rehberi (Sprint 40)
├── PRODUCTION_CHECKLIST.md
├── SMOKE_TEST.md
├── RELEASE_NOTES.md       # v1.0.0-beta
├── screenshots/
├── FINAL_TEST_CHECKLIST.md
├── DEMO_SCRIPT.md
├── render.yaml            # Render Blueprint örneği
├── README.md
└── .gitignore
```

## Kurulum

### Backend

```bash
cd backend
npm install
copy .env.example .env          # Windows — macOS/Linux: cp .env.example .env
# .env içine DATABASE_URL ve JWT_SECRET ekleyin
npm run prisma:generate
npx prisma migrate dev            # ilk kurulum; production: migrate deploy
npm run prisma:seed
npm run dev
```

API: [http://localhost:5000](http://localhost:5000)

### Frontend

```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

Uygulama: [http://localhost:3000](http://localhost:3000)

## Environment Değişkenleri

### Frontend (`frontend/.env.local`)

| Değişken | Local | Production |
|----------|-------|------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | `https://BACKEND_DOMAIN` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://FRONTEND_DOMAIN` |

Örnek: `frontend/.env.local.example`

### Backend (`backend/.env`)

| Değişken | Açıklama |
|----------|----------|
| `PORT` | API portu (varsayılan: `5000`) |
| `NODE_ENV` | `development` / `production` |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | JWT imzalama anahtarı (production'da zorunlu) |
| `CLIENT_URL` | Frontend URL (CORS) |
| `CORS_ORIGIN` | İzin verilen origin (production frontend domain) |
| `LIVEKIT_*` | Voice chat için zorunlu (Sprint 24) |
| `EMAIL_PROVIDER` | `resend` (Sprint 38) |
| `RESEND_API_KEY` | Resend API anahtarı (production) |
| `EMAIL_FROM` | Gönderici adresi (ör. `Sosyal Oda <noreply@domain.com>`) |
| `APP_URL` | E-posta linkleri için frontend URL |

Örnek: `backend/.env.example` — gerçek secret veya DATABASE_URL commit etmeyin.

## Database Kurulumu

1. [Neon](https://neon.tech) üzerinde PostgreSQL projesi oluşturun.
2. Connection string'i `DATABASE_URL` olarak `backend/.env` içine ekleyin.
3. Migration ve seed komutlarını çalıştırın (aşağıya bakın).

## Migration

| Ortam | Komut |
|-------|-------|
| **Local geliştirme** | `npx prisma migrate dev` |
| **Production** | `npx prisma migrate deploy` |

```bash
cd backend
npx prisma migrate status    # durum kontrolü
npm run prisma:generate
```

Gereksiz boş migration oluşturmayın.

## Seed Data

```bash
cd backend
npm run prisma:seed
```

Demo kullanıcılar, odalar, mesajlar, arkadaşlıklar, bildirimler ve OPEN rapor oluşturur. Tekrar çalıştırıldığında duplicate oluşturmaz (upsert).

> **Production uyarısı:** Seed yalnızca local/demo içindir. Production'da bilinçli karar verin.

## Çalıştırma

```bash
# Backend (geliştirme)
cd backend && npm run dev

# Backend (production build)
cd backend && npm run build && npm run start

# Frontend (geliştirme)
cd frontend && npm run dev

# Frontend (production build)
cd frontend && npm run build && npm run start
```

Health kontrolü: `curl http://localhost:5000/health`

## Demo Kullanıcılar

> Yalnızca geliştirme/demo ortamı. Production'da kullanmayın.

| E-posta | Şifre | Handle | Rol |
|---------|-------|--------|-----|
| sudenaz@example.com | password123 | sudenaz | ADMIN |
| yavuzhan@example.com | password123 | yavuzhan | MODERATOR |
| duygu@example.com | password123 | duygu | USER |
| kaan@example.com | password123 | kaan | USER |

### Demo Odalar

| Oda | Kategori | Davet Kodu |
|-----|----------|------------|
| Gece Sohbet Odası | CHAT | DEMOCHAT01 |
| Anime Watch Party | ANIME | DEMOANIME1 |
| Yazılım Çalışma Odası | SOFTWARE | DEMOCODE01 |
| Sessiz Ders Odası | STUDY | DEMOSTUDY1 |
| Oyun Lobby | GAME | DEMOGAME01 |

## Demo Senaryosu

Tam sunum akışı: [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md)

1. Landing page açılır.
2. Kullanıcı register veya demo hesapla login olur.
3. Dashboard'da presence ve yönlendirme alanları gösterilir.
4. Discover sayfasında odalar keşfedilir.
5. Rooms sayfasında yeni oda oluşturulur.
6. Oda detayına girilir.
7. Chat mesajı gönderilir.
8. Voice sekmesinde LiveKit sesli sohbet kullanılabilir.
9. Watch party panelinde YouTube linki eklenir.
10. Invite link kopyalanır (`/invite/DEMOCHAT01`).
11. Profile sayfasında profil düzenlenir.
12. Friends sayfasında arkadaşlar ve istekler gösterilir.
13. Messages sayfasında DM conversation açılır.
14. Notifications sayfasında bildirimler görülür.
15. Settings sayfasında hesap ayarları gösterilir.
16. Admin kullanıcıyla admin panel açılır.
17. Report listesi incelenir.
18. Logout yapılır.

## API Özetleri

| Önek | Modül |
|------|-------|
| `/health` | Sağlık kontrolü |
| `/auth` | Register, login |
| `/users` | Profil, presence, ayarlar |
| `/dashboard` | Kişiselleştirilmiş ana ekran verisi |
| `/rooms` | Oda CRUD, join, messages, watch, moderasyon |
| `/discover` | Keşfet |
| `/invites` | Davet önizleme |
| `/friends` | Arkadaşlık |
| `/dm` | Direkt mesaj |
| `/notifications` | Bildirimler |
| `/reports` | Kullanıcı raporları (POST) |
| `/admin` | Admin özet ve report yönetimi |
| `/voice` | LiveKit voice token |

Watch party: `/rooms/:roomId/watch` — kök `/watch` yoktur.

Detaylı endpoint dokümantasyonu aşağıdaki **Detaylı Modül Dokümantasyonu** bölümündedir.

## Socket Event Özeti

Bağlantı: `io(NEXT_PUBLIC_API_URL, { auth: { token } })`

### Oda Chat

| Yön | Event |
|-----|-------|
| C→S | `room:join`, `room:leave`, `message:send`, `typing:start`, `typing:stop` |
| S→C | `message:new`, `user:joined`, `user:left`, `typing:update`, `message:deleted` |

### Watch Party

| Yön | Event |
|-----|-------|
| C→S | `watch:join`, `watch:set-video`, `watch:play`, `watch:pause`, `watch:seek` |
| S→C | `watch:state-updated`, `watch:sync`, `watch:error` |

### DM

| Yön | Event |
|-----|-------|
| C→S | `dm:join`, `dm:leave`, `dm:message:send`, `dm:typing:start`, `dm:typing:stop` |
| S→C | `dm:message:new`, `dm:message:deleted`, `dm:typing:update` |

### Bildirim & Moderasyon

| S→C | `notification:new`, `notification:unread-count-updated` |
| S→C | `moderation:user-kicked`, `moderation:user-muted`, `moderation:user-banned` |

## Deployment Notları

Özet: Vercel (frontend) + Render/Railway (backend) + Neon (DB).

- Frontend env: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`
- Backend build: `npm install && npm run build && npx prisma generate`
- Backend start: `npm run start`
- **Local migration:** `npx prisma migrate dev`
- **Production migration:** `npx prisma migrate deploy` (deploy öncesi/sonrası bir kez)
- `CORS_ORIGIN` = frontend domain (wildcard `*` yok)
- Demo seed production'da otomatik çalışmaz; `NODE_ENV=production` iken `ALLOW_DEMO_SEED=true` olmadan engellenir

Tam rehber: [`DEPLOYMENT.md`](DEPLOYMENT.md) · Checklist: [`PRODUCTION_CHECKLIST.md`](PRODUCTION_CHECKLIST.md) · Smoke test: [`SMOKE_TEST.md`](SMOKE_TEST.md)

## Bilinen Eksikler / TODO

- Voice MVP dışında: **screen share**, **recording**, **spatial audio**, gelişmiş **noise suppression** yok.
- Watch party için tam **YouTube IFrame API sync** geliştirilebilir.
- **Premium / ödeme** altyapısı eklendi (Sprint 28); Stripe abonelik entegrasyonu Sprint 29'da.
- Gelişmiş **admin analytics** yok.
- **Push notification** yok (yalnızca uygulama içi).
- **Hesap silme** yok.
- **Mobil PWA** altyapısı eklendi (Sprint 34); offline cache sonraki aşamada.
- **Analytics event tracking** altyapısı eklendi (Sprint 36); dış servis entegrasyonu zorunlu değil.
- **Feedback sistemi** eklendi (Sprint 37); basit geri bildirim toplama, admin listesi ve durum yönetimi.
- **Beta mode** altyapısı eklendi (Sprint 39); davet kodu, politika sayfaları ve kontrollü kayıt.
- **Production release hazırlığı** tamamlandı (Sprint 40); deploy dokümanları, checklist, smoke test, seed production koruması.
- Voice **LiveKit provider ayarı** gerektirir; yapılandırma yoksa voice çalışmaz.
- Stripe **test mode** kullanılır; live geçiş ayrı yapılandırma gerektirir.
- Offline **PWA cache** sınırlıdır; tam offline destek yok.
- Gelişmiş **AI moderation** yok.
- **Native mobil app** yok (PWA).
- Beta **hukuki metinleri** (privacy, terms) production öncesi profesyonel gözden geçirilmeli — placeholder'dır.
- **Rate limiting** temel katman eklendi (Sprint 30); gelişmiş abuse detection sonraki aşamada.
- Gelişmiş **abuse/spam detection** sonraki aşamada.
- Bildirim tercihleri notification üretiminde kullanıcı tercihlerine göre filtrelenir (Sprint 27).

## Performance Notes (Sprint 32)

Veri büyüdükçe API ve UI yanıt sürelerini kontrol altında tutmak için cursor tabanlı pagination, Prisma `select` optimizasyonu ve veritabanı indexleri eklendi.

### Pagination kullanılan endpointler

| Endpoint | Varsayılan limit | Max limit | Response |
|----------|------------------|-----------|----------|
| `GET /rooms` | 20 | 50 | `{ rooms, nextCursor }` |
| `GET /discover/rooms` | 20 | 50 | `{ rooms, nextCursor, meta }` |
| `GET /rooms/:roomId/messages` | 50 | 100 | `{ messages, nextCursor }` |
| `GET /dm/conversations/:id/messages` | 50 | 100 | `{ messages, nextCursor }` |
| `GET /notifications` | 20 | 50 | `{ notifications, nextCursor, unreadCount }` |
| `GET /admin/reports` | 20 | 50 | `{ reports, nextCursor }` |

Query parametreleri: `limit`, `cursor` (opsiyonel). Mesaj endpointlerinde ek olarak `before` (messageId veya ISO tarih) ile daha eski mesajlar yüklenir.

### Database indexleri

Migration: `npx prisma migrate dev --name add_performance_indexes`

Eklenen indexler: `User` (handle, email, presenceStatus), `Room` (category, type, isActive, createdAt, currentUserCount), `RoomMember`, `Message`, `DirectMessage`, `Notification`, `FriendRequest`, `Friendship` — ayrıntılar `backend/prisma/schema.prisma` içinde.

### N+1 query notları

- Oda detay üyeleri ve discover listeleri tek sorguda `select` ile çekilir; `passwordHash` asla seçilmez.
- Admin rapor listesinde mesaj içeriği kısaltılır; tam içerik yalnızca detay endpointinde.
- Dashboard ve friends activity batch sorgular kullanır; döngü içinde tekrarlayan Prisma çağrısı yoktur.

### Production'da log azaltma

Geliştirme ortamında ayrıntılı Prisma logları açık olabilir; production'da yalnızca `error` seviyesi kullanın. Socket.IO debug logları production build'de kapalı tutulmalıdır.

### Büyük listelerde limit kullanımı

Frontend ilk yüklemede varsayılan limit ile veri çeker; `nextCursor` varsa "Daha fazla yükle" / "Daha eski mesajları yükle" butonları ek sayfa getirir. Realtime yeni mesajlar mevcut listeye eklenir; pagination cursor'ı etkilemez.

### Landing görselleri

`frontend/public/landing/` altındaki görseller (Canva export veya placeholder) mümkün olduğunca küçük tutulmalıdır (tercihen WebP, hedef &lt; 200 KB). Büyük PNG dosyalarından kaçının; uygun yerlerde Next.js `Image` bileşeni kullanın.

## Premium Altyapısı (Sprint 28)

Premium sistemi **özelleştirme ve görünüm** odaklıdır. Temel platform (odalar, chat, arkadaşlar, keşif) ücretsiz kalır. Sprint 28'de görünüm altyapısı kuruldu; **Stripe abonelik/ödeme entegrasyonu Sprint 29**'da eklendi (test mode).

### User premium alanları

| Alan | Açıklama |
|------|----------|
| `isPremium` | Premium aktif bayrağı |
| `premiumStartedAt` | Premium başlangıç tarihi |
| `premiumExpiresAt` | Bitiş tarihi (null = süresiz) |
| `premiumPlan` | `FREE`, `PREMIUM_MONTHLY`, `PREMIUM_YEARLY` |
| `premiumBadgeVisible` | Rozet görünürlüğü |
| `premiumProfileFrame` | `violet-glow`, `indigo-ring`, `cosmic-haze` |
| `premiumAvatarEffect` | `soft-pulse`, `shimmer`, `orbit` |
| `stripeCustomerId` | Stripe müşteri ID (Sprint 29) |

Migration: `npx prisma migrate dev --name add_premium_foundation`

### API

**GET `/premium/status`** (Bearer) — `isPremium`, `plan`, tarihler, `features` ve `subscription` objesi döner.

**PATCH `/premium/preferences`** (Bearer, yalnızca premium) — rozet, çerçeve ve avatar efekti. Premium değilse `403`.

### Frontend

- `/premium` — plan kartları ve checkout başlatma
- `/premium/success`, `/premium/cancel` — Stripe dönüş sayfaları
- Ayarlar → Premium bölümü (billing portal)
- Profilde rozet, çerçeve ve avatar efekti

Demo premium: seed kullanıcısı `@yavuzhan` (manuel premium; Stripe webhook ile çakışmaz)

## Stripe Premium Ödeme (Sprint 29)

Premium aktivasyonu **yalnızca backend webhook** ile yapılır. Frontend secret key görmez; sadece checkout/portal oturumu başlatır.

### Environment (`backend/.env`)

| Değişken | Açıklama |
|----------|----------|
| `STRIPE_SECRET_KEY` | Stripe **test** secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook imza secret (`whsec_...`) |
| `STRIPE_PREMIUM_MONTHLY_PRICE_ID` | Aylık price ID (`price_...`) |
| `STRIPE_PREMIUM_YEARLY_PRICE_ID` | Yıllık price ID (`price_...`) |
| `CLIENT_URL` | Frontend URL (success/cancel dönüşleri) |

Gerçek production key'leri commit etmeyin. `.env.example` şablonunu kullanın.

### Stripe Dashboard test kurulumu

1. [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) → **Test mode** açık olsun.
2. **Products** → Premium Monthly / Yearly ürünleri oluşturun (recurring prices).
3. Price ID'leri `.env` dosyasına yazın.
4. **Developers → Webhooks** → endpoint: `POST {BACKEND_URL}/payments/webhook`
5. Dinlenecek eventler:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Local webhook testi

Stripe CLI ile backend'e event iletmek için:

```bash
stripe listen --forward-to localhost:5000/payments/webhook
```

CLI çıktısındaki `whsec_...` değerini `STRIPE_WEBHOOK_SECRET` olarak kullanın.

### Checkout akışı

1. Kullanıcı `/premium` sayfasında plan seçer → **Premium'a Geç**
2. Frontend `POST /payments/create-checkout-session` (`{ "plan": "MONTHLY" | "YEARLY" }`)
3. Backend Stripe customer + checkout session oluşturur → `{ checkoutUrl }`
4. Kullanıcı Stripe Checkout'ta ödeme yapar
5. Success: `/premium/success` — webhook birkaç saniye içinde `isPremium` günceller
6. Cancel: `/premium/cancel`

Price ID frontend'den alınmaz; backend plan'a göre env'den seçer.

### Customer portal

Premium kullanıcı Ayarlar → Premium'da **Aboneliğimi Yönet**:

- `POST /payments/create-customer-portal-session` (Bearer)
- Kullanıcının `stripeCustomerId` değeri olmalı
- Response: `{ portalUrl }` → Stripe billing portal

### API endpointleri

| Endpoint | Auth | Açıklama |
|----------|------|----------|
| `POST /payments/create-checkout-session` | Bearer | Checkout URL döner |
| `POST /payments/create-customer-portal-session` | Bearer | Billing portal URL |
| `POST /payments/webhook` | Stripe imza | Raw body + signature doğrulama |

### Veritabanı modelleri

- `Subscription` — Stripe abonelik durumu
- `PaymentEvent` — Webhook idempotency (`eventId` unique)
- Migration: `npx prisma migrate dev --name add_stripe_subscriptions`

Aktif premium status: `active`, `trialing`. Kapatılır: `canceled`, `unpaid`, `incomplete_expired`.

### Test kartları

Stripe test kartları için resmi dokümantasyonu kullanın: [Stripe test cards](https://docs.stripe.com/testing#cards)

Örnek başarılı kart: `4242 4242 4242 4242` (gelecek tarih, rastgele CVC).

### Production notları

- Sprint 29 sonunda production ödeme **zorunlu değildir**; test mode yeterlidir.
- Production'a geçerken live key (`sk_live_...`), live price ID'ler ve ayrı webhook endpoint kullanın.
- Webhook imza doğrulamasını asla devre dışı bırakmayın.
- Türkiye hesabı veya yerel ödeme ihtiyacı olursa ileride iyzico/PayTR değerlendirilebilir.

### Güvenlik

- Stripe secret frontend bundle'a gitmez.
- Webhook: `stripe.webhooks.constructEvent` + `STRIPE_WEBHOOK_SECRET`
- Kullanıcı yalnızca kendi checkout/portal oturumunu başlatır (Bearer token).
- Duplicate webhook: `PaymentEvent.eventId` unique kontrolü.

## Redis / Realtime Scaling (Sprint 33)

Birden fazla backend instance üzerinde Socket.IO ve presence verisini paylaşmak için Redis altyapısı eklendi. Local development Redis olmadan çalışmaya devam eder.

### Neden Redis?

- Socket.IO eventlerinin instance'lar arası yayılması (`@socket.io/redis-adapter`)
- Online kullanıcı ve aktif oda bilgisinin hızlı okunması (presence cache)
- Friends activity ve dashboard'da gerçek zamanlı oda/presence verisi

### Environment

| Değişken | Local (varsayılan) | Production |
|----------|-------------------|------------|
| `ENABLE_REDIS` | `false` | `true` |
| `REDIS_URL` | `redis://localhost:6379` | Provider connection string |

`ENABLE_REDIS=false` iken uygulama crash etmez; in-memory fallback kullanılır.

### Socket.IO Redis adapter

`ENABLE_REDIS=true` ve Redis erişilebilir olduğunda `backend/src/socket/socket.ts` adapter'ı etkinleştirir. Bağlantı başarısız olursa development'ta uyarı verilir ve tek instance modunda devam edilir. Production'da Redis kullanımı önerilir; çoklu instance deployment için `ENABLE_REDIS=true` zorunlu kabul edilmelidir.

### Presence cache keyleri

| Key | Açıklama |
|-----|----------|
| `online:user:{userId}:sockets` | Kullanıcının aktif socket ID set'i |
| `socket:owner:{socketId}` | Socket → user eşlemesi |
| `user:currentRoom:{userId}` | Kullanıcının socket üzerinden aktif oda ID'si |
| `room:active:{roomId}` | Odada aktif kullanıcı ID set'i |
| `room:user:{roomId}:{userId}:sockets` | Kullanıcının odadaki socket sayısı (çoklu tab) |

Helper: `backend/src/services/presenceCache.service.ts`

### Fallback in-memory mode

Redis kapalı veya bağlantı kurulamazsa aynı API in-memory `Map`/`Set` ile çalışır. Friends activity ve dashboard, cache'te veri yoksa database `presenceStatus` / üyelik sorgularına düşer.

### Local Redis (opsiyonel)

```bash
docker compose -f docker-compose.redis.yml up -d
```

Ardından `backend/.env` içinde:

```
ENABLE_REDIS=true
REDIS_URL=redis://localhost:6379
```

## Mobil Web & PWA (Sprint 34)

Web uygulaması mobil tarayıcıda daha uygulama benzeri hissettirmek için PWA manifest, mobil bottom navigation ve dokunmatik arayüz iyileştirmeleri eklendi. **Native Android/iOS uygulama yok**; yalnızca mobil web + installable PWA hazırlığı.

### PWA manifest

- Dosya: `frontend/public/manifest.json`
- `start_url`: `/dashboard`
- `display`: `standalone`
- Root layout metadata: manifest, `themeColor`, `appleWebApp`, icons

Manifest tarayıcıdan erişilebilir: `http://localhost:3000/manifest.json`

### Icon dosyaları

Placeholder ikonlar (gerçek marka ikonları tasarlanacak):

| Dosya | Boyut | Açıklama |
|-------|-------|----------|
| `frontend/public/icons/icon-192.png` | 192×192 | Standart ikon |
| `frontend/public/icons/icon-512.png` | 512×512 | Standart ikon |
| `frontend/public/icons/maskable-icon-512.png` | 512×512 | Maskable (Android) |

Production öncesi profesyonel ikon seti ile değiştirin.

### Service worker / offline cache

Bu sprintte **kapsamlı offline cache yok**. Service worker veya `next-pwa` eklenmedi; karmaşıklığı artırmamak için yalnızca installable PWA (manifest + metadata) hazırlandı. Offline cache sonraki aşamada değerlendirilecek.

### Mobil bottom navigation

Desktop sidebar korunur (`lg+`). Mobilde (`< lg`) alt navigasyon:

| Sekme | Route |
|-------|-------|
| Ana Sayfa | `/dashboard` |
| Odalar | `/rooms` |
| Mesajlar | `/messages` |
| Bildirimler | `/notifications` |
| Profil | `/profile/{handle}` |

Bileşen: `frontend/src/components/layout/MobileBottomNav.tsx`

- Safe area (`env(safe-area-inset-bottom)`) destekli
- Ayarlar ve admin: topbar profil menüsü / hamburger sidebar
- Hamburger menü: arkadaşlar, keşif, ayarlar gibi ikincil linkler

### Mobil UX iyileştirmeleri

- Chat/DM input: alt sabit, klavye-safe padding, min 44px dokunma alanı
- Room detail: yatay scroll tablar, watch player taşma koruması
- Form/modal: mobilde alttan açılır, `max-h-[90dvh]` scroll
- Touch target: butonlar min ~40px yükseklik
- Dashboard: bilgilendirici “Ana ekrana ekle” kartı (`PwaInstallCard`)

### Lighthouse PWA kontrolü

Chrome DevTools → Lighthouse → Progressive Web App ile temel kontrolleri çalıştırın. Manifest ve installability için geçer; offline/service worker kriterleri bilinçli olarak sonraki sprinte bırakıldı.

## Analytics Event Tracking (Sprint 36)

Ürün metriklerini ölçmek için dahili, minimal event tracking altyapısı eklendi. Google Analytics / Mixpanel gibi dış servisler **bu sprintte zorunlu değil**.

### Veri minimizasyonu (privacy)

Analytics'e **yazılmayan** veriler:

- Şifre, token, JWT
- Mesaj içeriği (room chat / DM)
- E-posta adresi (açık hali)
- Ödeme / kart bilgisi

Yalnızca event adı, metadata (roomId, category vb.) ve opsiyonel `sessionId` / `path` kaydedilir. Backend `sanitizeAnalyticsProperties` ile hassas anahtarları filtreler.

### Prisma modeli

`AnalyticsEvent`: `eventName`, `userId?`, `properties?`, `sessionId?`, `path?`, `userAgent?`, `createdAt`

Migration: `npx prisma migrate dev --name add_analytics_events`

### API

**POST `/analytics/events`** — Auth opsiyonel. Login kullanıcıda `userId` otomatik set edilir.

```json
{
  "eventName": "room_joined",
  "properties": { "roomId": "...", "category": "CHAT" },
  "sessionId": "...",
  "path": "/rooms/..."
}
```

Rate limit: `analyticsLimiter` (120/dk). `eventName` max 80 karakter, `[a-z0-9_]` formatı.

### Backend sistem eventleri

| Event | Tetikleyici |
|-------|-------------|
| `user_registered` | Kayıt |
| `user_logged_in` | Giriş |
| `room_created` | Oda oluşturma |
| `room_joined` | Odaya katılma |
| `message_sent` | Room mesajı (içerik yok) |
| `friend_request_sent` | Arkadaşlık isteği |
| `dm_sent` | DM mesajı (içerik yok) |
| `watch_video_set` | Watch party video seçimi |
| `premium_checkout_started` | Stripe checkout başlatma |

Helper: `backend/src/lib/analytics.ts` → `trackServerEvent()`

### Frontend client

`frontend/src/lib/analytics.ts` → `trackEvent(eventName, properties?)`

- Sessiz fail (UX bozulmaz)
- `sessionId` localStorage'da tutulur
- `path` otomatik eklenir

Frontend eventleri: `landing_cta_clicked`, `login_submitted`, `register_submitted`, `dashboard_opened`, `room_create_clicked`, `room_join_clicked`, `friend_request_clicked`, `dm_opened`, `watch_party_opened`, `premium_page_opened`

### Admin analytics

**GET `/admin/analytics/summary`** (ADMIN / MODERATOR) — event count özeti.

Frontend: `/admin/analytics` — basit kart görünümü.

## Feedback Sistemi (Sprint 37)

Beta ve MVP kullanıcılarından geri bildirim, hata bildirimi ve özellik isteği toplamak için basit bir feedback sistemi eklendi. Büyük ticket sistemi veya dosya upload **yok**.

### Prisma modeli

Enumlar: `FeedbackType` (GENERAL, BUG, FEATURE_REQUEST, UX), `FeedbackStatus` (OPEN, REVIEWED, PLANNED, RESOLVED, REJECTED)

`Feedback`: `userId?`, `type`, `status`, `title`, `message`, `rating?`, `pageUrl?`, `userAgent?`, `createdAt`, `updatedAt`

Migration: `npx prisma migrate dev --name add_feedback_system`

### API

**POST `/feedback`** — Auth opsiyonel. Login kullanıcıda `userId` otomatik set edilir.

```json
{
  "type": "BUG",
  "title": "Oda açılmıyor",
  "message": "Odaya girerken hata aldım.",
  "rating": 3,
  "pageUrl": "/rooms/123"
}
```

Kurallar: `title` max 120, `message` max 1000, `rating` 1–5 opsiyonel. Rate limit: `feedbackLimiter` (5 / 10 dk). Mesaj `sanitizeText` ile temizlenir.

Yanıt: `{ "message": "Geri bildirimin için teşekkürler." }`

**GET `/admin/feedback`** — ADMIN / MODERATOR. Query: `status`, `type`, `limit`, `cursor`

**PATCH `/admin/feedback/:feedbackId/status`** — ADMIN only. Body: `{ "status": "REVIEWED" }`

Admin yanıtlarında `passwordHash` dönmez; kullanıcı bilgisi yalnızca `id`, `username`, `handle`, `avatarUrl`.

### Analytics

Feedback gönderiminde `feedback_submitted` eventi kaydedilir (type, hasRating metadata).

### Frontend

- `frontend/src/components/feedback/` — `FeedbackButton`, `FeedbackModal`, `FeedbackTypeSelect`, `RatingInput`
- Sağ altta floating buton (AppShell + landing)
- Settings → Hesap bölümünde inline link
- Admin: `/admin/feedback`

### Güvenlik

- Spam rate limit
- HTML/control char sanitize
- Modal'da hassas veri uyarısı (şifre/token/ödeme yazma)

### Test adımları

1. Login kullanıcı feedback gönderebiliyor mu?
2. Login olmayan kullanıcı feedback gönderebiliyor mu? (`userId: null`)
3. Zorunlu alan validation çalışıyor mu?
4. Rate limit çalışıyor mu? (5 istek / 10 dk)
5. Admin feedback listesi açılıyor mu? (`/admin/feedback`)
6. Admin status güncelleyebiliyor mu?
7. Normal kullanıcı admin feedback'e erişemiyor mu?
8. Feedback modal mobilde düzgün mü?

## Beta Mode (Sprint 39)

Production release öncesi kontrollü beta süreci için altyapı eklendi. **Bu sprint production release yapmaz.**

### Environment

`backend/.env.example`:

```env
BETA_MODE=true
BETA_ACCESS_REQUIRED=true
```

- `BETA_MODE` — beta banner ve public config'te betaMode
- `BETA_ACCESS_REQUIRED` — kayıt sırasında beta kodu zorunlu mu?

Beta mode kapalıyken (`BETA_ACCESS_REQUIRED=false`) mevcut register akışı değişmez.

### Prisma modelleri

- `BetaAccessCode`: `code` (unique), `maxUses`, `usedCount`, `isActive`, `expiresAt?`
- `BetaAccessRedemption`: `codeId`, `userId`, `redeemedAt`

Migration: `npx prisma migrate dev --name add_beta_access`

### Demo beta kodu (seed)

```
BETA-TEST-2026
maxUses: 100
```

Seed: `npx prisma db seed`

### Public config

**GET `/public/config`** — auth gerekmez.

```json
{
  "betaMode": true,
  "betaAccessRequired": true
}
```

Frontend register sayfası bu endpoint ile beta input gösterir.

### Register + beta code

`BETA_ACCESS_REQUIRED=true` iken register body:

```json
{
  "username": "...",
  "handle": "...",
  "email": "...",
  "password": "...",
  "betaCode": "BETA-TEST-2026"
}
```

Backend doğrulama: aktif, süresi dolmamış, `usedCount < maxUses`. Kullanımda atomik increment + redemption kaydı.

### Admin beta kodları

- **GET `/admin/beta-codes`** — ADMIN only
- **POST `/admin/beta-codes`** — ADMIN only

Frontend: `/admin/beta-codes`

### Politika sayfaları (placeholder)

- `/community-guidelines`
- `/privacy`
- `/terms`
- `/beta` — geri bildirim linki/modal

Landing footer: politika linkleri + giriş/kayıt.

### Beta banner

Beta mode aktifken landing, login ve register sayfalarında bilgilendirme banner'ı.

### Beta test akışı

1. `BETA_ACCESS_REQUIRED=true` ayarla
2. `npx prisma db seed` → `BETA-TEST-2026`
3. `/public/config` → beta flags doğrula
4. Kod olmadan register → 400
5. Geçersiz kod → 400
6. Geçerli kod ile register → başarılı, `usedCount` artar
7. `/admin/beta-codes` → kod listesi ve yeni kod oluştur
8. Politika sayfalarını ve footer linklerini kontrol et

## Production Release (Sprint 40)

İlk production release hazırlığı — **yeni özellik eklenmedi**. Odak: build doğrulama, env, deploy dokümantasyonu, smoke test, rollback planı.

### Release dokümanları

| Dosya | İçerik |
|-------|--------|
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | Vercel, Render/Railway, Neon, Redis, LiveKit, Stripe, Resend, migration, rollback |
| [`PRODUCTION_CHECKLIST.md`](PRODUCTION_CHECKLIST.md) | Canlıya alma checklist |
| [`SMOKE_TEST.md`](SMOKE_TEST.md) | 16+ adımlı smoke test senaryosu |
| [`RELEASE_NOTES.md`](RELEASE_NOTES.md) | v1.0.0-beta özellikler ve bilinen eksikler |

### Final build

```bash
# Backend
cd backend && npm install && npx prisma generate && npm run build && npm run start

# Frontend
cd frontend && npm install && npm run build && npm run start
```

### Migration

| Ortam | Komut |
|-------|--------|
| Local | `npx prisma migrate dev` |
| Production | `npx prisma migrate deploy` |

### Security checklist (özet)

- Güçlü `JWT_SECRET` (production'da ≥32 karakter)
- `DATABASE_URL` / API key'ler kodda yok; `.env` gitignore'da
- `passwordHash` response'da yok
- Stripe webhook signature (`constructEvent`)
- Admin role protection, rate limit, Helmet, Socket JWT auth
- CORS allowlist — wildcard `*` yok

### Monitoring (öneri, zorunlu değil)

- **Sentry** veya **Logtail** production hata izleme için önerilir
- Backend request log: method, path, status, duration (body/token loglanmaz)
- Stripe webhook delivery logları düzenli kontrol

### Health

`GET /health` → `{ status, environment, message }` — secret içermez.

## Güvenlik Notları

- `passwordHash` hiçbir API yanıtında dönmez.
- `.env` dosyaları git'e eklenmez; `DATABASE_URL` ve `JWT_SECRET` kod içinde yoktur.
- Admin endpointleri backend'de role kontrolü yapar.
- Banlı kullanıcı odaya katılamaz; mute kullanıcı chat mesajı gönderemez.
- DM yalnızca arkadaşlar arasında; katılımcı olmayan conversation'a erişilemez.
- JWT token blacklist yok; logout frontend token temizliği ile çalışır.
- Production'da güçlü `JWT_SECRET` (en az 32 karakter) ve HTTPS kullanın.

## Security & Abuse Protection (Sprint 30)

Production öncesi temel abuse koruması:

| Katman | Açıklama |
|--------|----------|
| **Helmet** | Temel HTTP güvenlik header'ları (`contentSecurityPolicy: false` — frontend YouTube embed etkilenmesin) |
| **CORS** | Production'da `*` yok; `CLIENT_URL` / `CORS_ORIGIN` / dev `localhost:3000` |
| **Global rate limit** | 15 dk / 1000 istek |
| **Auth brute-force** | Login: 15 dk / 20; Register: 1 sa / 10 |
| **Message spam** | HTTP DM: 1 dk / 60; Socket: min 1 sn aralık, 5 sn / max 8 mesaj |
| **Report abuse** | 10 dk / 10 rapor |
| **Invite preview** | 10 dk / 50 istek |
| **Input sanitize** | `sanitizeText` / `trimAndLimit` — username, bio, chat, DM, report, oda alanları |
| **JWT** | `expiresIn: 7d`; production'da zayıf secret reddedilir |
| **Socket auth** | Token zorunlu; oda/DM join üyelik kontrolü; notification `user:{id}` odası |
| **Captcha (TODO)** | `CAPTCHA_PROVIDER`, `CAPTCHA_SECRET` — `verifyCaptcha` placeholder |

Dosyalar:
- `backend/src/middleware/rateLimit.middleware.ts`
- `backend/src/utils/sanitizeInput.ts`
- `backend/src/utils/socketMessageThrottle.ts`
- `backend/src/lib/captcha.ts`

### Sprint 30 test adımları

1. Login'i 20+ kez hızlı dene → **429** + `"Çok fazla deneme yaptın..."`
2. Register spam → **429**
3. Report spam → **429**
4. Socket chat hızlı mesaj → `"Çok hızlı mesaj gönderiyorsun."`
5. DM socket spam → aynı hata
6. API yanıtlarında `passwordHash` yok
7. USER rolü `/admin/*` → **403**
8. Discover'da yalnızca PUBLIC odalar
9. Token olmadan korumalı endpoint → **401**
10. YouTube watch party embed çalışıyor (Helmet backend'de CSP kapalı)
11. Local dev CORS (`localhost:3000`) çalışıyor
12. Production `.env.example` değerleri doğru

**Production öncesi öneri:** Turnstile/hCaptcha/reCAPTCHA entegrasyonu (`verifyCaptcha` implementasyonu).

## Erişim Politikası

- Platform içeriği yalnızca giriş yapan kullanıcılara açıktır.
- Public sayfalar: `/` (landing), `/login`, `/register`.
- Rooms, Discover, Profile, Invite, Dashboard, Messages, Friends, Notifications, Settings, Admin ve diğer sosyal alanlar **auth gerektirir**.
- Frontend: `(app)` route grubu `ProtectedRoute` ile korunur; token `localStorage` (`sosyal_oda_token`) üzerinden kontrol edilir.
- Backend: `GET /rooms`, `GET /rooms/:id`, `GET /discover/rooms`, `GET /users/:handle`, `GET /invites/:inviteCode` token olmadan **401** döner.
- Token yoksa backend mesajı: `"Bu içeriğe erişmek için giriş yapmalısın."`

## Landing Page (Premium Vitrin)

- Public marketing sayfası: `/` — girişsiz görüntülenebilir; uygulama sidebar/topbar içermez.
- Ana CTA **“Hadi Başlayalım”** → auth choice modal açar (Giriş Yap / Kayıt Ol).
- Landing’den `/discover`, `/rooms` veya diğer iç sayfalara **doğrudan geçiş yok**.
- Scroll reveal: `ScrollReveal` bileşeni (IntersectionObserver, tekrar edilebilir animasyon, `prefers-reduced-motion` desteği).
- Çoklu dil (landing): [`next-intl`](https://next-intl.dev/) paketi + `frontend/messages/` (`tr`, `en`, `de`).
- Dil seçimi: landing sağ üst `LanguageSwitcher`, `localStorage` anahtarı `sosyal_oda_landing_locale`.
- **Full locale routing** (`/tr`, `/en` …) bilinçli olarak uygulanmadı — mevcut auth (`localStorage` token) ve app route yapısı korunur; tam uygulama çevirisi sonraki aşamada genişletilebilir.
- İleride eklenecek diller için yapı hazır: zh, es, hi, pt, ru, ja, ko, id, fr, it, fa.
- Canva görselleri: `frontend/public/landing/` (ör. `hero-main.png`, `dashboard-preview.png`).

## UX Prensipleri (Sprint 21)

- Kullanıcı **az tıklamayla** işlem yapmalı.
- Her ekranda **tek ana aksiyon** belirgin olmalı.
- Gelişmiş ayarlar varsayılan olarak gizli; gerektiğinde açılmalı.
- Boş ekranlar kullanıcıyı **net bir sonraki adıma** yönlendirmeli.
- İlk kullanıcı deneyimi (dashboard, onboarding, oda oluşturma) **sade** tutulmalı.
- Sidebar sadeleştirildi: Keşfet ana menüden kaldırıldı; popüler odalar `/rooms` içinden erişilir.
- Oda kartlarında **Katıl** tek tıkla join + yönlendirme yapar; üye ise **Odaya Gir** gösterilir.

## Akıllı Dashboard (Sprint 22)

`GET /dashboard` endpointi giriş yapmış kullanıcı için kişiselleştirilmiş ana ekran verisi döner.

### Endpoint

```
GET /dashboard
Authorization: Bearer <token>
```

Yanıt alanları:
- `continueRoom` — son katılınan aktif oda (yoksa `null`)
- `recommendedRooms` — `profileInterests` → kategori eşleşmesi; ilgi yoksa popüler PUBLIC odalar
- `friendsInRooms` — arkadaşların bulunduğu PUBLIC aktif odalar
- `onlineFriends` — çevrimiçi arkadaşlar
- `recentNotifications` — son 3 bildirim
- `quickStats` — `roomsJoined`, `friendsCount`, `unreadNotifications`

### Kişiselleştirme mantığı

| İlgi alanı (ör.) | Oda kategorisi |
|------------------|----------------|
| Oyun | GAME |
| Film | FILM |
| Anime | ANIME |
| Ders | STUDY |
| Yazılım | SOFTWARE |
| Müzik | MUSIC |
| Spor | SPORTS |
| Sohbet / Sosyal | CHAT |

Kurallar:
- Yalnızca **PUBLIC** ve **aktif** odalar önerilir.
- `passwordHash` hiçbir yanıtta dönmez.
- PRIVATE / INVITE_ONLY odalar öneri listesinde yer almaz.

### Dashboard test adımları

1. Login sonrası `/dashboard` açılır; hero alanı kullanıcıyı karşılar.
2. 4 ana aksiyon kartı doğru linklere gider (`/rooms`, `/rooms?action=create`, `/friends`, `/messages`).
3. Daha önce odaya katıldıysan **Devam Et** kartı görünür.
4. Katılım yoksa yönlendirici empty state + **Odaları Gör** butonu görünür.
5. `profileInterests` dolu kullanıcıda önerilen odalar ilgili kategorilerden gelir.
6. Arkadaş aktif odadaysa **Arkadaşların Nerede?** bölümünde listelenir.
7. Son 3 bildirim mini kartta görünür; yoksa empty mesaj.
8. Presence selector ve durum mesajı düzenleme alanı çalışmaya devam eder.

## Oda Detay Merkezi (Sprint 23)

Oda detay sayfası (`/rooms/[roomId]`) artık chat, voice, watch party, üyeler ve oda bilgisini **sekme tabanlı** bir merkezde sunar. Chat, voice ve watch party aynı anda karmaşık görünmez; kullanıcı odaya girince ne yapabileceğini hemen anlar.

### Bileşen yapısı

```
frontend/src/components/rooms/detail/
├── RoomHeader.tsx      # Oda adı, badge'ler, owner, davet, join/leave
├── RoomTabs.tsx        # Chat | Voice | Watch | Üyeler | Bilgi
├── RoomJoinGate.tsx    # Üye değilken büyük katılım ekranı
├── RoomActions.tsx     # Join / Leave aksiyonları
├── RoomMembersPanel.tsx
└── RoomInfoPanel.tsx
```

Ana orchestrator: `frontend/src/components/rooms/RoomDetailView.tsx`

### Sekmeler

| Sekme | İçerik |
|-------|--------|
| **Chat** | Mevcut `ChatPanel` (Socket.IO korunur) |
| **Voice** | Mevcut `VoicePanel` — üye değilse uyarı |
| **Watch** | Mevcut `WatchPartyPanel` — host kontrolü korunur |
| **Üyeler** | Avatar, handle, rol, presence, mute/ban, moderation menüsü |
| **Bilgi** | Açıklama, kurallar (placeholder), kategori, tip, oluşturulma, owner, davet |

### Katılım ve presence

- Kullanıcı üye değilse `RoomJoinGate` + header'da **Odaya Katıl** görünür.
- Şifreli odada katılım öncesi şifre alanı açılır; ban hatası backend mesajı olarak gösterilir.
- Odaya katılınca sekmeler aktif olur; `PATCH /users/me/presence` ile `presenceStatus: IN_ROOM` ve `statusMessage: "{roomName} odasında"` güncellenir.
- Odadan ayrılınca presence eski haline dönmeyebilir (TODO).

### GET /rooms/:id yanıtı

Mevcut format korunur; `passwordHash` dönmez:

```json
{
  "room": { "...": "..." },
  "owner": { "...": "..." },
  "members": [],
  "isMember": true,
  "currentUserRole": "MEMBER",
  "canManageInvite": false
}
```

Oda kuralları (`rules`) alanı backend migration yapılmadan frontend placeholder olarak bırakıldı.

### Oda detay test adımları

1. `/rooms/[roomId]` açılır; `RoomHeader` oda adı, kategori, tip, üye sayısı ve owner gösterir.
2. Üye değilsen büyük **Odaya Katıl** gate'i görünür; katılınca sekmeler aktif olur.
3. **Chat** sekmesinde mesajlaşma ve socket bağlantısı çalışır.
4. **Voice** sekmesinde `VoicePanel` açılır.
5. **Watch** sekmesinde `WatchPartyPanel` açılır.
6. **Üyeler** sekmesinde rol badge'leri ve moderation menüsü görünür.
7. **Bilgi** sekmesinde oda açıklaması ve davet ayarları (yetkili kullanıcıda) görünür.
8. Owner/moderator davet linkini header'dan kopyalayabilir.
9. Katılım sonrası presence `IN_ROOM` olur.
10. Mobilde sekmeler yatay kaydırılabilir tab bar olarak kullanılır.

## Sosyal Bağlar (Sprint 26)

Arkadaş sistemi güçlendirildi: aktivite takibi, ortak arkadaşlar, odaya hızlı katılım ve gelişmiş Friends sayfası.

### GET /friends/activity

```
GET /friends/activity
Authorization: Bearer <token>
```

Yanıt: arkadaşların `presenceStatus`, `statusMessage` ve görünür `currentRoom` bilgisi.

**Oda görünürlük kuralları:**
- `PRIVATE` odalar asla `currentRoom` olarak dönmez
- `INVITE_ONLY` odalar yalnızca sen de üyeysen görünür
- `passwordHash` hiçbir yanıtta dönmez

### GET /users/:handle/social

```
GET /users/:handle/social
Authorization: Bearer <token>
```

Yanıt:
```json
{
  "isFriend": true,
  "friendshipStatus": "FRIENDS",
  "mutualFriendsCount": 2,
  "mutualFriends": []
}
```

`friendshipStatus`: `FRIENDS` | `PENDING_SENT` | `PENDING_RECEIVED` | `NONE`

### Frontend bileşenleri

```
frontend/src/components/friends/
├── FriendActivityCard.tsx
├── FriendsTabs.tsx
├── MutualFriends.tsx
└── SocialConnectionPanel.tsx
```

- **Friends sayfası:** Arkadaşlar | Aktif Olanlar | Gelen İstekler | Gönderilen İstekler sekmeleri
- **Profil:** `SocialConnectionPanel` — arkadaşlık durumu, ortak arkadaşlar, mesaj/istek aksiyonları
- **Dashboard:** “Arkadaşların Nerede?” alanı `/friends/activity` endpointinden beslenir

### Sprint 26 test adımları

1. `GET /friends/activity` arkadaş listesini döner
2. Arkadaş `IN_ROOM` presence ile görünür
3. Arkadaş PUBLIC odadaysa oda adı görünür; **Odaya Katıl** çalışır
4. PRIVATE oda bilgisi sızmaz
5. Profilde ortak arkadaş sayısı ve avatarları görünür
6. Friends sekmeleri doğru içerik gösterir
7. Dashboard friends activity ile güncellenir
8. DM sistemi bozulmadan çalışır

## Bildirim Merkezi (Sprint 27)

Uygulama içi bildirim sistemi tercihler, filtreler ve temizleme ile güçlendirildi.

### User tercih alanları

- `notifyFriendRequests`, `notifyFriendAccepted`, `notifyDmMessages`
- `notifyRoomModeration`, `notifyRoomActivity`, `notifySystem`

Migration: `npx prisma migrate dev --name add_notification_preferences`

### Preferences endpointleri

```
GET /notifications/preferences
PATCH /notifications/preferences
Authorization: Bearer <token>
```

### Liste filtreleri

```
GET /notifications?unreadOnly=true&type=DM_MESSAGE&types=FRIEND_REQUEST,FRIEND_ACCEPTED&limit=20&cursor=<id>
```

### Silme endpointleri

| Method | Path | Açıklama |
|--------|------|----------|
| DELETE | `/notifications/:notificationId` | Tek bildirim sil |
| DELETE | `/notifications` | Tümünü sil; body `{ "onlyRead": true }` ile yalnızca okunanlar |

### Preference kontrolü

`createNotification` çağrılmadan önce `shouldCreateNotification(userId, type)` ile kullanıcı tercihi kontrol edilir.

### Frontend bileşenleri

- `NotificationFilters`, `NotificationGroup`, `NotificationPreferencesPanel`
- Bildirimler Bugün / Dün / Daha Eski gruplarında listelenir
- Settings toggle'ları `/notifications/preferences` kullanır

### Sprint 27 test adımları

1. Migration uygula
2. GET/PATCH preferences çalışır
3. Settings toggle backend'e kaydedilir
4. `notifyDmMessages: false` iken DM bildirimi oluşmaz
5. Filtreler (okunmamış, arkadaşlık, mesajlar) çalışır
6. Bildirim silme ve okunanları silme çalışır
7. Realtime unread count güncellenir

---

## Detaylı Modül Dokümantasyonu

Aşağıdaki bölümler sprint bazlı detaylı API test adımlarını içerir.

## UI/UX ve Onboarding (Sprint 17)

### Landing page
Premium scroll tabanlı vitrin: hero + auth modal, özellik kartları, sosyal odalar mockup, watch party, uygulama preview grid ve final CTA. Bileşenler: `frontend/src/components/landing/`.

### Onboarding (`/onboarding`)
Kayıt sonrası 3 adımlı akış:
1. Profil tamamlama (avatar, bio, ilgi alanları → `PATCH /users/me/profile`)
2. Ne yapmak istediğin (frontend seçim → ilgi alanlarına eklenir)
3. Discover veya Dashboard yönlendirmesi

### Global UI bileşenleri
- `EmptyState`, `LoadingState`, `ErrorState`
- `ToastProvider` + `useToast()` (success / error / info)

### Yönlendirme akışı
| Olay | Hedef |
|------|-------|
| Login başarılı | `/dashboard` |
| Register başarılı | `/onboarding` |
| Onboarding tamamlandı | `/dashboard` veya `/discover` |
| Logout | `/login` |
| Invite join başarılı | `/rooms/[roomId]` |
| DM başlat | `/messages/[conversationId]` |

### İlk kullanıcı deneyimi
1. Landing → Kayıt ol
2. Onboarding profil adımları
3. Dashboard yönlendirme kartları
4. Discover veya Rooms ile ilk oda deneyimi

## Admin Panel (Sprint 18)

MVP seviyesinde report yönetimi ve admin görünürlüğü. Global ban, oda kapatma, AI moderation ve gelişmiş analytics **bu sprintte yok**.

### Kullanıcı rolleri

| Rol | Açıklama |
|-----|----------|
| `USER` | Normal kullanıcı; admin paneline erişemez |
| `MODERATOR` | Rapor listesi ve detay görüntüleyebilir; durum güncelleyemez |
| `ADMIN` | Tüm admin endpointlerine erişir; rapor durumu güncelleyebilir |

### Demo hesaplar

| E-posta | Şifre | Rol |
|---------|-------|-----|
| `sudenaz@example.com` | `password123` | ADMIN |
| `yavuzhan@example.com` | `password123` | MODERATOR |
| Diğer demo hesaplar | `password123` | USER |

### Migration

```bash
cd backend
npx prisma migrate dev --name add_admin_role_and_report_management
npm run prisma:seed
```

### Admin API endpointleri

Tüm endpointler `Authorization: Bearer <token>` gerektirir.

| Method | Endpoint | Yetki | Açıklama |
|--------|----------|-------|----------|
| GET | `/admin/summary` | ADMIN, MODERATOR | Kullanıcı/oda/mesaj/açık rapor sayıları |
| GET | `/admin/reports` | ADMIN, MODERATOR | Rapor listesi (`status`, `targetType`, `limit` filtreleri) |
| GET | `/admin/reports/:reportId` | ADMIN, MODERATOR | Rapor detayı |
| PATCH | `/admin/reports/:reportId/status` | ADMIN | Rapor durumu güncelleme |

**PATCH body örneği:**

```json
{ "status": "RESOLVED" }
```

Geçerli durumlar: `OPEN`, `REVIEWED`, `RESOLVED`, `REJECTED`.

### Frontend sayfaları

| Sayfa | Açıklama |
|-------|----------|
| `/admin` | Özet kartları ve rapor listesine geçiş |
| `/admin/reports` | Filtrelenebilir rapor listesi |
| `/admin/reports/[reportId]` | Rapor detayı; ADMIN için durum güncelleme |

ADMIN veya MODERATOR kullanıcılar sidebar/topbar menüsünde **Admin** linkini görür.

### Report yönetim akışı

1. Kullanıcı `POST /reports` ile rapor oluşturur (mevcut moderasyon modülü).
2. Admin/Moderator `/admin/reports` üzerinden raporları listeler.
3. Detay sayfasında hedef kullanıcı/oda/mesaj bilgisine ve profile/oda linklerine ulaşır.
4. ADMIN durumu `PATCH /admin/reports/:reportId/status` ile günceller.

### Admin panel test adımları

1. Migration çalıştır: `npx prisma migrate dev --name add_admin_role_and_report_management`
2. Seed çalıştır: `npm run prisma:seed`
3. Backend: `npm run dev` (port 5000)
4. Frontend: `cd frontend && npm run dev` (port 3000)
5. `sudenaz@example.com` ile giriş → `/admin` açılmalı, özet kartları görünmeli
6. Normal kullanıcı (`kaan@example.com`) ile `/admin` → "Bu sayfaya erişim yetkin yok."
7. `GET /admin/summary` token ile 200 dönmeli
8. `GET /admin/reports` filtrelerle çalışmalı
9. Rapor detay sayfası açılmalı; profile/oda linkleri görünmeli
10. ADMIN rapor durumunu güncelleyebilmeli (toast: "Rapor durumu güncellendi.")
11. MODERATOR (`yavuzhan@example.com`) listeleme/detay görebilmeli; status update 403
12. Normal kullanıcı admin endpointlerine 403 almalı
13. API yanıtlarında `passwordHash` dönmemeli
14. Mevcut `POST /reports` akışı bozulmamalı

## Deployment (Sprint 19)

Proje production build ve deploy ortamları için hazırlanmıştır. Bu sprint yeni özellik eklemez; canlıya alma altyapısını düzenler.

### Environment dosyaları

| Dosya | Amaç |
|-------|------|
| `backend/.env.example` | Backend local/production env şablonu |
| `frontend/.env.local.example` | Frontend local/production env şablonu |

**Önemli:** `.env`, `.env.local`, `.env.production` dosyalarını git'e commit etmeyin. Gerçek `DATABASE_URL` veya `JWT_SECRET` kod içine yazılmamalıdır.

#### Backend environment variables

| Değişken | Local | Production |
|----------|-------|------------|
| `PORT` | `5000` | Render/Railway otomatik verebilir |
| `NODE_ENV` | `development` | `production` |
| `DATABASE_URL` | Neon connection string | Neon connection string |
| `JWT_SECRET` | Güçlü bir değer | Zorunlu — `openssl rand -base64 48` |
| `CLIENT_URL` | `http://localhost:3000` | `https://FRONTEND_DOMAIN` |
| `CORS_ORIGIN` | `http://localhost:3000` | `https://FRONTEND_DOMAIN` |
| `FRONTEND_URL` | `http://localhost:3000` | `https://FRONTEND_DOMAIN` |
| `LIVEKIT_*` | Voice için zorunlu | Voice için zorunlu |

#### Frontend environment variables (Vercel)

| Değişken | Local | Production |
|----------|-------|------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | `https://BACKEND_DOMAIN` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://FRONTEND_DOMAIN` |

Socket.IO bağlantısı ayrı env gerektirmez; `NEXT_PUBLIC_API_URL` kullanılır.

### Frontend Deployment — Vercel

1. Vercel'de yeni proje oluşturun.
2. **Root Directory:** `frontend`
3. **Framework Preset:** Next.js
4. **Build Command:** `npm run build` (varsayılan)
5. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL=https://your-api.onrender.com`
   - `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`
6. Deploy sonrası frontend domain'ini backend `CLIENT_URL` / `CORS_ORIGIN` değerlerine ekleyin.

Özel `vercel.json` gerekmez; Next.js varsayılan build yeterlidir.

### Backend Deployment — Render / Railway

1. **Root Directory:** `backend`
2. **Build Command:**
   ```bash
   npm install && npm run build && npx prisma generate
   ```
3. **Start Command:**
   ```bash
   npm run start
   ```
4. **Health Check Path:** `/health`
5. **Environment Variables:** yukarıdaki backend tablosu
6. **Production migration** (deploy sonrası bir kez veya release hook ile):
   ```bash
   npx prisma migrate deploy
   ```

Repoda `render.yaml` örnek yapılandırma içerir (Render Blueprint).

### Database — Neon PostgreSQL

1. [Neon](https://neon.tech) üzerinde proje oluşturun.
2. Connection string'i kopyalayın (`?sslmode=require` ile).
3. Backend deploy ortamına `DATABASE_URL` olarak ekleyin.
4. Migration deploy edin:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

**Prisma migration kuralları:**
- **Local geliştirme:** `npx prisma migrate dev`
- **Production:** `npx prisma migrate deploy` — `migrate dev` production'da kullanılmaz

### Demo seed — production uyarısı

`npm run prisma:seed` yalnızca **local demo** içindir. Production'da dikkatli kullanın:
- Demo admin (`sudenaz@example.com`) ve test kullanıcıları production'da kalıp kalmayacağına karar verin.
- Seed çalıştırmadan önce ortamın demo/test olduğundan emin olun.

### Production checklist

- [ ] `.env` dosyaları commitlenmedi mi?
- [ ] `DATABASE_URL` kod içinde yok mu?
- [ ] `JWT_SECRET` güçlü mü? (`change_this_secret` kullanılmıyor mu?)
- [ ] `CORS_ORIGIN` / `CLIENT_URL` frontend domain'i mi?
- [ ] `NEXT_PUBLIC_API_URL` backend domain'i mi?
- [ ] Backend `GET /health` çalışıyor mu?
- [ ] `npx prisma migrate deploy` production'da çalıştırıldı mı?
- [ ] Demo seed production'da bilinçli mi?

### Local production build testi

**Backend:**
```bash
cd backend
npm install
npx prisma generate
npm run build
npm run start
# GET http://localhost:5000/health
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
npm run start
# http://localhost:3000
```

## Prisma Komutları

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate          # local: migrate dev
npm run prisma:migrate:deploy   # production: migrate deploy
npm run prisma:seed             # local demo only
npx prisma studio
```

## Auth API Endpointleri

### POST /auth/register

```json
{
  "username": "Sudenaz",
  "handle": "sudenaz",
  "email": "test@example.com",
  "password": "123456"
}
```

Yanıt:

```json
{
  "message": "Hesabın oluşturuldu. Lütfen e-posta adresini doğrula.",
  "token": "jwt...",
  "user": {
    "id": "...",
    "emailVerified": false,
    "emailVerifiedAt": null
  }
}
```

### POST /auth/login

```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

Yanıt: `{ "token": "...", "user": { ..., "emailVerified": true|false } }`

### POST /auth/resend-verification

Header: `Authorization: Bearer <token>`

Doğrulama e-postasını tekrar gönderir. `emailVerified: true` ise hata döner.

### POST /auth/verify-email

```json
{ "token": "raw-token-from-email-link" }
```

Yanıt: `{ "message": "E-posta başarıyla doğrulandı." }`

Frontend akışı: e-posta linki `/verify-email?token=...` → sayfa POST atar.

### POST /auth/forgot-password

```json
{ "email": "test@example.com" }
```

Yanıt (kullanıcı var/yok fark etmez):

```json
{
  "message": "Eğer bu e-posta kayıtlıysa şifre sıfırlama bağlantısı gönderildi."
}
```

### POST /auth/reset-password

```json
{
  "token": "raw-token-from-email-link",
  "newPassword": "newPassword123"
}
```

Yanıt: `{ "message": "Şifren başarıyla güncellendi." }`

## E-posta Doğrulama ve Şifre Sıfırlama (Sprint 38)

### Resend kurulumu

1. [Resend](https://resend.com) hesabı oluşturun ve domain doğrulayın.
2. `backend/.env` içine `RESEND_API_KEY` ve `EMAIL_FROM` ekleyin.
3. `APP_URL` frontend domain ile eşleşmeli (linkler bu URL üzerinden üretilir).

### Development mode

`RESEND_API_KEY` yoksa e-posta gönderilmez. Development ortamında backend konsolunda yalnızca **doğrulama/sıfırlama URL'leri** loglanır (raw token değil, tam link). Production'da URL loglanmaz.

### Akış özeti

| Akış | Adımlar |
|------|---------|
| **Kayıt** | Register → `emailVerified: false` → verification email → login/dashboard kullanılabilir, banner uyarısı |
| **Doğrulama** | E-posta linki → `/verify-email?token=` → POST `/auth/verify-email` |
| **Şifre sıfırlama** | `/forgot-password` → email → `/reset-password?token=` → POST `/auth/reset-password` |

### Güvenlik

- Token'lar DB'de SHA-256 hash olarak saklanır (plain text yok).
- Verification token: 24 saat · Reset token: 1 saat · Tek kullanımlık.
- Forgot password endpoint'i kullanıcı varlığını sızdırmaz.

### Test adımları

1. Register → `emailVerified: false` kontrol et.
2. Development konsolunda verification URL gör.
3. `/verify-email?token=...` ile doğrula.
4. Aynı token tekrar → hata.
5. Dashboard banner + “Tekrar Gönder”.
6. Forgot password → aynı mesaj (var/yok).
7. Reset password → yeni şifreyle login.

### GET /users/me

Header: `Authorization: Bearer <token>`

Yanıt: `{ "user": { ..., "presenceStatus", "statusMessage", "lastSeenAt" } }`

### PATCH /users/me/presence

Header: `Authorization: Bearer <token>`

```json
{
  "presenceStatus": "STUDYING",
  "statusMessage": "Matematik çalışıyorum"
}
```

Kurallar:
- `presenceStatus` geçerli enum değeri olmalı
- `statusMessage` opsiyonel, maksimum 80 karakter
- `lastSeenAt` otomatik güncellenir

Yanıt: `{ "user": { ... } }`

### GET /users/:handle

Auth gerektirir (`Authorization: Bearer <token>`).

Handle lowercase aranır. Kullanıcı yoksa 404.

Yanıt örneği:

```json
{
  "profile": {
    "id": "...",
    "username": "Sudenaz",
    "handle": "sudenaz",
    "avatarUrl": null,
    "bannerUrl": null,
    "bio": null,
    "statusMessage": null,
    "presenceStatus": "ONLINE",
    "profileInterests": ["Oyun", "Anime"],
    "createdAt": "...",
    "lastSeenAt": null,
    "activity": {
      "memberSince": "...",
      "recentRooms": []
    }
  }
}
```

### PATCH /users/me/profile

Header: `Authorization: Bearer <token>`

```json
{
  "username": "Sudenaz",
  "avatarUrl": "https://...",
  "bannerUrl": "https://...",
  "bio": "Kısa bio",
  "statusMessage": "Bugün film modundayım",
  "profileInterests": ["Oyun", "Anime", "Yazılım"]
}
```

Kurallar:
- Sadece kendi profilin düzenlenebilir
- `username` max 40 karakter
- `bio` max 240 karakter
- `statusMessage` max 80 karakter
- `profileInterests` max 12 adet, her biri max 24 karakter
- `avatarUrl` / `bannerUrl` opsiyonel URL (http/https)

Yanıt: `{ "user": { ... } }`

> `passwordHash` hiçbir yanıtta dönmez.

## Health Kontrolü

```bash
curl http://localhost:5000/health
```

Örnek yanıt:

```json
{
  "status": "ok",
  "environment": "development",
  "message": "Sosyal Oda Platformu API is running"
}
```

Hassas env bilgisi dönmez.

## Auth Test Adımları

1. Backend'i başlatın: `cd backend && npm run dev`
2. Migration çalıştırın: `npx prisma migrate dev --name init_auth`
3. Kayıt testi:

```bash
curl -X POST http://localhost:5000/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"Sudenaz\",\"handle\":\"sudenaz\",\"email\":\"test@example.com\",\"password\":\"123456\"}"
```

4. Giriş testi:

```bash
curl -X POST http://localhost:5000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"123456\"}"
```

5. `/users/me` testi (TOKEN değerini değiştirin):

```bash
curl http://localhost:5000/users/me -H "Authorization: Bearer TOKEN"
```

6. Frontend: [http://localhost:3000/register](http://localhost:3000/register) ile kayıt olun
7. Başarılı giriş/kayıt sonrası `/dashboard` sayfasına yönlendirilmelisiniz

## Dashboard & Presence Test Adımları

1. Giriş yapın ve `/dashboard` sayfasına gidin
2. Presence pill'lerinden bir durum seçin (ör. Studying)
3. Durum mesajı yazıp Kaydet'e basın
4. PATCH endpoint testi (TOKEN değiştirin):

```bash
curl -X PATCH http://localhost:5000/users/me/presence ^
  -H "Authorization: Bearer TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"presenceStatus\":\"STUDYING\",\"statusMessage\":\"Matematik çalışıyorum\"}"
```

5. Sayfayı yenileyin — son seçilen presence ve mesaj korunmalı
6. Topbar'da kullanıcı adı, handle ve presence görünmeli

## Room API Endpointleri

### GET /rooms

Header: `Authorization: Bearer <token>`

Query (opsiyonel): `category`, `search`, `type`

Aktif odaları listeler (PUBLIC odalar varsayılan filtre).

### POST /rooms

Header: `Authorization: Bearer <token>`

```json
{
  "name": "Gece Sohbet Odası",
  "description": "Rahat sohbet ve takılma odası",
  "category": "CHAT",
  "type": "PUBLIC",
  "maxUserCount": 20,
  "password": ""
}
```

### GET /rooms/:id

Header: `Authorization: Bearer <token>`

Oda detayı, owner, aktif üyeler. `isMember` bilgisi döner.

### POST /rooms/:id/join

Header: `Authorization: Bearer <token>`

```json
{ "password": "123456" }
```

Şifreli odalar için `password` zorunlu.

### POST /rooms/:id/leave

Header: `Authorization: Bearer <token>`

Owner odadan ayrılamaz.

## Room Modelleri

**Room:** name, slug, category, type, ownerId, currentUserCount, maxUserCount, inviteCode, passwordHash (response'da dönmez)

**RoomMember:** roomId, userId, role (OWNER/MODERATOR/MEMBER), joinedAt, leftAt

**Enumlar:** RoomType, RoomCategory, RoomMemberRole

## Room Test Adımları

1. Login ol, TOKEN al
2. Oda oluştur:

```bash
curl -X POST http://localhost:5000/rooms ^
  -H "Authorization: Bearer TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Gece Sohbet Odası\",\"description\":\"Rahat sohbet\",\"category\":\"CHAT\",\"type\":\"PUBLIC\",\"maxUserCount\":20}"
```

3. Odaları listele: `curl http://localhost:5000/rooms`
4. Oda detay: `curl http://localhost:5000/rooms/ROOM_ID`
5. Katıl: `curl -X POST http://localhost:5000/rooms/ROOM_ID/join -H "Authorization: Bearer TOKEN"`
6. Frontend `/rooms` → oda oluştur → detay sayfasında katıl/ayrıl

## Chat API & Socket.IO

### GET /rooms/:roomId/messages

Header: `Authorization: Bearer <token>`

Query: `limit` (opsiyonel, default 50)

Kullanıcı aktif oda üyesi olmalı. Silinmemiş mesajları `createdAt ASC` döner.

### Socket bağlantısı

```javascript
io(API_URL, { auth: { token: "JWT_TOKEN" } })
```

### Client → Server

| Event | Payload |
|-------|---------|
| `room:join` | `{ roomId }` |
| `room:leave` | `{ roomId }` |
| `message:send` | `{ roomId, content, replyToMessageId? }` |
| `typing:start` | `{ roomId }` |
| `typing:stop` | `{ roomId }` |

### Server → Client

| Event | Açıklama |
|-------|----------|
| `message:new` | Yeni mesaj |
| `user:joined` | Kullanıcı socket odasına katıldı |
| `user:left` | Kullanıcı socket odasından ayrıldı |
| `typing:update` | `{ roomId, user, isTyping }` |

### Message modeli

- `id`, `roomId`, `senderId`, `content` (max 1000)
- `replyToMessageId` (nullable, UI sonraki sprint)
- `deletedAt` (nullable, soft delete altyapısı)

## Chat Test Adımları

1. Migration: `npx prisma migrate dev --name add_chat_messages`
2. Backend + frontend çalıştır
3. Login ol, oda oluştur ve odaya katıl
4. `/rooms/[roomId]` sayfasında mesaj gönder
5. Aynı odayı iki farklı tarayıcı/sekmede aç → realtime mesaj gelmeli
6. Yazarken typing indicator görünmeli
7. Sayfadan çıkınca socket temizlenmeli
8. Token olmadan socket bağlantısı reddedilmeli

## Voice Altyapısı (Sprint 24 — LiveKit)

Oda içi gerçek sesli sohbet: backend LiveKit JWT token üretir, frontend `livekit-client` ile odaya bağlanır.

### Kurulum

1. [LiveKit Cloud](https://cloud.livekit.io) veya self-hosted LiveKit sunucusu oluşturun.
2. `backend/.env` dosyasına ekleyin:

| Değişken | Açıklama |
|----------|----------|
| `LIVEKIT_URL` | WebSocket URL (ör. `wss://your-project.livekit.cloud`) |
| `LIVEKIT_API_KEY` | API key |
| `LIVEKIT_API_SECRET` | API secret — **asla frontend'e veya response'a koymayın** |

3. Paketler:
   - Backend: `livekit-server-sdk`
   - Frontend: `livekit-client`, `@livekit/components-react`, `@livekit/components-styles`

Env eksikse `POST /voice/token` → **503** (`Voice bağlantısı hazırlanamadı. LiveKit yapılandırması eksik.`)

### POST /voice/token

Header: `Authorization: Bearer <token>`

Body:

```json
{ "roomId": "..." }
```

Kurallar:
- Kullanıcı login olmalı
- Oda var olmalı
- Kullanıcı aktif oda üyesi olmalı (değilse **403**: `Voice chat'e katılmak için önce odaya katılmalısın.`)
- Banlı kullanıcı token alamaz
- Oda moderasyon mute (`isMuted`) token'ı engellemez; mikrofon frontend'de kapalı başlayabilir

Yanıt:

```json
{
  "provider": "livekit",
  "roomId": "...",
  "roomName": "...",
  "identity": "user-id",
  "displayName": "username",
  "token": "<jwt>",
  "livekitUrl": "wss://..."
}
```

Backend dosyaları:
- `backend/src/lib/livekit.ts` — token üretimi, env doğrulama
- `backend/src/modules/voice/` — routes, controller, service, schemas

### Frontend Voice Panel

Bileşenler (`frontend/src/components/voice/`):
- `VoicePanel` — katıl/ayrıl orchestration
- `LiveKitVoiceRoom` — LiveKit bağlantısı
- `VoiceControls` — mikrofon, deafen, ayrıl
- `VoiceParticipantList` / `VoiceParticipantCard` — katılımcılar
- `SpeakingIndicator` — aktif konuşan glow
- `VoiceConnectionStatus` — bağlantı durumu

Oda detay **Voice** sekmesi `VoicePanel` kullanır. Üye değilse uyarı gösterilir.

### Bilinen voice eksikleri

- Screen share yok
- Recording yok
- Gelişmiş noise suppression yok
- Spatial voice yok
- Video call yok

### Voice Test Adımları

1. Backend + frontend çalıştır; LiveKit env değişkenlerini doldur
2. Login ol, oda oluştur ve odaya katıl
3. `/rooms/[roomId]` → **Voice** sekmesi → **Voice'a Katıl**
4. Tarayıcı mikrofon izni ver; “Sesli odaya katıldın.” mesajı görünmeli
5. İki farklı tarayıcı/kullanıcı ile aynı odaya katıl → birbirini duyabilmeli
6. Mikrofon aç/kapat, deafen, active speaker indicator test et
7. Voice'dan ayrılınca bağlantı kapanmalı
8. Oda üyesi olmayan kullanıcı token alamamalı (**403**)
9. `LIVEKIT_*` olmadan token isteği anlaşılır hata vermeli (**503**)
10. Chat ve watch party bozulmadan çalışmalı

## Voice Altyapısı (Sprint 6 — tasarım)

Sprint 6'da UI ve token endpoint iskeleti hazırlandı. Sprint 24 ile gerçek LiveKit entegrasyonu tamamlandı.

<details>
<summary>Eski Sprint 6 mock yanıt (referans)</summary>

Mock yanıt artık kullanılmıyor; gerçek JWT döner.
</details>

## Hibrit Watch Party Sistemi

Watch Party artık **hibrit izleme** mantığıyla çalışır:

- **YouTube, Twitch, Kick** → uygulama içinde embed/player ile oynatılır (`EMBED` modu)
- **Netflix, Disney+, Prime Video** → **Harici Senkron İzleme Modu** (`EXTERNAL_SYNC`)

Harici modda her kullanıcı içeriği **kendi abonelik hesabında** açar. Sosyal Oda hazır olma, geri sayım, ortak timer, chat ve voice desteği sağlar.

**Önemli:** Netflix, Disney+ ve Prime Video uygulama içinde iframe/player olarak oynatılmaz. DRM bypass, ekran kaydı, proxy playback veya kullanıcı şifresi toplama yapılmaz.

### Desteklenen Providerlar

| Provider | Mod | Açıklama |
|----------|-----|----------|
| YouTube | EMBED | Video linki, oda içi player |
| Twitch | EMBED | Canlı yayın embed (parent domain gerekir) |
| Kick | EMBED | Canlı yayın embed |
| Netflix | EXTERNAL_SYNC | Harici senkron + timer |
| Disney+ | EXTERNAL_SYNC | Harici senkron + timer |
| Prime Video | EXTERNAL_SYNC | Harici senkron + timer |

### Twitch embed parent domain

Twitch iframe embed `parent` parametresi gerektirir. Frontend `window.location.hostname` kullanır; production'da opsiyonel `NEXT_PUBLIC_APP_DOMAIN` tanımlanabilir (`frontend/.env.local.example`).

### API endpointleri (ek/güncel)

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/rooms/:roomId/watch` | Media state + ready users + host |
| POST | `/rooms/:roomId/watch/set-media` | Hibrit medya başlatma |
| POST | `/rooms/:roomId/watch/set-video` | YouTube geriye uyumlu |
| POST | `/rooms/:roomId/watch/ready` | Harici mod hazır olma |
| POST | `/rooms/:roomId/watch/countdown` | Host geri sayım (3/5/10 sn) |
| POST | `/rooms/:roomId/watch/control` | Play/pause/seek veya timer |

### Socket eventleri (ek)

**Client → Server:** `watch:set-media`, `watch:ready`, `watch:countdown-start`, `watch:timer-sync`

**Server → Client:** `watch:ready-updated`, `watch:countdown-started`

### Migration

```bash
cd backend
npx prisma migrate dev --name add_hybrid_watch_party
```

### Hibrit Watch Party test adımları

1. YouTube linki gir → EMBED player görünmeli
2. Twitch linki gir → Twitch player görünmeli
3. Kick linki gir → Kick player görünmeli
4. Netflix seç → External Sync ekranı açılmalı (iframe yok)
5. Disney+ seç → External Sync ekranı açılmalı
6. Prime Video seç → External Sync ekranı açılmalı
7. Harici modda içerik adı zorunlu olmalı
8. **Hazırım** butonu ready listesini güncellemeli
9. Host geri sayım başlatabilmeli; countdown tüm kullanıcılara gitmeli
10. Timer host tarafından başlat/durdurulabilmeli
11. Host olmayan kullanıcı countdown başlatamamalı
12. Media değiştirilince ready list sıfırlanmalı
13. Chat ve voice watch sırasında çalışmaya devam etmeli
14. API yanıtlarında `passwordHash` dönmemeli

---

## Watch Party (Sprint 7)

Oda içinde YouTube videosunu birlikte izleme altyapısı. Backend state + Socket.IO senkronizasyonu çalışır.

> **Not:** YouTube IFrame Player API ile tam play/pause/seek senkronizasyonu sonraki sprintte yapılacak. Bu sprintte embed + backend state + socket eventleri kullanılır.

### RoomMediaState modeli

- `roomId` (unique), `provider` (YOUTUBE), `videoId`, `videoUrl`
- `title` (nullable), `isPlaying`, `currentTime`, `hostUserId`

### REST Endpointleri

Tümü `Authorization: Bearer <token>` ve aktif oda üyeliği gerektirir.

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/rooms/:roomId/watch` | Mevcut media state (yoksa `null`) |
| POST | `/rooms/:roomId/watch/set-video` | `{ videoUrl }` — video başlat/güncelle |
| POST | `/rooms/:roomId/watch/control` | `{ action, currentTime }` — PLAY/PAUSE/SEEK (host only) |
| POST | `/rooms/:roomId/watch/take-host` | Host devral |

### Socket Eventleri

**Client → Server:** `watch:join`, `watch:set-video`, `watch:play`, `watch:pause`, `watch:seek`

**Server → Client:** `watch:state-updated`, `watch:sync`, `watch:error`

### Migration

```bash
cd backend
npx prisma migrate dev --name add_watch_party
```

### Watch Party Test Adımları

1. Migration uygula, backend + frontend çalıştır
2. Login ol, oda oluştur ve odaya katıl
3. `/rooms/[roomId]` → Watch Party panelinde YouTube URL gir
4. İkinci sekmede aynı odayı aç → video state görünmeli
5. Host play/pause/seek yap → diğer sekmede `watch:sync` gelmeli
6. Host olmayan kullanıcı kontrol yapamamalı (403 / disabled UI)
7. **Host'u Devral** çalışmalı
8. Chat ve voice panel bozulmadan çalışmalı

## Watch Party Queue (Sprint 25)

YouTube Watch Party deneyimi video kuyruğu, gelişmiş panel düzeni ve host kuralları ile güçlendirildi.

### RoomVideoQueueItem modeli

- `roomId`, `addedById`, `videoId`, `videoUrl`, `title?`, `position`, `status`
- `VideoQueueStatus`: `QUEUED`, `PLAYING`, `PLAYED`, `REMOVED`

### Migration

```bash
cd backend
npx prisma migrate dev --name add_watch_queue
```

### Yeni REST endpointleri

Tümü aktif oda üyeliği gerektirir (`Authorization: Bearer <token>`).

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/rooms/:roomId/watch/queue` | Sıradaki videolar (QUEUED + PLAYING) |
| POST | `/rooms/:roomId/watch/queue` | `{ videoUrl }` — kuyruğa ekle |
| DELETE | `/rooms/:roomId/watch/queue/:itemId` | Kaldır (status REMOVED) |
| POST | `/rooms/:roomId/watch/queue/:itemId/play` | Host/owner/mod videoyu oynat |

Mevcut Sprint 7 endpointleri korunur: `GET /watch`, `set-video`, `control`, `take-host`.

### YouTube URL parse

Desteklenen formatlar: `youtube.com/watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`, ek query parametreleri.

Geçersiz URL → `400`: "Geçerli bir YouTube bağlantısı gir."

### Socket eventleri

**Yeni:** `watch:queue-updated` → `{ roomId, queue }`

Mevcut eventler korunur: `watch:state-updated`, `watch:sync`, `watch:play`, `watch:pause`, `watch:seek`, `watch:set-video`, `watch:error`

### Host kuralları

- Host odadan ayrılırsa owner veya ilk aktif üye host olur
- Owner her zaman host devralabilir
- Kontroller yalnızca host’ta (owner/mod queue’dan oynatabilir)

### Frontend bileşenleri

```
frontend/src/components/watch/
├── WatchPartyPanel.tsx   # Player + sidebar layout
├── WatchQueue.tsx
├── WatchQueueItem.tsx
├── AddToQueueForm.tsx
└── WatchViewerList.tsx
```

### YouTube IFrame API TODO

Tam play/pause/seek senkronizasyonu için `enablejsapi=1` + IFrame Player API entegrasyonu sonraki sprintte yapılacak. Şu an embed + backend state + socket sync kullanılır.

### Watch Party Queue test adımları

1. Migration uygula (`add_watch_queue`)
2. Oda detay → **Watch** sekmesi açılır
3. YouTube linki kuyruğa eklenir → toast: "Video sıraya eklendi."
4. Host queue’dan **Oynat** → video player’da görünür
5. Host olmayan kullanıcı kontrol yapamaz
6. Geçersiz URL hata verir
7. İki sekmede queue ve watch state güncellenir (`watch:queue-updated`)
8. Chat ve voice sistemleri bozulmaz

## Profil Sistemi (Sprint 8)

### User profil alanları

- `avatarUrl`, `bannerUrl`, `bio`, `statusMessage`
- `presenceStatus`, `profileInterests` (String[], max 12)
- Public profilde e-posta dönmez

### Migration

```bash
cd backend
npx prisma migrate dev --name add_profile_fields
```

### Profil Test Adımları

1. Migration uygula, backend + frontend çalıştır
2. Register/login ol
3. `/profile/[handle]` sayfasını aç → profil bilgileri gelmeli
4. Olmayan handle → hata mesajı
5. Kendi profilinde **Profili Düzenle** görünmeli
6. Başka kullanıcı profilinde düzenleme butonu olmamalı
7. Profil kaydet → sayfa yenilenince güncel veri gelmeli
8. Topbar avatar/handle güncellenmeli

## Discover / Keşfet (Sprint 9)

Giriş yapmış kullanıcılar için oda keşfi, filtreleme ve sıralama.

### GET /discover/rooms

Auth gerektirir (`Authorization: Bearer <token>`).

Oda keşfi, filtreleme ve sıralama.

Query parametreleri:

| Param | Açıklama |
|-------|----------|
| `search` | Oda adı / açıklama araması |
| `category` | `GAME`, `FILM`, `CHAT`, ... |
| `sort` | `trending` (default), `newest`, `active`, `recommended` |
| `limit` | Default 20, max 50 |

Örnek:

```
GET /discover/rooms?category=CHAT&search=gece&sort=trending&limit=20
```

Kurallar:
- Sadece `isActive: true` ve `PUBLIC` odalar
- `passwordHash` ve private odalar dönmez

Yanıt:

```json
{
  "rooms": [{ "id": "...", "name": "...", "owner": { ... } }],
  "meta": { "total": 12, "sort": "trending", "category": "CHAT", "search": "gece" }
}
```

**Sıralama MVP:**
- `trending` / `active`: `currentUserCount` + `updatedAt`
- `newest`: `createdAt`
- `recommended`: aktif odalar + (login ise) `profileInterests` eşleşmesi

### Discover Test Adımları

1. Backend + frontend çalıştır
2. `GET /discover/rooms` (Bearer token ile) → odalar gelmeli; token yoksa 401
3. `?search=...`, `?category=CHAT`, `?sort=trending`, `?limit=5` test et
4. `/discover` sayfasında arama, kategori, sıralama çalışmalı
5. **Odaya Gir** → `/rooms/[roomId]` yönlendirmeli
6. Boş filtre sonucu → empty state + filtreleri temizle

> **Dashboard TODO:** Trend odalar alanı ileride `GET /discover/rooms?sort=trending&limit=5` ile beslenecek.

## Moderation (Sprint 10)

Temel oda moderasyonu: kick, mute, ban, mesaj silme, raporlama.

### Migration

```bash
cd backend
npx prisma migrate dev --name add_basic_moderation
```

### Yetki kuralları

| Rol | Kick/Mute | Ban | Mesaj silme |
|-----|-----------|-----|-------------|
| OWNER | MODERATOR + MEMBER | Evet | MEMBER + MODERATOR mesajları |
| MODERATOR | Sadece MEMBER | Hayır | Sadece MEMBER mesajları |
| MEMBER | Hayır | Hayır | Sadece kendi mesajı |

- OWNER mute/kick/ban edilemez
- Kullanıcı kendine moderasyon uygulayamaz
- Muted kullanıcı mesaj gönderemez (`Bu odada susturuldun.`)
- Banlı kullanıcı join olamaz

### Endpointler

| Method | Path | Açıklama |
|--------|------|----------|
| POST | `/rooms/:roomId/members/:userId/kick` | Odadan at |
| POST | `/rooms/:roomId/members/:userId/mute` | Sustur |
| POST | `/rooms/:roomId/members/:userId/unmute` | Susturmayı kaldır |
| POST | `/rooms/:roomId/members/:userId/ban` | Ban (OWNER) |
| POST | `/rooms/:roomId/members/:userId/unban` | Ban kaldır (OWNER) |
| DELETE | `/rooms/:roomId/messages/:messageId` | Mesaj soft delete |
| POST | `/reports` | Kullanıcı/mesaj/oda raporu |

### Socket eventleri

- `message:deleted`
- `moderation:user-kicked`
- `moderation:user-muted`
- `moderation:user-banned`

### Moderation Test Adımları

1. Migration uygula, backend + frontend çalıştır
2. Owner oda oluştur, ikinci kullanıcı katılsın
3. Owner mute → muted kullanıcı mesaj gönderememeli
4. Owner unmute → mesaj tekrar gönderilebilmeli
5. Owner kick → üye listeden düşmeli
6. Owner ban → banlı kullanıcı join olamamalı
7. Mesaj sahibi kendi mesajını silebilmeli
8. Moderator/Member yetki sınırları doğru olmalı
9. POST `/reports` ile rapor gönderilebilmeli

## Invite & Oda Erişimi (Sprint 11)

Oda davet bağlantısı ve erişim kuralları MVP.

### Migration

```bash
cd backend
npx prisma migrate dev --name add_invite_access
```

### Room model alanları

| Alan | Açıklama |
|------|----------|
| `inviteCode` | Benzersiz davet kodu (oda oluşturulurken otomatik) |
| `inviteEnabled` | Davet linki açık/kapalı (varsayılan: `true`) |
| `inviteCreatedAt` | Davet kodu oluşturulma zamanı |
| `inviteUpdatedAt` | Son davet güncelleme zamanı |

### Oda erişim kuralları (RoomType)

| Tip | Keşif / listeleme | Katılım |
|-----|-------------------|---------|
| `PUBLIC` | Görünür | Login yeterli |
| `PASSWORD_PROTECTED` | Görünmez* | Doğru şifre gerekli |
| `INVITE_ONLY` | Görünmez | Geçerli `inviteCode` + `inviteEnabled: true` |
| `PRIVATE` | Görünmez | Sadece mevcut üye (davet ile otomatik join yok) |

\* `/discover/rooms` ve `/rooms` varsayılan olarak yalnızca `PUBLIC` aktif odaları listeler.

### Invite endpointleri

| Method | Path | Auth | Açıklama |
|--------|------|------|----------|
| GET | `/invites/:inviteCode` | Bearer | Oda davet önizlemesi |
| POST | `/rooms/:roomId/invite/regenerate` | Bearer | Yeni davet kodu (OWNER/MODERATOR) |
| PATCH | `/rooms/:roomId/invite/settings` | Bearer | `{ "inviteEnabled": true/false }` (OWNER) |
| POST | `/rooms/:id/join` | Bearer | `{ "password?", "inviteCode?" }` |

**GET /invites/:inviteCode** yanıtı:

```json
{
  "room": { "id", "name", "description", "category", "type", "currentUserCount", "maxUserCount" },
  "owner": { "id", "username", "handle", "avatarUrl" },
  "requiresPassword": false,
  "canPreview": true,
  "inviteEnabled": true
}
```

- `passwordHash` asla dönmez
- `inviteEnabled: false` veya geçersiz kod → `404`
- Private oda davet linki ile bulunabilir; join kuralları ayrı uygulanır

### Frontend

| Route | Açıklama |
|-------|----------|
| `/invite/[inviteCode]` | Davet önizleme + katılma akışı |
| Oda detay | Owner/moderator için davet linki kutusu |

**Environment (`frontend/.env.local`):**

| Değişken | Açıklama |
|----------|----------|
| `NEXT_PUBLIC_APP_URL` | Davet linki tabanı (varsayılan: `http://localhost:3000`) |

Davet link formatı: `{NEXT_PUBLIC_APP_URL}/invite/{inviteCode}`

### Invite Test Adımları

1. Backend + frontend çalıştır
2. Public ve INVITE_ONLY oda oluştur
3. Oda detayda davet linki görünsün (owner/moderator)
4. Linki kopyala → `/invite/[code]` önizleme açılsın
5. Login olmadan join yapılamasın
6. Login ile INVITE_ONLY odaya davet kodu ile katıl
7. Yanlış invite code → hata
8. Owner daveti kapat → link geçersiz olsun
9. Regenerate sonrası eski link çalışmasın
10. PASSWORD_PROTECTED oda hâlâ şifre istesin
11. PRIVATE oda public listelerde görünmesin
12. Discover, chat, voice, watch party bozulmasın

## Arkadaş Sistemi & DM Altyapısı (Sprint 12)

Arkadaşlık isteği, arkadaş listesi ve direct message için veritabanı/backend temeli.

### Migration

```bash
cd backend
npx prisma migrate dev --name add_friend_system_and_dm_foundation
```

### Modeller

**FriendRequest**
- `senderId`, `receiverId`, `status` (`PENDING` | `ACCEPTED` | `REJECTED` | `CANCELLED`)
- Aynı anda tek yönde `PENDING` istek (servis katmanında kontrol)
- Kendine istek gönderilemez

**Friendship**
- `userAId`, `userBId` — küçük id `userA`, büyük id `userB` (sıralı)
- `@@unique([userAId, userBId])`

**DM foundation (chat sonraki sprint)**
- `Conversation` (`DIRECT`)
- `ConversationParticipant`
- `DirectMessage` — endpoint/UI bu sprintte tam değil

Arkadaş kabul edilince direct conversation otomatik oluşturulur.

### Friend endpointleri

| Method | Path | Açıklama |
|--------|------|----------|
| POST | `/friends/requests` | `{ "receiverHandle": "duygu" }` |
| GET | `/friends/requests/incoming` | Gelen PENDING istekler |
| GET | `/friends/requests/outgoing` | Gönderilen PENDING istekler |
| POST | `/friends/requests/:requestId/accept` | Kabul (receiver) |
| POST | `/friends/requests/:requestId/reject` | Reddet (receiver) |
| POST | `/friends/requests/:requestId/cancel` | İptal (sender) |
| GET | `/friends` | Arkadaş listesi + presence |
| DELETE | `/friends/:userId` | Arkadaşlıktan çıkar |

**Özel kurallar:**
- Karşı taraftan gelen PENDING istek varken yeni istek → otomatik kabul
- Zaten arkadaşsa yeni istek engellenir
- `passwordHash` response’larda dönmez

### DM endpoint (minimal — Sprint 12)

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/dm/conversations` | Kullanıcının DIRECT sohbet listesi |

> Sprint 12 yalnızca altyapı kurdu; tam mesajlaşma Sprint 13’te eklendi.

### Frontend

| Route | Açıklama |
|-------|----------|
| `/friends` | Arkadaş listesi, istekler, handle ile ekleme |
| `/messages` | Conversation listesi (Sprint 13+) |
| Profil | Başka kullanıcıda “Arkadaş Ekle” butonu |
| Dashboard | `GET /dashboard` — devam et, öneriler, arkadaş konumları, bildirimler |
| Sidebar | Friends + Messages linkleri |
| Topbar | Gelen istek sayısı badge |

### Friend Test Adımları

1. Migration uygula, backend + frontend çalıştır
2. İki kullanıcı register/login
3. Handle ile friend request gönder
4. Gelen/giden istekler listelensin
5. Kabul → friendship + conversation oluşsun
6. Arkadaş listesi presence ile gelsin
7. Reddet / iptal çalışsın
8. Kendine istek → hata
9. Zaten arkadaş → tekrar istek hata
10. Profil butonu ve dashboard online friends çalışsın

## Birebir DM Mesajlaşma (Sprint 13)

Arkadaşlar arası text DM — REST + Socket.IO.

### Modeller

Sprint 12 modelleri kullanılır (`Conversation`, `ConversationParticipant`, `DirectMessage`). Ek migration gerekmez.

### DM endpointleri

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/dm/conversations` | Sohbet listesi (`otherUser`, `lastMessage`) |
| POST | `/dm/conversations/direct` | `{ "userId" }` veya `{ "handle" }` — arkadaş şart |
| GET | `/dm/conversations/:id/messages` | Mesaj geçmişi (`limit`, default 50) |
| POST | `/dm/conversations/:id/messages` | `{ "content" }` — max 1000 karakter |
| DELETE | `/dm/conversations/:id/messages/:messageId` | Soft delete (yalnızca gönderen) |

**Kurallar:**
- DM başlatmak için arkadaşlık zorunlu → `403: DM başlatmak için önce arkadaş olmalısınız.`
- Yalnızca conversation participant mesaj okuyup gönderebilir
- `passwordHash` dönmez

### Socket eventleri

**Client → Server:** `dm:join`, `dm:leave`, `dm:message:send`, `dm:typing:start`, `dm:typing:stop`

**Server → Client:** `dm:message:new`, `dm:message:deleted`, `dm:typing:update`, `dm:error`

Socket room: `dm:{conversationId}`

### Frontend

| Route | Açıklama |
|-------|----------|
| `/messages` | Conversation listesi |
| `/messages/[conversationId]` | DM chat paneli |
| `/friends`, profil | “Mesaj Gönder” → direct conversation |

### DM Test Adımları

1. Backend + frontend çalıştır
2. İki kullanıcı arkadaş olsun
3. “Mesaj Gönder” ile conversation aç
4. `/messages` listesinde görünsün
5. Mesaj gönder → DB’ye kaydedilsin
6. İki tarayıcıda realtime mesaj gelsin
7. Typing indicator çalışsın
8. Kendi mesajını sil (soft delete)
9. Arkadaş olmayan kullanıcıya DM → 403
10. Participant olmayan conversation → 403
11. Room chat hâlâ çalışsın

## Bildirim Sistemi (Sprint 14)

Uygulama içi notification center — database + Socket.IO.

### Migration

```bash
cd backend
npx prisma migrate dev --name add_notifications
```

### Notification modeli

| Alan | Açıklama |
|------|----------|
| `type` | `FRIEND_REQUEST`, `FRIEND_ACCEPTED`, `DM_MESSAGE`, `ROOM_INVITE`, `ROOM_MODERATION`, `SYSTEM` |
| `title` | Bildirim başlığı |
| `body` | Opsiyonel açıklama |
| `link` | Frontend route (örn. `/friends`, `/messages/{id}`) |
| `isRead` / `readAt` | Okundu durumu |
| `metadata` | Opsiyonel JSON (hassas veri yok) |

### Endpointler

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/notifications` | Liste (`limit`, `unreadOnly`) + `unreadCount` |
| GET | `/notifications/unread-count` | Okunmamış sayısı |
| PATCH | `/notifications/:id/read` | Tek bildirimi okundu yap |
| PATCH | `/notifications/read-all` | Tümünü okundu yap |

### Otomatik bildirim üretimi

| Olay | Tip | Link |
|------|-----|------|
| Arkadaş isteği | `FRIEND_REQUEST` | `/friends` |
| İstek kabul | `FRIEND_ACCEPTED` | `/friends` |
| DM mesajı | `DM_MESSAGE` | `/messages/{conversationId}` |
| Kick / mute / ban | `ROOM_MODERATION` | `/rooms/{roomId}` veya `/dashboard` |

### Socket eventleri

- Kullanıcı bağlanınca `user:{userId}` odasına katılır
- `notification:new` — yeni bildirim
- `notification:unread-count-updated` — `{ unreadCount }`

### Frontend

| Route / Bileşen | Açıklama |
|-----------------|----------|
| Topbar `NotificationBell` | Badge + dropdown |
| `/notifications` | Bildirim merkezi |

### Notification Test Adımları

1. Migration uygula, backend + frontend çalıştır
2. Arkadaş isteği → alıcıda bildirim
3. Kabul → gönderende bildirim
4. DM mesajı → karşı tarafta bildirim
5. Mute/kick/ban → hedef kullanıcıda bildirim
6. Okundu / tümünü okundu yap
7. Topbar badge güncellensin
8. Realtime socket ile yeni bildirim gelsin
9. Başka kullanıcının bildirimleri görünmesin

## Hesap Ayarları ve Güvenlik (Sprint 15)

### Frontend: `/settings`

Token olmadan erişilemez; oturum yoksa `/login` sayfasına yönlendirilir.

Bölümler:
- **Hesap** — username, handle, email, üyelik tarihi
- **Profil** — `PATCH /users/me/profile` ile profil düzenleme
- **Bildirimler** — arkadaşlık, DM ve moderasyon tercihleri
- **Güvenlik** — şifre değiştirme formu
- **Tehlikeli Bölge** — hesap silme placeholder (sonraki sürüm)

Topbar kullanıcı menüsü: Profilim, Ayarlar, Çıkış Yap.

### PATCH /users/me/password

Header: `Authorization: Bearer <token>`

```json
{
  "currentPassword": "123456",
  "newPassword": "newPassword123"
}
```

Kurallar:
- `currentPassword` ve `newPassword` zorunlu
- `newPassword` minimum 6 karakter
- Mevcut şifre bcrypt ile doğrulanır; hatalıysa 403: `"Mevcut şifre hatalı."`
- `passwordHash` yanıtta asla dönmez

Yanıt:

```json
{
  "message": "Şifre başarıyla güncellendi."
}
```

### PATCH /users/me/preferences

Header: `Authorization: Bearer <token>`

```json
{
  "notifyFriendRequests": true,
  "notifyDmMessages": true,
  "notifyRoomModeration": true
}
```

Yanıt:

```json
{
  "preferences": {
    "notifyFriendRequests": true,
    "notifyDmMessages": true,
    "notifyRoomModeration": true
  }
}
```

### GET /users/me (güncellenmiş)

Güvenli alanlar: `id`, `username`, `handle`, `email`, `avatarUrl`, `bannerUrl`, `bio`, `statusMessage`, `presenceStatus`, `profileInterests`, `notifyFriendRequests`, `notifyDmMessages`, `notifyRoomModeration`, `createdAt`, `lastSeenAt`. `passwordHash` asla dönmez.

### Logout mantığı

Backend token blacklist kullanmaz. Frontend:
1. `localStorage` token ve kullanıcı bilgisini temizler
2. Socket.IO bağlantısını kapatır
3. `/login` sayfasına yönlendirir

### Sprint 15 test adımları

1. Backend: `cd backend && npm run dev`
2. Frontend: `cd frontend && npm run dev`
3. Login ol
4. `/settings` token yokken `/login`'e yönlendirmeli
5. Hesap bilgileri görünmeli
6. Profil settings üzerinden güncellenebilmeli
7. Şifre değiştirme çalışmalı; yanlış mevcut şifre hata vermeli
8. Yeni şifreyle tekrar login olunabilmeli
9. Logout token temizlemeli; dashboard/settings erişimi engellenmeli
10. Topbar menüsü (Profilim / Ayarlar / Çıkış) çalışmalı
11. Bildirim toggle'ları kaydedilmeli
12. API yanıtlarında `passwordHash` olmamalı

## MVP Stabilizasyon (Sprint 16)

### Yapılanlar

- `backend/prisma/seed.ts` — demo kullanıcılar, odalar, mesajlar, arkadaşlıklar, bildirimler, DM
- `npm run prisma:seed` komutu eklendi
- Hata yanıtları `{ message, code? }` formatına yaklaştırıldı
- `useRequireAuth` hook — friends, messages, notifications, DM için login guard
- Sidebar'a Notifications linki eklendi
- API client hata mesajları iyileştirildi (401/403/500)
- README MVP test rehberi olarak güncellendi

### Route doğrulama

Tüm modüller `app.ts` içinde kayıtlı. Watch party `/rooms/:roomId/watch` altında; moderasyon `/reports` ve `/rooms/:roomId/members` altında.

## Final MVP Teslim (Sprint 20)

### Yapılanlar

- Tüm backend route grupları doğrulandı (`/health`, `/auth`, `/users`, `/rooms`, `/discover`, `/voice`, `/invites`, `/friends`, `/dm`, `/notifications`, `/admin`, `/reports`)
- Frontend 18 sayfa route smoke test (build)
- README final düzen (Proje Özeti → Güvenlik Notları)
- `FINAL_TEST_CHECKLIST.md` — teslim test listesi
- `DEMO_SCRIPT.md` — sunum demo akışı
- `screenshots/README.md` — ekran görüntüsü hazırlık notu
- Bilinen eksikler / TODO listesi güncellendi
- Socket debug logları production'da kapalı

### Teslim dosyaları

| Dosya | Amaç |
|-------|------|
| `README.md` | Ana proje dokümantasyonu |
| `FINAL_TEST_CHECKLIST.md` | Manuel test checklist |
| `DEMO_SCRIPT.md` | Sunum demo senaryosu |
| `screenshots/` | Ekran görüntüleri (opsiyonel) |

## Sprint Durumu

- [x] Sprint 0: Proje iskeleti
- [x] Sprint 1: Frontend sayfa iskeleti
- [x] Sprint 2: JWT auth (register, login, /users/me)
- [x] Sprint 3: Presence sistemi ve dashboard deneyimi
- [x] Sprint 4: Oda CRUD, katılma/ayrılma, frontend entegrasyonu
- [x] Sprint 5: Realtime text chat (Socket.IO + message history)
- [x] Sprint 6: Voice chat UI + LiveKit token endpoint taslağı
- [x] Sprint 24: Gerçek LiveKit voice entegrasyonu (MVP)
- [x] Sprint 30: Security & abuse protection (rate limit, helmet, sanitize)
- [x] Sprint 7: YouTube watch party (state + socket sync MVP)
- [x] Sprint 8: Profil görüntüleme ve düzenleme MVP
- [x] Sprint 9: Discover / keşfet sistemi (backend + frontend MVP)
- [x] Sprint 10: Temel oda moderasyonu (kick/mute/ban/report)
- [x] Sprint 11: Oda davet bağlantısı ve erişim sistemi MVP
- [x] Sprint 12: Arkadaş sistemi + DM altyapısı MVP
- [x] Sprint 13: Birebir DM mesajlaşma MVP
- [x] Sprint 14: Uygulama içi bildirim sistemi MVP
- [x] Sprint 15: Hesap ayarları, şifre değiştirme ve güvenli logout MVP
- [x] Sprint 16: MVP stabilizasyonu, seed data ve demo rehberi
- [x] Sprint 17: UI/UX polish, onboarding ve toast feedback sistemi
- [x] Sprint 18: MVP admin panel, report yönetimi ve rol tabanlı erişim
- [x] Sprint 19: Deployment hazırlığı (build, env, CORS, deploy rehberi)
- [x] Sprint 20: Final MVP test, demo senaryosu ve teslim dokümantasyonu

**Sonraki geliştirmeler:** LiveKit entegrasyonu, e-posta doğrulama, premium, mobil/PWA
