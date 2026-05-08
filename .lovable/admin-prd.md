# BazePay Admin Web App — Product Requirements Document (PRD)

**Version:** 1.0  
**Companion to:** BazePay Mobile Prototype (`.lovable/plan.md`)  
**Audience:** Internal operations, compliance, finance, support, growth, and engineering teams.  
**Form factor:** Desktop-first responsive web app (min 1280px optimized, works down to 1024px).

---

## 1. Purpose & Scope

The BazePay mobile app gives end-users (Nigerians at home, in diaspora, and short-stay visitors) a wallet, bill payments, virtual cards, virtual phone numbers, and eSIM. The **Admin Web App** is the back-office control plane that operates everything the mobile app exposes: users, KYC, money movement, cards, eSIMs, virtual numbers, billers, pricing, support, growth, compliance, and platform settings.

**In scope:** every feature visible in the current mobile app — Home, Wallet, Pay (Airtime, Data, Electricity, TV, Betting, Internet, eSIM top-up), Cards, eSIMs, Virtual Numbers, Profile (KYC, Security/PIN/2FA, Referrals, Help & Live Chat, Legal), Transactions/Receipts, Top-up, Transfer, PIN setup, Onboarding, Auth (signup, login).

**Out of scope (v1):** mobile-app-only UI changes, native push infra, on-device biometrics tuning.

---

## 2. Personas & Roles (RBAC)

Roles are **stored in a dedicated `admin_roles` table** (never on the user/profile row). All permissions are checked server-side via a `has_role()` security-definer function.

| Role | Primary responsibility |
|---|---|
| **Super Admin** | Full access; manages other admins, role assignments, environment toggles. |
| **Compliance Officer** | KYC review, sanctions/PEP screening, AML alerts, SARs, freezes. |
| **Finance Ops** | Ledger, reconciliation, settlement, refunds, payout approvals, FX rates. |
| **Card Ops** | Virtual card issuance, freeze/cancel, BIN config, card-program limits. |
| **Telco Ops** | eSIM inventory, virtual number pool, biller catalogue, plan pricing. |
| **Support Agent** | Read-mostly user lookup, transaction lookup, live chat, ticket triage. |
| **Support Lead** | Support + refund initiation, escalations, macro management. |
| **Growth / Marketing** | Referrals program, promo codes, push/email campaigns, content. |
| **Read-only Auditor** | View everything, change nothing. Exports allowed with watermark. |

Every action is **audit-logged** (actor, role, IP, timestamp, before/after diff, reason).

---

## 3. Information Architecture

```
/login                          Admin login (email + password + TOTP 2FA, mandatory)
/dashboard                      Ops overview, KPIs, alerts
/users                          User directory
  /users/:id                    User 360 profile
  /users/:id/kyc                KYC dossier & decisioning
  /users/:id/wallets            Per-currency wallets, manual adjustments
  /users/:id/transactions       Full transaction history
  /users/:id/cards              Virtual cards held by user
  /users/:id/esims              eSIMs purchased
  /users/:id/numbers            Virtual numbers held
  /users/:id/devices            Sessions, devices, PIN/2FA state
  /users/:id/notes              Internal CRM notes & tags
/kyc                            KYC queue (pending / escalated / rejected)
  /kyc/:caseId                  Case review (selfie, doc, liveness, sanctions)
/transactions                   Global transaction explorer
  /transactions/:id             Receipt + ledger entries + provider trace
/wallets                        Float accounts per currency, balances, sweeps
  /wallets/fx                   FX rates, spreads, daily marks
  /wallets/payouts              Bank payout queue & approvals
  /wallets/topups               Inbound funding reconciliation
/cards                          Card program dashboard
  /cards/programs               BIN ranges, limits, fees, KYT rules
  /cards/issued                 All issued cards (filterable)
  /cards/:id                    Card detail (no full PAN unless reveal-approved)
/esim                           eSIM catalogue & inventory
  /esim/plans                   Plan CRUD (country, GB, validity, price)
  /esim/inventory               QR/ICCID stock, supplier feeds
  /esim/orders                  Orders, activations, failures
/numbers                        Virtual numbers
  /numbers/pool                 Number inventory by country
  /numbers/leases               Active leases & renewals
/pay                            Bill payments operations
  /pay/billers                  Biller catalogue (Airtime, Data, Electricity, TV, Betting, Internet)
  /pay/plans                    Data/TV/Internet plans CRUD
  /pay/orders                   Live orders, retries, refunds
/payments                       Payment provider configs (Flutterwave, Paystack, Interswitch)
/referrals                      Referral program rules, codes, payouts
/promotions                     Promo codes, fee waivers, A/B
/support                        Tickets + Live chat console
  /support/chat                 Real-time chat queue
  /support/tickets/:id          Ticket detail
  /support/macros               Canned responses
/compliance                     AML alerts, sanctions screening, SAR queue
  /compliance/rules             Rule engine (velocity, amount, geography)
  /compliance/freezes           Frozen accounts & holds
  /compliance/reports           Regulatory exports (CBN, NFIU)
/content                        In-app content (onboarding slides, legal docs, help articles)
/notifications                  Push, email, SMS templates & broadcasts
/settings
  /settings/admins              Admin users + roles
  /settings/audit-log           Immutable audit trail
  /settings/feature-flags       Toggles per environment
  /settings/api-keys            Service credentials (masked, rotated)
  /settings/branding            Theme tokens, logos
```

