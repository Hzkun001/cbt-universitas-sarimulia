# CBT-MAN Upgrade

CBT-MAN Upgrade is a **school-oriented Computer-Based Test (CBT)** application built with **TanStack Start, React, TypeScript, Prisma, and SQLite**.

This repository exists because the original available source was genuinely helpful to me. I used that help as a foundation, then upgraded and extended the application to make it more robust, more realistic for demos, and better suited for continued development.

This project is intended for:
- product previews
- feature development
- admin / teacher / student workflow testing
- local demo environments
- experimentation with a gradual migration from browser-only storage to server-backed persistence

It now includes a **realistic Indonesian-school demo dataset**, so the app feels like a living CBT system instead of an empty prototype.

> **Important:** This project is shared for learning, internal use, evaluation, and further improvement.
> **Selling this application, reselling copies, or offering it as a paid product/service is not allowed.**

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Current Architecture Status](#current-architecture-status)
- [Core Data Domains](#core-data-domains)
- [Realistic Demo Seeder](#realistic-demo-seeder)
- [Demo Accounts](#demo-accounts)
- [Getting Started](#getting-started)
- [Useful Scripts](#useful-scripts)
- [Project Structure](#project-structure)
- [How Data Flows](#how-data-flows)
- [Recommended Verification](#recommended-verification)
- [Contributing](#contributing)
- [License and Usage Restrictions](#license-and-usage-restrictions)
- [Acknowledgment](#acknowledgment)

---

## Features

- **Question bank management** organized as `Module → Topic → Question`
- Support for multiple **question types**:
  - single-choice (`pg`)
  - multiple-choice (`multi`)
  - true/false (`bs`)
  - essay (`essay`)
- **Exam management** with:
  - duration rules
  - correct / incorrect / blank scoring
  - exam tokens
  - participant group restrictions
  - question and answer shuffling
  - required fullscreen mode
  - tab-switch detection / basic anti-cheat controls
- **Exam session lifecycle** with statuses:
  - pending
  - in progress
  - finished
  - expired
- **Manual essay grading** for admin/operator roles
- **Results, evaluation, reports, leaderboard, and participant monitoring**
- **Server-side persistence** via Prisma + SQLite
- **Realistic seeded demo data** for local previews and development

---

## Tech Stack

### Frontend
- [TanStack Start](https://tanstack.com/start)
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI
- Zustand

### Backend / Persistence
- Prisma
- SQLite
- TanStack server functions

### Tooling
- Vite
- ESLint
- Prettier

---

## Current Architecture Status

This project currently uses a **hybrid transitional architecture**:

- **core CBT data is stored on the server** using Prisma + SQLite
- the UI still uses a **client-side repository/cache facade** in `src/lib/cbt/repos.ts`
- mutations are handled through **optimistic client updates**, then persisted asynchronously to the server

That means:
- this is **no longer a localStorage-only app** for core business data
- but it is also **not yet fully server-driven per route/page**

This approach keeps the old UI model working while allowing the system to migrate progressively to a more robust server-backed design.

---

## Core Data Domains

The current application models include:

- `Group`
- `User`
- `Modul`
- `Topik`
- `Soal`
- `Jawaban`
- `Ujian`
- `TokenUjian`
- `SesiUjian`
- `AppConfig`

Database schema:
- `prisma/schema.prisma`

---

## Realistic Demo Seeder

The seeding system has been upgraded so the application feels like a real school CBT deployment during preview and testing.

Current seeded coverage includes:
- multiple **class groups**
- demo accounts for **admin**, **operator**, **teachers**, and **students**
- Mathematics, Physics, and Biology modules
- realistic topic breakdowns
- objective and essay questions
- multiple exams with different configurations
- active and unused exam tokens
- participant sessions in different states:
  - not started
  - currently in progress
  - completed
  - graded
  - partially graded essay workflows

The shared seed source is centralized in:
- `src/lib/server/db/seed-shared.mjs`

Prisma seed entry point:
- `prisma/seed.mjs`

This keeps the **CLI seed path** and **server-side seed path** aligned, so they do not drift over time.

---

## Demo Accounts

> Seed data may evolve, but the following default accounts are currently created by the shared seed dataset.

### Admin
- `admin / admin123`

### Operator
- `operator1 / operator123`

### Teachers
- `guru_mtk / guru123`
- `guru_fisika / guru123`
- `guru_biologi / guru123`

### Students
- `alif.mahendra / peserta123`
- `nayla.putri / peserta123`
- `fajar.ramadhan / peserta123`
- `salma.azzahra / peserta123`
- `rizky.pratama / peserta123`
- `intan.permata / peserta123`
- `bagas.saputra / peserta123`
- `citra.lestari / peserta123`

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Prepare the database

Make sure `DATABASE_URL` points to a SQLite database.

Relevant config:
- `prisma.config.ts`

If needed, run migrations:

```bash
npm run prisma:migrate
```

### 3. Seed the database

```bash
npm run prisma:seed
```

### 4. Start development mode

```bash
npm run dev
```

### 5. Build for production testing

```bash
npm run build
```

---

## Useful Scripts

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run prisma:validate
npm run prisma:migrate
npm run prisma:seed
```

Additional route validation:

```bash
node scripts/check-admin-routes.mjs
```

---

## Project Structure

```text
prisma/
  schema.prisma        # database schema
  seed.mjs             # Prisma seeder entry point

src/
  components/          # UI and CBT-specific components
  lib/
    cbt/               # types, repos, auth, exam logic
    server/            # server functions, DB helpers, shared seed logic
  routes/              # TanStack Start file-based routes

scripts/
  check-admin-routes.mjs
```

Most important files to understand the system:
- `src/lib/cbt/repos.ts` — client cache / repository facade
- `src/lib/server/repos/functions.ts` — server persistence bridge
- `src/lib/cbt/exam.ts` — exam session creation and grading logic
- `src/lib/server/db/seed-shared.mjs` — main realistic demo dataset
- `prisma/schema.prisma` — database model definitions

---

## How Data Flows

1. The UI hydrates initial state from a server snapshot
2. That snapshot is loaded into the client-side repo cache
3. Admin and participant pages read data from that cache
4. On mutation, the cache is updated first
5. The change is then persisted to SQLite through server functions

Implications:
- the UX feels fast
- but client cache can become stale if persistence fails or if another tab/device changes the same data

---

## Recommended Verification

After major changes, run:

```bash
npm run prisma:validate
npm run prisma:seed
npx tsc --noEmit
node scripts/check-admin-routes.mjs
npm run build
```

---

## Notes and Limitations

- Core CBT data is already backed by **SQLite**, not pure browser storage.
- Some areas are still transitional remnants of the older browser-heavy architecture.
- File/audio handling still needs special treatment if the app is pushed toward a fully server-side setup.
- The current build may emit Vite chunk-size warnings, but these are **not blocking** for local development.

---

## Technical Roadmap

Reasonable next steps for this project include:

- migrating from global client repo cache to more server-driven loaders/queries
- improving error handling for optimistic mutations
- adding invalidation/refetch behavior after writes
- upgrading auth toward server sessions/cookies
- moving file/audio storage from browser storage to server storage
- adding automated tests for exam-taking and grading flows

---

## Contributing

Contributions are welcome **as long as they respect the intent and restrictions of this repository**.

Please contribute in ways that improve the project for learning, internal usage, demos, maintenance, stability, accessibility, and feature quality.

### Please do
- open issues for bugs, inconsistencies, and UX problems
- propose focused pull requests
- improve typing, validation, tests, docs, or developer experience
- improve performance and reliability
- preserve the school-oriented CBT domain model unless a change is clearly discussed

### Please do not
- submit changes intended to turn this repository into a commercial resale package
- remove attribution/context about the origin and upgrade purpose of this project
- use contributed changes to justify selling this repository or derived copies

### Recommended contribution flow
1. Fork the repository
2. Create a feature branch
3. Make focused changes
4. Run verification commands
5. Open a pull request with clear notes

---

## License and Usage Restrictions

This repository is released under a **custom non-commercial license**.

### In plain language
You may:
- study the code
- use it for learning
- use it for internal evaluation
- adapt it for non-commercial organizational or educational purposes
- contribute improvements back

You may **not**:
- sell this application
- resell copies of this repository
- sell hosted versions of this application
- package it as a paid template, SaaS, install service, or productized solution
- sublicense it for commercial distribution

If you need different usage rights, contact the repository owner first.

See the full license text in:
- `LICENSE`

---

## Acknowledgment

I built this upgrade because the existing source helped me a lot.

This repository is my way of giving back through improvements: better persistence, better demo data, stronger runtime safety, and a more maintainable CBT foundation.

Please respect that spirit.

**Do not sell this application.**
