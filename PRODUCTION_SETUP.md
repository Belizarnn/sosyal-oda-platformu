# Production Kurulum — LiveKit, Resend, Demo Seed

Canlı site: https://sosyal-oda-platformu.vercel.app  
API: https://sosyal-oda-platformu.onrender.com

Bu rehber **Render dashboard** üzerinden yapılır. Secret değerleri GitHub'a commit etmeyin.

---

## Hızlı kontrol

Kurulumdan sonra tarayıcıda veya terminalde:

```powershell
.\check-production.ps1
```

Veya manuel:

| URL | Beklenen |
|-----|----------|
| `/health` | `{ "status": "ok" }` |
| `/health/db` | `{ "database": "connected" }` |
| `/health/integrations` | `livekit.configured`, `email.configured` |

---

## 1. Render — ortak env (zaten var olmalı)

[Render Dashboard](https://dashboard.render.com) → **sosyal-oda-api** → **Environment**

| Değişken | Değer |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Neon connection string |
| `JWT_SECRET` | 32+ karakter |
| `CLIENT_URL` | `https://sosyal-oda-platformu.vercel.app` |
| `CORS_ORIGIN` | `https://sosyal-oda-platformu.vercel.app` |
| `FRONTEND_URL` | `https://sosyal-oda-platformu.vercel.app` |
| `APP_URL` | `https://sosyal-oda-platformu.vercel.app` |

Kaydettikten sonra Render otomatik yeniden deploy eder.

---

## 2. LiveKit (sesli sohbet)

### Adımlar

1. https://cloud.livekit.io → ücretsiz hesap
2. **New project** → proje adı (ör. `sosyal-oda`)
3. **Settings → Keys** → API Key + Secret oluştur
4. **Project URL** → `wss://...livekit.cloud` formatında

### Render env ekle

| Değişken | Örnek |
|----------|-------|
| `LIVEKIT_URL` | `wss://sosyal-oda-xxxxx.livekit.cloud` |
| `LIVEKIT_API_KEY` | `APIxxxxx` |
| `LIVEKIT_API_SECRET` | `secret...` |

### Test

1. Canlı sitede giriş yap
2. Bir odaya gir → **Voice** sekmesi
3. **Katıl** → mikrofon izni ver
4. `/health/integrations` → `"livekit": { "configured": true }`

---

## 3. Resend (e-posta doğrulama)

### Seçenek A — Hızlı test (domain yok)

1. https://resend.com → hesap
2. **API Keys** → Create API Key
3. Render env:

| Değişken | Değer |
|----------|-------|
| `RESEND_API_KEY` | `re_...` |
| `EMAIL_FROM` | `onboarding@resend.dev` |
| `APP_URL` | `https://sosyal-oda-platformu.vercel.app` |

> `onboarding@resend.dev` yalnızca Resend hesabınızdaki **doğrulanmış e-posta adresine** mail gönderir. Demo için yeterli.

### Seçenek B — Gerçek domain (önerilen)

1. Resend → **Domains** → domain ekle (DNS kayıtları)
2. `EMAIL_FROM` = `Sosyal Oda <noreply@sizindomain.com>`

### Test

1. Yeni hesap kaydı veya dashboard'da **Tekrar Gönder**
2. `/health/integrations` → `"email": { "configured": true }`
3. Gelen kutusu + spam klasörünü kontrol edin

---

## 4. Demo seed (production hesaplar)

Demo hesap yoksa, **Neon veritabanına** bir kez seed atın:

```powershell
.\seed-production.ps1
```

Oluşan hesaplar (şifre hepsi `password123`):

| E-posta | Rol |
|---------|-----|
| `sudenaz@example.com` | Admin |
| `yavuzhan@example.com` | Moderator |
| `duygu@example.com` | User |
| `kaan@example.com` | User |

Beta kodu: `BETA-TEST-2026`

> `backend/.env` içindeki `DATABASE_URL` Neon production olmalı. Tekrar çalıştırmak güvenli (upsert).

---

## 5. GitHub push → otomatik deploy

Kod değişince:

```powershell
git add .
git commit -m "açıklama"
git push
```

| Servis | Ne olur |
|--------|---------|
| Vercel | Frontend build + deploy (~1–3 dk) |
| Render | Backend build + deploy (~3–5 dk) |

Env değişikliği (LiveKit, Resend) **Render'da kaydetmek yeterli** — ayrı push gerekmez.

---

## Sorun giderme

| Sorun | Çözüm |
|-------|--------|
| Voice 503 | LiveKit env eksik — Render'ı kontrol edin |
| E-posta gelmiyor | `RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL`; test modunda yalnızca kendi mailinize gider |
| Sayfa yüklenmiyor | Render uykuda — 30–60 sn bekleyin |
| Login olmuyor | Demo seed çalıştırın veya yeni kayıt |

Detaylı deploy: [`DEPLOYMENT.md`](DEPLOYMENT.md)