Top nav: Dashboard · Users · KYC · Transactions · Wallets · Cards · eSIM · Numbers · Pay · Support · Compliance · Growth · Settings.  
Global: ⌘K command palette, environment switcher (sandbox/staging/prod), notification bell, admin avatar.

---

## 4. Detailed Feature Specs

### 4.1 Dashboard

KPI tiles (today / 7d / 30d, with sparklines):
- Active users, new signups, KYC conversion rate
- Total processed volume (NGN equivalent), gross fees, net revenue
- Wallet float per currency, FX exposure
- Top-up success rate by provider, transfer success rate, bill-pay success rate by service
- Cards issued, active cards, blocked categories triggered
- eSIMs activated, virtual numbers leased
- Open compliance alerts, KYC backlog, support SLA
- Live chat queue depth & average wait

Alerts panel: provider outages, reconciliation breaks, freeze events, PIN lockouts, fraud spikes.

### 4.2 Users

**Directory:** searchable by name, phone, email, BVN/NIN last-4, user-id, device-id. Filters: KYC tier, status (active/frozen/closed), country, signup date, lifetime volume.

**User 360 (`/users/:id`):**
- Header: avatar, name, phone (masked toggle), email, KYC tier badge, account status, risk score, lifetime value.
- Tabs: Overview, KYC, Wallets, Transactions, Cards, eSIMs, Numbers, Devices, Notes.
- Actions (role-gated, all reasoned + audit-logged):
  - Reset PIN (forces re-setup on next login — mirrors `/auth/pin-setup`)
  - Reset 2FA
  - Force logout all sessions
  - Freeze / unfreeze account (blocks all txn endpoints)
  - Close account (soft-delete + retain ledger)
  - Edit profile fields **only after KYC unlock workflow** (mirrors mobile rule that post-KYC profile is read-only)
  - Re-trigger KYC
  - Send message (push / email / SMS)

### 4.3 KYC

Mirrors the mobile KYC flow (`/kyc` selfie + doc + tier).

- Queue with SLA timers; columns: case-id, user, doc type (Passport/NIN/BVN), submitted-at, age, assignee, risk flags.
- Case detail: selfie image, liveness score, document images (front/back), extracted OCR fields, sanctions/PEP hits, device fingerprint, IP geo, prior cases.
- Decision panel: **Approve → Tier 1 / Tier 2 / Tier 3**, **Request more info** (templated reasons), **Reject** (reason taxonomy), **Escalate**.
- Four-eyes principle for Tier 3 approvals (second reviewer required).
- Configurable tier limits (daily txn cap, monthly cap, single-txn cap, card issuance allowed, international allowed).

### 4.4 Transactions & Receipts

