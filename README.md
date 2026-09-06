# Dompi — Mini Wallet API & Dashboard

Dompi is a full-stack digital wallet application: users can top up their balance through **Midtrans Snap**, transfer money to other users by email or phone number, and track every transaction in a single ledger. It ships with a Spring Boot REST API, a React dashboard, and an admin panel for monitoring user activity.

```
Frontend (React + Vite)  ──JWT──►  Backend (Spring Boot)  ──►  PostgreSQL / MySQL / H2
                                          │
                                          ▼
                                    Midtrans Snap API
                                    (top-up + webhook)
```

## Features

**Auth & security**
- Register / Login with JWT (stateless, role-based: `USER` / `ADMIN`)
- Password hashing with BCrypt
- Every wallet/transaction endpoint resolves the caller from the JWT — no user can reach another user's data by manipulating an ID

**Wallet**
- Check balance, top up via Midtrans Snap (VA, e-wallet, QRIS), withdraw
- Transfer to another user by **email or phone number** (no wallet ID needed)
- Transaction history with status (`PENDING` / `SUCCESS` / `FAILED`)
- Strict nominal validation — rejects blank, non-numeric, symbol, negative, or decimal input with a specific message for each case
- Transfers run inside a single `@Transactional` boundary — a failure crediting the recipient rolls back the sender's deduction

**Admin panel**
- User management: list, create, edit (password optional on edit), activate/deactivate
- System-wide transaction monitoring across every user, with search
- Role-gated navigation and routes (client-side UX + server-side `@PreAuthorize`)

**Payment reliability**
- Midtrans webhook (`/api/topup/notification`) re-verifies status directly against Midtrans rather than trusting the webhook body
- Idempotency guard against duplicate webhook deliveries
- Manual/automatic **sync fallback** (`/api/topup/{orderId}/sync`) that re-checks a stuck `PENDING` order on demand — used by the frontend's background polling and a "Check status" button, so the balance still updates even if the webhook never arrives

## Tech Stack

| Layer | Stack |
|---|---|
| Backend | Java 17, Spring Boot 3.3.5, Spring Security (JWT), Spring Data JPA, Bean Validation |
| Database | H2 (default, in-memory dev) — PostgreSQL / MySQL drivers included for production |
| Payments | Midtrans Snap + Core API (`com.midtrans:java-library`) |
| Frontend | React 18 (Vite), React Router, Axios, Tailwind CSS |
| Docs | springdoc-openapi (Swagger UI) |

## Project Structure

```
backend/
  src/main/java/com/vois/simpleewalletsystem/
    config/                # MidtransConfig, DataSeeder
    controller/            # REST controllers
    dto/                   # request/response DTOs
    entity/                # User, Wallet, Transaction (JPA)
    enums/                 # Role, TransactionType, TransactionStatus
    exception/             # Custom exceptions + GlobalExceptionHandler
    mapper/                # Entity <-> DTO mapping
    repository/            # Spring Data JPA repositories
    security/              # JWT filter/service, SecurityConfig, AuthController
    service/               # Business logic (+ impl/)
    validation/            # Custom @ValidNominal Bean Validation constraint
  src/main/resources/
    application.properties

frontend/
  src/
    api/           # Axios service layer, one file per resource
    components/    # Navbar, BalanceCard, TopUpModal, TransactionTable, etc.
    context/       # AuthContext, ToastContext
    hooks/         # useMidtransSnap
    pages/         # Login, Dashboard, Profile, Transactions, Admin*
    utils/         # formatCurrency, etc.
```

## Getting Started

