# Smoke Test — v1.0.0-beta

Production veya staging ortamında uçtan uca doğrulama senaryosu. Her adımda beklenen sonucu not edin.

**Ön koşullar:**

- Backend `GET /health` → `status: ok`
- Frontend ve backend env doğru
- Beta açıksa geçerli beta kodu hazır (ör. seed: `BETA-TEST-2026`)

---

## 1. Landing

| # | Adım | Beklenen |
|---|------|----------|
| 1 | `/` aç | Landing yüklenir, footer linkleri görünür |
| 2 | Beta banner (beta mode açıksa) | Bilgilendirme metni görünür |
| 3 | `/privacy`, `/terms`, `/community-guidelines` | Placeholder politika sayfaları açılır |

---

## 2. Kayıt ve doğrulama

| # | Adım | Beklenen |
|---|------|----------|
| 4 | `/register` → form doldur | Beta gerekiyorsa kod alanı görünür |
| 5 | Geçersiz beta kodu (varsa) | Hata mesajı |
| 6 | Geçerli kayıt | Başarılı, onboarding veya dashboard yönlendirme |
| 7 | E-posta doğrulama (Resend aktifse) | Link tıklanır, verify başarılı |

---

## 3. Giriş ve dashboard

| # | Adım | Beklenen |
|---|------|----------|
| 8 | Logout → `/login` | Giriş formu |
| 9 | Login | Dashboard veya onboarding |
| 10 | `/dashboard` | Dashboard kartları yüklenir |

---

## 4. Oda ve chat

| # | Adım | Beklenen |
|---|------|----------|
| 11 | Oda oluştur (`/rooms`) | Oda oluşur |
| 12 | Odaya gir (`/rooms/[roomId]`) | Oda detay açılır |
| 13 | Chat mesajı gönder | Mesaj listede görünür (realtime) |

---

## 5. Watch party

| # | Adım | Beklenen |
|---|------|----------|
| 14 | Watch sekmesi → YouTube linki ekle | Video state güncellenir |

---

## 6. Voice

| # | Adım | Beklenen |
|---|------|----------|
| 15 | Voice panel → odaya katıl | LiveKit token alınır, bağlantı kurulur |

> LiveKit env yoksa: adım atlanır veya beklenen hata not edilir.

---

## 7. Sosyal

| # | Adım | Beklenen |
|---|------|----------|
| 16 | `/friends` → arkadaş isteği | İstek gönderilir |
| 17 | `/messages` → DM | Konuşma açılır, mesaj gönderilir |
| 18 | `/notifications` | Bildirim listesi; okundu işaretleme |

---

## 8. Premium ve admin

| # | Adım | Beklenen |
|---|------|----------|
| 19 | `/premium` | Premium sayfası açılır |
| 20 | Stripe test checkout (yapılandırıldıysa) | Checkout session başlar |
| 21 | `/admin` (ADMIN/MODERATOR) | Admin panel açılır |
| 22 | `/admin/reports` | Rapor listesi |
| 23 | Feedback modal (sağ alt veya settings) | Form gönderilir |

---

## 9. Çıkış

| # | Adım | Beklenen |
|---|------|----------|
| 24 | Logout | Oturum kapanır, korumalı sayfalar login'e yönlendirir |

---

## Route kontrol listesi

Aşağıdaki route'lar 404 vermeden açılmalı:

- `/`, `/login`, `/register`, `/dashboard`, `/rooms`, `/rooms/[roomId]`
- `/friends`, `/messages`, `/notifications`, `/settings`, `/premium`
- `/admin`, `/privacy`, `/terms`, `/community-guidelines`, `/beta`
- Feedback: floating buton / modal (ayrı route yok)

---

## Hata durumunda

1. Browser console ve network tab
2. Backend platform logs (request log: method, path, status — body loglanmaz)
3. Stripe webhook delivery (ödeme testinde)
4. [`DEPLOYMENT.md`](DEPLOYMENT.md) rollback bölümü

Test sonucu: ☐ Geçti ☐ Kısmen ☐ Başarısız

Notlar:

```
(tarih, ortam, tester, bulgular)
```