Global explorer with filters: type (top-up, transfer, airtime, data, electricity, TV, betting, internet, eSIM purchase, virtual-number lease, card spend, refund, fee), status (pending/success/failed/reversed), provider, currency, amount range, date range, user, device.

Transaction detail page mirrors the mobile receipt at `/_app/transaction/:id` plus:
- Full **double-entry ledger** view (debits/credits per account)
- Provider request/response trace (redacted)
- PIN attempt history for that txn (since PIN now gates every financial action)
- Linked KYT / fraud rule hits
- Actions: Retry, Refund (full/partial), Reverse, Mark as fraud, Attach to ticket
- Exports: CSV, PDF receipt (true PDF, not the HTML mock used in-app)

### 4.5 Wallets, FX & Payouts

- **Float accounts** per currency (NGN, USD, EUR — matching mobile currency switcher). Show balance, pending in/out, last reconciliation timestamp.
- **Manual adjustments** with mandatory reason + counter-account selection; produce balanced ledger entries.
- **FX rates:** rate provider feed, spread per corridor, manual override with effective window, history chart.
- **Payouts queue:** bank picker results from mobile (bank, account number, name match score) → approver workflow (single or dual depending on amount). Bulk approve, reject with reason, retry on provider failure.
- **Top-ups (`/topup` mobile flow):** reconciliation against Flutterwave/Paystack/Interswitch settlement files; unmatched items workspace.

### 4.6 Cards (Virtual Card Program)

Mirrors mobile `/_app/cards/*`:

- **Programs:** BIN, brand (Visa / Mastercard), currency, default monthly limit, issuance fee (currently `ISSUE_FEE_NGN = 1500`), allowed categories, blocked categories defaults.
- **Issued cards table:** id, label, holder, brand, masked PAN, status (active/frozen/expired), balance, monthly spent vs limit, blocked categories, created-at.
- **Card detail:**
  - Mirrors mobile card features: freeze/unfreeze, set spend limit, set blocked merchant categories (gambling, crypto, adult, ATM…), top-up / withdraw to wallet, cancel.
  - **Reveal PAN/CVV** requires step-up (admin re-auth + reason + auto-expiring view, watermarked, audit logged).
  - Card transaction list (`cardTxns`): merchant, category, amount, status (settled/pending/declined).
- **Bulk ops:** freeze by category, mass cancel by program.
- **Chargeback / dispute** workflow scaffold.

### 4.7 eSIM

Mirrors mobile `/_app/esims/*` and `/pay/esim`:

- **Plans CRUD:** country (with flag), data GB, validity days, price per currency, supplier, margin, visibility.
- **Inventory:** QR / ICCID stock per supplier, low-stock alerts, supplier API health.
- **Orders:** order id, user, plan, price, status (paid / provisioning / delivered / activated / failed), QR re-send, refund.
- Activation step monitoring (mirrors the in-app activation steps screen).

### 4.8 Virtual Numbers

Mirrors mobile `/_app/numbers/*`:

- **Pool** by country & area code, supplier, cost, retail price, status (available/leased/quarantined).
- **Leases:** user, number, started, renews-on, auto-renew flag, SMS volume.
- Operations: release, re-quarantine, force-renew, route SMS/voice provider.

### 4.9 Bill Payments (Pay hub)

Covers every service in the mobile Pay hub: **Airtime, Data, Electricity, TV, Betting, Internet, eSIM top-up**.

- **Billers catalogue:** Airtime networks (MTN, Glo, Airtel, 9mobile), DisCos (Eko, Ikeja, AEDC, …), TV providers (DStv, GOTV, Startimes), Betting (Bet9ja, SportyBet, …), Internet ISPs, with logo, status, provider routing, fees.
- **Plans CRUD** for Data, TV, Internet packages: name, validity, price, cost, margin, visibility, sort order.
- **Orders monitor:** live stream of bill-pay attempts with provider response times; auto-retry rules; manual retry; refund.
- **Meter & subscription validators:** test endpoints per biller.

### 4.10 Payment Providers

Per provider (Flutterwave, Paystack, Interswitch, card-issuing partner, eSIM supplier, telco aggregator):
- Credentials (masked, rotation reminder, environment-scoped).
- Routing rules (e.g., Flutterwave for cards <₦100k, Paystack else).
- Health status, latency, success rate (24h chart).
- Webhook log viewer with replay.