### Prerequisites
- Java 17+ and Maven
- Node.js 18+
- A [Midtrans](https://dashboard.midtrans.com) sandbox account (free) for the server key, client key, and Snap testing

### Backend

```bash
cd backend
# edit src/main/resources/application.properties first — see Environment Variables below
mvn spring-boot:run
```

The API starts on **http://localhost:8080**. On first run, `DataSeeder` automatically creates 50 demo users and 1 admin (see [Default Seeded Accounts](#default-seeded-accounts)).

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # fill in VITE_MIDTRANS_CLIENT_KEY
npm run dev
```

The dashboard starts on **http://localhost:5175**. This port is fixed in `vite.config.js` to match the backend's CORS `allowedOrigins` — if you change it, update `SecurityConfig.corsConfigurationSource()` too.

## Environment Variables

**Backend** (`application.properties`)

```properties
# Database (H2 by default — swap these 4 lines for Postgres/MySQL)
spring.datasource.url=jdbc:h2:mem:ewalletdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JWT
jwt.secret=<a long random string>
jwt.expiration=86400000

# Nominal validation ceiling (whole number, IDR)
app.transaction.max-amount=100000000

# Midtrans (sandbox keys from your dashboard)
midtrans.server-key=SB-Mid-server-xxxxxxxx
midtrans.client-key=SB-Mid-client-xxxxxxxx
midtrans.is-production=false
```

**Frontend** (`.env`)

```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxx
VITE_MIDTRANS_IS_PRODUCTION=false
```

> The `server-key` only ever lives in the backend. Only `client-key` is safe to expose to the frontend.

## Default Seeded Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@gmail.com` | `Admin123` |
| User | `user1@gmail.com` … `user50@gmail.com` | `User123` |

## API Reference

All endpoints are prefixed with `/api`. Protected endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Log in, returns a JWT |
| GET | `/wallet` | Owner | Current user's wallet |
| GET | `/wallet/balance` | Owner | Current user's balance |
| POST | `/wallet/withdraw` | Owner | Withdraw from own wallet |
| GET | `/wallet/{walletId}` | Owner/Admin | Wallet by ID |
| POST | `/topup` | Owner | Create a Midtrans Snap transaction |
| POST | `/topup/notification` | Public (Midtrans only) | Webhook — confirms settlement |
| POST | `/topup/{orderId}/sync` | Owner/Admin | Manually re-check a pending order against Midtrans |
| POST | `/transfer` | Owner | Transfer to another user by email/phone |
| GET | `/transactions` | Owner | Current user's transaction history |
| GET | `/transactions/all` | Admin | System-wide transaction log |
| GET | `/transactions/{id}` | Sender/Recipient/Admin | Transaction detail |
| GET | `/wallet/{walletId}/transactions` | Owner/Admin | Transaction history for a specific wallet |
| POST | `/users` | Authenticated | Create a user |
| GET | `/users` | Admin | List all users |
| GET / PUT | `/users/{id}` | Owner/Admin | View / update a user (password optional on update) |
| PATCH | `/users/{id}/deactivate` \| `/activate` | Admin | Toggle a user's active status |

Interactive docs: **http://localhost:8080/swagger-ui.html** once the backend is running.

## Midtrans Webhook Setup

1. In the Midtrans dashboard, go to **Settings → Payment → Payment Notification URL** (**not** "Recurring Notification URL" — that's for the separate Subscription API and won't fire for Snap top-ups).
2. For local development, expose your backend with a tunnel (e.g. `ngrok http 8080`) and set the notification URL to:
   ```
   https://<your-tunnel-domain>/api/topup/notification
   ```
3. Every time your tunnel URL changes (free ngrok URLs are ephemeral), update the dashboard again.
4. If a topup ever gets stuck as `PENDING` despite showing `settlement` in Midtrans, open its detail in the dashboard and use **Check Status** (or `POST /api/topup/{orderId}/sync`) to resolve it without waiting on the webhook.

## Known Limitations & Roadmap

- **Token storage**: JWT is kept in `sessionStorage` with an Axios interceptor, not an httpOnly cookie — the backend would need to set `Set-Cookie` on login to support that.
- **Webhook dependency on tunneling**: local dev reliability depends on the tunnel staying up and the dashboard URL staying current; the polling/sync fallback exists specifically to cover this gap.
- **Planned**: WebSocket-based real-time balance updates instead of polling; production Midtrans credentials; audit logging for admin actions.

## License

Add your license of choice here (e.g. MIT).
