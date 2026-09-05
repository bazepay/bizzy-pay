# BazePay Admin

i need a prototype for this app, below is the PRD

**BazePay Mobile App - Product Requirements Document (PRD)**

**Version:** 1.0  

**Date:** May 2026  

**Product Name:** BazePay  

**Prepared for:** Pejul Digital Agency / Client  

**Status:** Detailed Requirements (Based on Provided Proposal)

### 1. Executive Summary

BazePay is a fintech mobile application designed to solve critical financial access challenges for the **Nigerian diaspora** and **short-term visitors** to Nigeria. Traditional banking onboarding is hindered by BVN requirements, address verification, and time constraints. BazePay offers a frictionless, inclusive alternative with rapid KYC via Smile ID, multi-currency wallet, virtual cards, bill payments, and eSIM provisioning for instant connectivity.

**Primary Target:** Nigerian diaspora and short-term international visitors.  

**Secondary Target:** Nigerian residents seeking modern fintech services.

**Core Value Proposition:**  

- Onboard and become fully functional in minutes using facial biometrics + document verification.  

- Seamless funding, spending, and bill payments.  

- Instant Naira virtual cards and eSIM for travelers.  

- Secure, compliant, and scalable platform.

The solution will be delivered as a cross-platform mobile app (iOS & Android) with a companion web-based Admin Panel.

### 2. Project Objectives

- Deliver a secure, intuitive React Native mobile app for iOS and Android.

- Achieve high-speed KYC completion (target < 5-10 minutes for most users).

- Enable full fintech operations: wallet funding/payouts, bill payments, virtual cards.

- Integrate eSIM purchase/activation for traveler convenience.

- Build a robust Admin Panel for operations, compliance, and support.

- Ensure full regulatory compliance (CBN, NDPR, PCI-DSS where applicable).

- Provide scalable, maintainable architecture with cloud hosting.

### 3. Target Users & Personas

- **Diaspora User (Primary):** 25-45 years, lives abroad, visits Nigeria frequently or sends money home. Needs fast funding and bill payments.

- **Short-term Visitor:** International traveler arriving in Nigeria for business/tourism (few days to weeks). Needs instant virtual card + eSIM.

- **Nigerian Resident (Secondary):** Tech-savvy user seeking better UX than traditional banks.

- **Admin/Operations Users:** Internal team members with role-based access.

### 4. User Flows & Functional Requirements

#### 4.1 Onboarding & Authentication

- Phone number or Email registration with OTP verification.

- **Smile ID Integration:**

  - Facial biometric selfie (Smile Face).

  - Document upload/verification: International Passport, NIN, BVN.

- Tiered KYC Levels:

  - **Basic Tier:** Lower transaction limits (minimal docs/selfie).

  - **Enhanced Tier:** Full limits after complete verification.

- Biometric login (Face ID / Fingerprint) + PIN + Optional 2FA (Authenticator App/SMS).

- Secure session management and automatic logout on inactivity.

#### 4.2 Wallet & Funding

- Multi-currency wallet (Primary: NGN, with support for USD/EUR display/holding).

- Funding methods:

  - International debit/credit cards.

  - Local Nigerian bank transfers.

  - Supported gateways (Flutterwave, Paystack, Interswitch, etc.).

- Instant and scheduled payouts to local banks and international card rails.

- Wallet balance visibility with real-time updates.

- Transaction limits based on KYC tier (configurable).

#### 4.3 Payments & Services

- **Bill Payments:**

  - Airtime & Mobile Data top-up.

  - Electricity (prepaid/postpaid).

  - Cable/TV subscriptions (DSTV, GOTV, etc.).

  - Internet/Broadband.

  - Bet Funding (sports betting platforms).

- **Instant Naira Virtual Cards:**

  - Instant issuance upon request.

  - Controls: Set spend limits, freeze/unfreeze, merchant category restrictions, expiry management.

  - Transaction monitoring per card.

- **eSIM Purchase & Activation:**

  - Browse and purchase local/international data plans.

  - Instant QR code/eSIM profile delivery and activation guidance.

  - Integration with eSIM providers (API-based).

#### 4.4 Additional Mobile App Features

- Real-time transaction history with search, filters (date, type, status), and downloadable receipts.

- Push notifications and in-app alerts (transaction, security, promotions).

- Referral program with rewards (cashback, bonus credit).

- In-app customer support (chat/tickets).

- Dark/Light mode, accessibility features, multi-language support (English primary, others as needed).

#### 4.5 Security Features

- End-to-end encryption for sensitive data.

- Device binding and jailbreak/root detection.