### 4.11 Support

- **Live chat console** powering the in-app `/_app/profile/help/chat`: queue, agent assignment, transfer, canned responses (macros), file attach, transcript export. Presence + typing indicators. SLA timers.
- **Tickets:** email/in-app/social ingest, status (new/open/pending/solved), priority, tags, linked user & transactions.
- **Knowledge base** powering in-app Help Center articles (CRUD, categories, search).
- **Refund / goodwill** issuance (capped per agent role, dual approval above threshold).

### 4.12 Compliance / Risk

- **Rule engine:** velocity (count & sum) per user/device/IP, geo rules, amount thresholds, mismatched name on payouts, new-device + large-txn combos. Rules versioned, sandboxed shadow-run before activation.
- **Alerts queue:** triage, assign, resolve with disposition.
- **Sanctions / PEP / adverse-media screening** results per user with re-screen schedule.
- **Freezes & holds:** account-level, wallet-level, txn-level (with auto-expiry).
- **SAR / regulatory exports:** CBN, NFIU formatted reports, scheduled drops, evidence bundle download.
- **PIN security oversight:** failed-PIN counters, lockout policy config (mirrors `pin-store.ts`), forced reset trigger.

### 4.13 Growth

- **Referrals (`/_app/profile/referrals`):** program rules (referrer reward, referee reward, qualification event, expiry), per-user code, leaderboard, payout queue, fraud checks.
- **Promotions:** promo codes (% / flat / free-fee), eligibility, caps, A/B variants, redemption analytics.
- **Campaigns:** push, email, SMS, in-app banner. Audience builder (filters across user attributes & behaviour). Schedule, throttle, results.

### 4.14 Content Management

- Onboarding carousel slides (3 mobile slides) — copy & image CRUD with preview.
- Legal docs (Terms, Privacy, AUP) — versioned, with effective date; mobile pulls latest.
- Help Center articles & categories.
- Service icons / brand assets per biller.

### 4.15 Notifications

Templated push / email / SMS across event types: signup welcome, KYC pending/approved/rejected, PIN created (new — covers `/auth/pin-setup`), low balance, txn success/failure, card frozen, card limit reached, eSIM activated, referral reward earned, security alert. Per-template variables, locale, A/B, send-window guardrails.

### 4.16 Settings

- **Admins:** invite, assign role, deactivate, force 2FA reset.
- **Audit log:** append-only, searchable by actor/entity/action/date; CSV export with watermark.
- **Feature flags:** per-env toggles (e.g., enable virtual numbers, enable USD wallet, force PIN on top-up — already on in mobile).
- **API keys / secrets:** masked, rotation, last-used timestamp.
- **Branding:** edit theme tokens that flow to the mobile app shell.

---

## 5. Cross-cutting Requirements

**Security**
- Mandatory admin 2FA (TOTP). SSO (Google Workspace) optional.
- Step-up auth (re-enter password + 2FA) for: PAN/CVV reveal, manual ledger adjustments, payouts above threshold, role changes, secret rotation.
- IP allow-list per role, session timeout 15 min idle / 8 hr absolute, device binding optional.
- All sensitive fields masked by default with click-to-reveal (logged).
- CSP, HSTS, SRI on assets; no third-party scripts in admin.

**Audit & Observability**
- Immutable audit log (append-only, hash-chained).
- Action-level tracing into transaction ledger.
- Per-page error boundary; structured logs shipped to APM.

**Data & Privacy**
- PII access on need-to-know; redaction in screenshots/exports.
- DSAR workflow (export & delete user data on request).
- Data retention policies per entity (KYC docs 7 yrs, support chats 2 yrs, etc.).

**Performance**
- Server-side pagination & cursor-based lists; virtualized tables for >1k rows.
- Saved filters & shareable URL state on every list page.
- Bulk actions with progress + cancellation.

**Internationalization & Currency**
- Display amounts in user's currency + NGN equivalent at txn-time FX.
- Timezone toggle (admin local vs Africa/Lagos).

