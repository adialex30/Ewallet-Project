# Dompi - E-Wallet Frontend (React + Vite + Tailwind)

SPA React yang terhubung ke backend Spring Boot "Mini Wallet API" (JWT auth + Midtrans Snap).

## Setup

```bash
npm install
cp .env.example .env
# lalu isi VITE_MIDTRANS_CLIENT_KEY dengan CLIENT key sandbox Midtrans kamu
npm run dev
```

App jalan di **http://localhost:5175** (port ini fixed di `vite.config.js` supaya cocok
dengan `SecurityConfig.corsConfigurationSource()` di backend, yang cuma allow origin itu).
Kalau kamu ubah port, ubah juga `allowedOrigins` di SecurityConfig backend.

Login pakai akun hasil `DataSeeder` backend, contoh: `user1@gmail.com` / `User123`.

## Struktur folder

```
src/
├── api/                  # Axios service layer, satu file per resource
│   ├── axiosInstance.js  # instance + interceptor JWT + normalisasi error
│   ├── authApi.js
│   ├── walletApi.js
│   ├── topupApi.js
│   ├── transferApi.js
│   └── transactionApi.js
├── context/
│   ├── AuthContext.jsx   # token/email + login/register/logout
│   └── ToastContext.jsx  # notifikasi sukses/error, tanpa dependency tambahan
├── hooks/
│   └── useMidtransSnap.js  # load snap.js dinamis + wrapper window.snap.pay
├── components/
│   ├── Navbar.jsx
│   ├── BalanceCard.jsx
│   ├── TopUpModal.jsx
│   ├── TransferForm.jsx
│   ├── TransactionTable.jsx
│   ├── ProtectedRoute.jsx
│   └── Spinner.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx   # bonus, melengkapi Login
│   └── DashboardPage.jsx
├── utils/
│   └── formatCurrency.js
├── App.jsx                # routing
└── main.jsx                # entry point, provider composition
```

## Keputusan desain penting

**Penyimpanan token JWT**: backend saat ini mengembalikan token di body JSON
(`POST /api/auth/login -> { token }`), BUKAN lewat `Set-Cookie`. HttpOnly cookie
sungguhan cuma bisa di-set oleh server, jadi opsi itu butuh perubahan di
`AuthController`/`AuthService` (backend) untuk set cookie saat login. Karena
backend belum melakukan itu, frontend ini pakai jalur kedua yang diizinkan
requirement: **Axios interceptor + `sessionStorage`** (`src/api/axiosInstance.js`).
`sessionStorage` dipilih dibanding `localStorage` karena otomatis kehapus saat
tab ditutup — sedikit lebih baik dari sisi hygiene, meski keduanya sama-sama
bisa diakses JS (risiko XSS tetap ada; kalau butuh proteksi XSS penuh, langkah
berikutnya adalah migrasi ke httpOnly cookie di backend).

**Cegah double-submit**: setiap form submit dijaga dua lapis — `disabled` di
button (state React) DAN `useRef` lock yang diperiksa di awal handler
(`submitLock.current`), supaya double-click yang sangat cepat tetap tidak lolos
walau re-render React belum sempat men-disable tombolnya.

**Validasi nominal**: input nominal cuma menerima digit (`digitsOnly()` di
`utils/formatCurrency.js`) - jadi user secara fisik tidak bisa mengetik simbol/
desimal/huruf, selaras dengan aturan backend (`NominalValidator`, whole positive
integer). Pesan error field-level dari backend (`err.errors.amount`) tetap
ditampilkan sebagai fallback definitif kalau ada validasi lain yang lolos di
frontend.

**Top up async**: `POST /api/topup` cuma membuat transaksi PENDING dan
snapToken - saldo baru benar-benar bertambah setelah backend menerima webhook
`POST /api/topup/notification` dari Midtrans (lihat `TopupServiceImpl` di
backend). Karena itu `DashboardPage` me-refresh saldo langsung setelah popup
Snap sukses/pending, DAN sekali lagi 4 detik kemudian untuk menangkap update
dari webhook yang datang belakangan.