- Real-time transaction monitoring and fraud alerts.

- Secure data storage (keychain/keystore).

- Regular security audits and penetration testing.

### 5. Admin Panel (Web-Based Dashboard) Requirements

#### 5.1 User Management

- Search, view, and manage user profiles.

- Manual KYC review, approval/rejection with Smile ID report access.

- Tier management and transaction limit adjustments.

#### 5.2 Transaction Management

- Real-time monitoring of all transactions (deposits, payouts, bills, virtual cards, eSIM).

- Approve/reverse flagged or high-value transactions.

- Export reports (CSV, PDF).

#### 5.3 Wallet & Finance Oversight

- Dashboard showing total float, wallet balances, and system liquidity.

- Funding source and payout channel performance monitoring.

#### 5.4 Services Management

- Configure billers, providers, and fees.

- Monitor eSIM inventory and transaction success rates.

- Virtual card issuance logs and bulk controls.

#### 5.5 Compliance & Risk

- AML/CFT flagging and reporting tools.

- Full audit logs for all admin actions.

- Integration with Smile ID verification logs.

#### 5.6 Analytics & Reporting

- Key metrics: Active users, transaction volume/value, revenue, conversion rates.

- User growth, retention, and cohort analysis charts.

- Custom report builder.

#### 5.7 Settings & Support

- Manage app content, fees, and notification templates.

- Integrated customer support ticket system.

- Role-Based Access Control (RBAC): Admin, Operations, Compliance, Support, View-Only.

### 6. Non-Functional Requirements

- **Performance:** App should load in < 2 seconds; transactions processed in real-time where possible.

- **Scalability:** Support 100,000+ users initially, with auto-scaling.

- **Availability:** 99.9% uptime.

- **Security & Compliance:** NDPR, CBN fintech guidelines, PCI-DSS for card data. Data encryption at rest and in transit.

- **Usability:** Intuitive UI/UX focused on simplicity for non-tech users. Follow Material Design (Android) and Human Interface Guidelines (iOS) via React Native.

- **Offline Support:** View balance/history (limited actions) when offline.

### 7. Technical Architecture

- **Mobile App:** React Native (single codebase for iOS & Android).

- **Backend:** Node.js (preferred for speed) or Python (Django/FastAPI). Choose based on team expertise.

- **Database:** MongoDB (flexible for fintech schemas) or PostgreSQL. Include proper indexing and sharding strategy.

- **Cloud Infrastructure:** AWS, GCP, or Azure (recommend AWS for Nigerian latency + compliance).

- **Key Integrations:**

  - Smile ID SDK/API (KYC).

  - Payment Gateways (Flutterwave/Paystack/Interswitch).

  - Virtual Card Issuance Partner.

  - eSIM Provider API.

  - SMS/Email providers (Twilio, Termii, etc.).

- **Security:** OWASP compliance, rate limiting, input validation, secure API design.

### 8. Assumptions & Dependencies

- Third-party providers (Smile ID, payment gateways, eSIM, virtual cards) have stable APIs and necessary approvals.

- Client will handle regulatory licensing (if required) or provide necessary CBN compliance guidance.

- Client will provide branding assets (logo, colors, etc.).

- Access to sandbox environments for all integrations during development.

### 9. Phases & High-Level Deliverables (Recommended)

1. **Discovery & Design** — Wireframes, UI/UX, final PRD sign-off.

2. **Development** — Core features, integrations, Admin Panel.

3. **Testing** — Unit, integration, UAT, security/penetration testing.

4. **Deployment** — App Store + Play Store submission, Admin Panel hosting.

5. **Post-Launch** — Warranty/maintenance (typically 3-6 months included), monitoring, iterations.

### 10. Success Metrics (KPIs)

- Onboarding completion rate > 85%.

- Average time to first transaction < 15 minutes.

- Monthly Active Users (MAU) growth.

- Transaction volume and revenue targets (to be defined).

- Support ticket resolution time and user NPS/CSAT scores.

- Fraud rate < industry benchmark.

This PRD serves as the foundational blueprint for development. It can be refined during the design phase based on detailed wireframing and stakeholder feedback.

**Next Steps Recommendation:**  

Schedule a requirements walkthrough meeting, followed by UI/UX design kickoff and technical architecture deep-dive.

---

This document is comprehensive and ready to guide the full development lifecycle. Let me know if you need any sections expanded (e.g., detailed user stories, data models, API specifications, or wireframe outlines).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bizzy-pay.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3a8b07cd-fc1f-404d-b785-c9f50c8a00fd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
