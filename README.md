# WireVault (Up2Charge)

A Next.js + Prisma + SQLite MVP to share board dossiers via QR + 5‑digit PIN.

## Prereqs
- Node.js 18+
- NPM/PNPM/Yarn
- VS Code recommended

## Setup
1. `cp .env.example .env` and adjust secrets.
2. `npm install`
3. `npm run migrate`
4. `npm run seed`
5. `npm run dev` → http://localhost:3000

Demo: `/b/DEMO01` (PIN `12345`)
Admin: `/admin` (use `.env` seeded credentials)

## Notes
- Files stored under `public/uploads/<shortId>/...` (MVP).
- PINs stored as bcrypt hashes only.
- Session cookie per board, ~20 minutes TTL.
- Admin cookie is simple; for production use NextAuth/SSO.
