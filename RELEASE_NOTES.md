# Release Notes — v1.0.0-beta

**Sürüm:** v1.0.0-beta  
**Tarih:** 2026  
**Durum:** Kontrollü beta / ilk production release adayı

> Bu sürüm production'a alınabilir altyapıya sahiptir; bazı modüller test mode veya placeholder içerik kullanır. Hukuki metinler (privacy, terms) **placeholder**dır — resmi yayın öncesi profesyonel gözden geçirme gerekir.

---

## Ana özellikler

### Kimlik ve hesap

- Kayıt, giriş, JWT oturum
- E-posta doğrulama ve şifre sıfırlama (Resend)
- Profil, presence, ayarlar

### Odalar ve realtime

- Oda oluşturma, katılma, davet linki, şifreli oda
- Socket.IO oda chat
- YouTube watch party (sync altyapısı)
- LiveKit voice panel (provider yapılandırması gerekir)

### Sosyal

- Arkadaşlık sistemi ve DM
- Bildirimler (in-app)
- Discover / dashboard

### Moderasyon ve admin

- Kick, mute, ban, report
- Admin rapor paneli, analytics özeti, feedback yönetimi
- Beta davet kodu yönetimi (admin)

### Premium

- Stripe checkout ve abonelik webhook altyapısı (**test mode** varsayılan)

### Beta ve uyumluluk

- Beta access code ile kontrollü kayıt
- Politika sayfaları (placeholder): community guidelines, privacy, terms, beta
- Dahili analytics event tracking (dış GA/Mixpanel yok)
- Feedback toplama sistemi
- PWA manifest ve mobil UX iyileştirmeleri

---

## Bilinen eksikler

- Voice: LiveKit provider ayarı zorunlu; screen share / recording yok
- Stripe: **test mode** kullanılır; live geçiş ayrı yapılandırma gerektirir
- Offline PWA cache sınırlı; service worker tam offline destek yok
- Gelişmiş AI moderation yok
- Native mobil uygulama yok (PWA only)
- Push notification yok (yalnızca uygulama içi)
- Hesap silme akışı yok
- Captcha production entegrasyonu placeholder
- Beta / politika metinleri hukuki danışmanlık yerine geçmez

---

## Güvenlik notları

- `passwordHash` API yanıtlarında dönmez (`sanitizeUser`)
- `DATABASE_URL`, `JWT_SECRET`, Stripe/Resend key'leri yalnızca backend env'de
- Admin endpointleri role korumalı (ADMIN / MODERATOR)
- Helmet, rate limit, CORS allowlist aktif
- Socket.IO JWT auth zorunlu
- Stripe webhook signature doğrulaması (`constructEvent`)
- Analytics ve feedback'te hassas veri minimizasyonu uygulanır

---

## Sonraki geliştirmeler (post-beta)

- Production Stripe live mode
- Sentry / merkezi loglama
- Captcha (Turnstile / hCaptcha)
- Gelişmiş moderation ve abuse detection
- Offline PWA / push notifications
- Native mobile app
- Profesyonel hukuki metinler
- Trend analytics ve gelişmiş admin raporlama

---

## Dokümantasyon

| Dosya | Açıklama |
|-------|----------|
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | Deploy rehberi |
| [`PRODUCTION_CHECKLIST.md`](PRODUCTION_CHECKLIST.md) | Canlıya alma checklist |
| [`SMOKE_TEST.md`](SMOKE_TEST.md) | Smoke test senaryosu |
| [`README.md`](README.md) | Genel proje dokümantasyonu |
