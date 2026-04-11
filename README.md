# Contracts Manager

A full-stack rental property and contract management system for the Mexican market. Built for property managers who handle properties on behalf of owners — track houses, tenants, and generate PDF rental contracts in Spanish.

## Features

- **Authentication** — Secure login with email/password via NextAuth.js
- **Dashboard** — KPI cards (total houses, active contracts, available units, expiring soon), expiring contracts alert table (60-day window), and total monthly income
- **Owners** — CRUD management of property owners
- **Houses** — CRUD with owner assignment, property type (residential/commercial), and status tracking (available / rented / under maintenance)
- **Tenants** — CRUD with optional fields for employment, references, and emergency contacts
- **Contracts** — Link a house to a tenant with financial terms; generate and download a PDF rental contract in Spanish

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Headless UI |
| ORM | Prisma 5 |
| Database | PostgreSQL 14 |
| Auth | NextAuth.js v4 + Prisma adapter |
| PDF | @react-pdf/renderer |
| Number-to-words | numero-a-letras (Spanish) |

## Data Model

```
Users → manage → Owners → own → Houses → contracted to → Tenants via Contracts
```

- **Owners** — property owners with contact info
- **Houses** — properties linked to an owner, with address and status
- **Tenants** — renters with optional employment and reference data
- **Contracts** — financial terms (rent, deposit, deadline, dates, witnesses) with PDF generation

## Getting Started

### Prerequisites

- Node.js v20+
- PostgreSQL 14+

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables by copying `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Set your `DATABASE_URL` and `NEXTAUTH_SECRET`.

3. Run database migrations:
   ```bash
   npm run db:migrate
   ```

4. (Optional) Seed the database:
   ```bash
   npm run db:seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed the database |

## Deployment

Currently running locally. Planned deployment to Vercel + Supabase (Prisma schema is compatible).