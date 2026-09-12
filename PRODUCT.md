# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Primary users are gestores / property managers who manage rental properties on behalf of owners. They open the product to keep leases, properties, tenants, and owners organized, generate formal lease documents, and stay ahead of contract expirations.

## Product Purpose

Contratos Manager (working product; shorter public name TBD) helps Mexican property managers run arrendamiento workflows end to end: register owners, inmuebles, inquilinos, and contracts; monitor portfolio health; generate Spanish MXN lease PDFs; and surface expiry alerts so renewals are not missed.

Success means a manager can trust one system for lease paperwork and upcoming expirations across web and iOS, without inventing parallel spreadsheets or ad-hoc documents.

## Positioning

Spanish-language Mexican arrendamiento operations with MXN lease PDF generation and expiry alerts. A neighboring generic CRM or English-only contracts tool could not truthfully claim this lease-document and local-workflow focus.

## Operating Context

- Web app for day-to-day portfolio management (dashboard, CRUD for contratos / inmuebles / inquilinos / propietarios, PDF generation).
- iOS app (planned / in progress via mobile API) for on-the-go access to the same domain, with push-oriented expiry awareness as a core job.
- Mexican address and identity fields in use (colonia, código postal, CURP, RFC).
- Currency and formatting: MXN, `es-MX`.
- Access is restricted to authorized users; no public self-signup in the current web product.

## Capabilities and Constraints

**Confirmed today (web + API):**
- Auth-gated web UI (NextAuth credentials).
- Per-user data isolation (`userId` scoping); not org/team multi-tenancy.
- CRUD: propietarios, inmuebles, inquilinos, contratos.
- Dashboard KPIs and contracts-expiring-within-60-days alerts.
- Spanish rental contract PDF generation (`@react-pdf/renderer`).
- Mobile JWT API under `/api/mobile/*` for login, dashboard, entities, PDF, and device tokens.

**Confirmed product intent:**
- Product covers **web and iOS** (adaptive). Native iOS UI is specified in `PRD-ios-mobile-app.md`; this repo currently holds the web app and mobile API, not the Xcode project.

**Open / undecided:**
- Shorter public product name to replace the current UI label “Contratos / Bienes raíces” (repo name `contracts-manager` is not the product name).
- Production hosting details beyond local development (README mentions planned Vercel + Supabase; not confirmed as shipping truth).

**Out of scope unless later confirmed:** team/org accounts, public registration, Android-native app.

## Brand Commitments

- Domain language in Spanish (UI): contratos, inmuebles, inquilinos, propietarios, renta, depósito, día de pago, plazo, testigo, and Mexican status labels.
- Current interim UI wordmark: “Contratos” with subtitle “Bienes raíces” — **must be renamed to something shorter**; do not treat the interim label as permanent brand.
- Repo/npm name `contracts-manager` is technical only, not customer-facing brand.
- Binding visual world is not established in this file; visual identity is owned by DESIGN.md / new-work when created.

## Evidence on Hand

- Working web app routes and Spanish copy under `src/app`.
- Prisma schema and seed user only (`admin@contratos.com`); no sample portfolio seed data.
- Lease PDF implementation in `src/lib/contractPdf.tsx`.
- Mobile API routes and `PRD-ios-mobile-app.md` for iOS intent.
- Marketing/atmosphere images in `public/` (login/dashboard heroes).
- **Do not fabricate:** customer logos, testimonials, pricing, production URLs, final shorter product name, or native iOS screenshots that are not in the repo.

## Product Principles

1. Optimize for gestores doing Mexican arrendamiento work, not generic contract filing.
2. Lease PDFs and expiry alerts are first-class product mechanisms, not extras.
3. Keep Spanish domain terminology consistent across web and iOS.
4. Preserve per-user data boundaries and authorized-only access.
5. Prefer a shorter, memorable public name once chosen; avoid locking interim labels.

## Accessibility & Inclusion

No product-specific accessibility standard was confirmed beyond ordinary web/iOS expectations. Prefer clear Spanish labels and readable form hierarchy for day-to-day operational use.
