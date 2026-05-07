
# BazePay Mobile Prototype — Plan

A frontend-only, mobile-first clickable prototype with mock data. No backend, no real integrations. Designed to demo end-to-end flows to stakeholders.

## Brand & Design System

**Palette (suggested fintech identity — no green):**
- Primary: Deep indigo / midnight blue `oklch(0.32 0.12 270)` — trust, premium fintech
- Accent: Warm gold `oklch(0.82 0.16 85)` — premium highlights on cards & CTAs
- Surface dark: Near-black violet `oklch(0.16 0.03 280)` for hero sections, virtual cards
- Surface light: Soft warm cream `oklch(0.98 0.01 80)`
- Success / Warning / Destructive tokens use blue-leaning, amber, and coral (no green for success — use a teal-blue `oklch(0.65 0.12 230)`)
- Gradients: `--gradient-primary` (indigo → violet), `--gradient-card` (midnight → gold-tinted indigo) for hero balance + virtual card

**Typography:** Display font (Sora or Space Grotesk) + body (Inter). Bold balance numerals, tight tracking on headings.

**Motion:** framer-motion for screen transitions, balance reveal, card flip, bottom-sheet payments.

**Layout:** Mobile-first (max-w 430px), phone-frame chrome on desktop preview so it feels like an app.

## Information Architecture (routes)

```
/                       → Splash / brand intro (auto-advance to /onboarding)
/onboarding             → 3-slide value prop carousel
/auth/signup            → Phone/email + OTP (mock)
/auth/login             → PIN / biometric mock
/kyc                    → Smile ID flow (selfie → doc → tier result)
/_app                   → Tab layout (Outlet) with bottom nav

/_app/home              → Wallet hero, quick actions, recent txns
/_app/wallet            → Multi-currency, fund / payout sheets, full history with filters
/_app/pay               → Bill payments hub (airtime, data, electricity, TV, betting)
/_app/pay/$service      → Per-service form + confirmation
/_app/cards             → Virtual cards list, issue new, card detail (freeze, limits)
/_app/esim              → Plans browser + checkout + QR delivery
/_app/profile           → KYC tier, security settings, referrals, support
/transaction/$id        → Receipt detail (downloadable PDF mock)
```

Bottom nav: Home · Wallet · Pay · Cards · Profile (eSIM accessed from Home quick action).

## Key Screens & Interactions

**Onboarding + KYC**
- 3 swipeable intro slides (diaspora, visitor, instant card)
- Phone/email entry → animated 6-digit OTP input → success
- KYC: animated selfie capture mock (camera frame + scanning ring), document picker (Passport / NIN / BVN), processing screen, Tier badge result (Basic vs Enhanced)

**Wallet**
- Hero card with NGN balance, currency switcher chip (NGN / USD / EUR)
- Quick actions: Add Money, Send, Pay Bills, Cards
- Fund sheet: card / bank transfer / gateway picker (Flutterwave, Paystack, Interswitch labels)
- Payout sheet: bank picker + amount + confirmation
- Transactions: search, filter chips (date range, type, status), grouped by day, downloadable receipt

**Bill Payments**
- Grid of services with iconography
- Per-service screens: Airtime (network picker MTN/Glo/Airtel/9mobile), Data (plan list), Electricity (disco picker + meter), TV (DStv/GOTV/Startimes packages), Betting (Bet9ja, SportyBet, etc.)
- Confirmation bottom sheet → success animation → receipt

**Virtual Cards**
- Stacked card carousel with indigo→gold gradient + chip + brand
- Issue card flow (name, currency, fund amount)
- Card detail: reveal PAN/CVV (tap to show), freeze toggle, spend limit slider, merchant category restrictions, mini transaction list

**eSIM**
- Country selector with flags
- Plan cards (data GB / validity / price)
- Checkout → QR code + activation steps

**Profile**
- KYC tier card with upgrade CTA
- Security: biometric, PIN change, 2FA toggles
- Referral with shareable code + rewards counter
- Support (mock chat)
- Light/Dark toggle

## Technical Notes

- Stack: TanStack Start (already scaffolded), Tailwind v4, shadcn/ui, framer-motion, lucide-react icons, recharts (small spend chart on Home)
- Mock data in `src/lib/mock/` (user, transactions, billers, plans, cards)
- Light state via React context for: auth status, selected currency, cards, transactions (so actions feel persistent within a session)
- All routes as separate files with proper `head()` metadata
- Phone-frame wrapper component for desktop preview; full-bleed on real mobile
- No real APIs; OTP autofills 123456, KYC always succeeds after 2s timer

## Build Order (single implementation pass)

1. Design tokens in `styles.css` (indigo + gold, no green) + Sora/Inter fonts + phone frame shell
2. Splash → Onboarding → Auth → KYC chain
3. `_app` tab layout + bottom nav + Home
4. Wallet + transactions + fund/payout sheets
5. Bill payments hub + 5 service flows + receipt
6. Virtual cards + eSIM
7. Profile + settings
8. QA pass on mobile viewport

## Out of Scope (this prototype)

- Real backend, auth, payments, KYC, card issuance, eSIM provisioning
- Admin web dashboard
- Push notifications, real biometrics, device binding
- Localization beyond English