**Accessibility**
- WCAG 2.1 AA: keyboard navigable, focus states, ARIA on all dialogs/drawers, contrast tokens reused from mobile (indigo + gold) with light/dark themes.

---

## 6. Tech Stack (recommended)

- **Frontend:** TanStack Start (parity with mobile), Tailwind v4, shadcn/ui, recharts for KPI charts, TanStack Table for grids, framer-motion for drawers.
- **Backend:** Lovable Cloud (Postgres + edge functions). Roles in dedicated `admin_roles` table with `has_role()` security-definer; RLS on every table.
- **Realtime:** Lovable Cloud realtime channels for live chat & alerts.
- **Storage:** Lovable Cloud storage for KYC docs, dispute evidence, exports.
- **Background jobs:** scheduled functions for reconciliation, sanction re-screens, eSIM stock checks, referral payouts.

---

## 7. Mobile-app ↔ Admin Mapping (traceability)

| Mobile route | Admin surface |
|---|---|
| `/onboarding` | Content → Onboarding slides |
| `/auth/signup`, `/auth/login` | Users → Devices/Sessions; Settings → Auth policies |
| `/auth/pin-setup`, PIN gating on every txn | Compliance → PIN security; Users → Reset PIN |
| `/kyc` | KYC queue + case detail |
| `/_app/home` | Dashboard KPIs; Users → User 360 |
| `/_app/wallet`, `/topup`, `/transfer` | Wallets, Top-ups, Payouts, FX |
| `/_app/pay/*` (airtime, data, electricity, TV, betting, internet, eSIM) | Pay → Billers, Plans, Orders |
| `/_app/cards/*` | Cards programs, issued cards, dispute |
| `/_app/esims/*` | eSIM plans, inventory, orders |
| `/_app/numbers/*` | Numbers pool & leases |
| `/_app/profile`, `/profile/security/*` | User 360; Settings → Auth policies |
| `/_app/profile/referrals` | Growth → Referrals |
| `/_app/profile/help`, `/help/chat` | Support → Tickets, Live chat, KB |
| `/_app/profile/legal` | Content → Legal docs |
| `/_app/transaction/:id` | Transactions explorer + receipt |

---

## 8. Acceptance Criteria (v1)

1. An ops user can find any mobile user in <5 s and view their full 360, including every transaction reflected in the mobile receipt.
2. A compliance officer can review and decide a KYC case end-to-end with full audit trail and tier assignment that reflects in the mobile profile within 60 s.
3. Finance can adjust a wallet, refund a transaction, and approve a payout — each producing balanced ledger entries and immutable audit entries.
4. Card ops can issue, freeze, set limits, restrict categories, and reveal PAN/CVV (with step-up) for any card a user holds in the mobile app.
5. Telco ops can publish a new eSIM plan and a new bill-pay plan, and the mobile app surfaces it without a redeploy.
6. Support can answer a live chat originating from the mobile `/_app/profile/help/chat` route in real-time, with full user context.
7. Every destructive or money-moving action requires a typed reason and creates an audit-log entry that an auditor role can read and export.
8. Every list page supports filter, search, save view, share-by-URL, and CSV export (role-gated).
9. All admin actions are RBAC-checked server-side with `has_role()`; client UI hides forbidden actions but never relies on hiding for security.
10. The admin app passes WCAG 2.1 AA spot-check on the 10 most-used screens.

---

## 9. Phasing

- **Phase 1 (MVP ops):** Auth+RBAC, Dashboard (basic), Users 360, KYC queue, Transactions explorer, Support live chat, Audit log.
- **Phase 2 (money & program ops):** Wallets/FX/Payouts, Cards program, eSIM & Numbers ops, Bill-pay catalogue, Refunds.
- **Phase 3 (risk & growth):** Compliance rule engine, sanctions, SAR exports, Referrals, Promotions, Campaigns, Content CMS, Feature flags.

---

## 10. Out of Scope (v1)

- Mobile-app redesign, native push backend infra, real KYC vendor swap-out, full accounting GL beyond the embedded double-entry ledger, partner-facing portal, customer-self-serve dispute portal.
