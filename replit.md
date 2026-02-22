# Pimple Lab

## Overview

Pimple Lab is a teen-focused skincare analysis web application that uses AI (MedGemma via Hugging Face) to analyze skin photos and generate personalized skincare experiment plans. The app follows a wizard-style flow: users complete an intake questionnaire about their skin, lifestyle, and history, then take a photo which gets analyzed by an AI model. The system produces a structured "experiment plan" — a hypothesis-driven skincare recommendation with product suggestions, duration, and tracking guidance. It is explicitly not a medical diagnosis tool and includes urgent referral logic for severe cases.

## User Preferences

Preferred communication style: Simple, everyday language.
**CRITICAL**: MedGemma is the primary and required AI model for skin analysis. Do NOT switch to another model (e.g., Qwen) without explicit user permission. Qwen2.5-VL may only be used for enhancement purposes, not as a replacement.

## System Architecture

### Full-Stack Structure
- **Monorepo layout** with three top-level source directories:
  - `client/` — React SPA (Vite + TypeScript)
  - `server/` — Express API server (TypeScript, runs via tsx)
  - `shared/` — Shared types, schemas, and database models used by both client and server

### Frontend (`client/src/`)
- **React 18** with **TypeScript**, bundled by **Vite**
- **Routing**: `wouter` (lightweight client-side router)
- **State management**: Local React state via custom hooks (`useIntakeStore`), no global store
- **Data fetching**: `@tanstack/react-query` with a custom `apiRequest` helper
- **UI components**: **shadcn/ui** (new-york style) built on Radix UI primitives, styled with **Tailwind CSS** and CSS variables for theming
- **Animations**: `framer-motion` for page transitions and loading states
- **App flow phases**: `landing → intake → photo → analysing → result` — all managed as state in `home.tsx`
- **Intake form**: Multi-step wizard (5-6 steps depending on biological sex) collecting age, concern zones, symptoms, lifestyle, treatment history, and menstrual cycle data
- **Photo capture**: Client-side brightness detection, max 3 attempts, single photo sent to server
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend (`server/`)
- **Express.js** HTTP server with TypeScript
- **Key routes**:
  - `POST /api/analyse` — Accepts multipart form data (photo + intake JSON), processes image with `sharp` (resize to 512×512, 70% JPEG), sends to MedGemma AI, runs experiment engine, stores scan, returns result card
- **Image processing**: `sharp` for server-side resize and compression, `multer` for file upload handling
- **AI integration**: MedGemma model accessed via Hugging Face Inference Endpoint (`HF_ENDPOINT_URL` + `HF_API_TOKEN`). The model receives a structured system prompt and returns JSON with skin pattern classification
- **Experiment engine** (`server/experiment-engine.ts`): Rule-based logic that takes MedGemma's analysis + intake data and generates one of several experiment types (urgent/doctor referral, fungal treatment, standard acne treatment, etc.)
- **Dev mode**: Vite dev server middleware with HMR
- **Production**: Static file serving from `dist/public`

### Database
- **PostgreSQL** via `DATABASE_URL` environment variable
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema** (`shared/schema.ts`):
  - `users` table: id (UUID), username, password
  - `scans` table: id (UUID), sessionId, scanType, intake (JSONB), medgemmaRaw (JSONB), experiment (JSONB), confidence, resultCard (JSONB), parseMethod, createdAt
- **Migrations**: Managed via `drizzle-kit push` (`npm run db:push`)
- **Storage layer**: `DatabaseStorage` class in `server/storage.ts` implementing `IStorage` interface

### Build System
- **Dev**: `tsx server/index.ts` runs the Express server with Vite middleware
- **Build**: Custom `script/build.ts` that runs Vite build for client and esbuild for server, outputting to `dist/`
- **Production**: `node dist/index.cjs`

### Validation
- **Zod** schemas defined in `shared/schema.ts` for intake form validation, used on both client and server
- `drizzle-zod` generates insert schemas from database table definitions

## External Dependencies

### Required Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required for app to start)
- `HF_ENDPOINT_URL` — Hugging Face Inference Endpoint URL for MedGemma model
- `HF_API_TOKEN` — Hugging Face API authentication token

### Third-Party Services
- **Hugging Face Inference Endpoints** — Hosts the MedGemma medical vision model for skin analysis. The server sends base64-encoded images with a structured prompt and expects JSON classification output
- **PostgreSQL** — Primary data store for users and scan results

### Key NPM Dependencies
- `express` + `multer` — HTTP server and file upload
- `sharp` — Server-side image processing
- `drizzle-orm` + `pg` — Database ORM and PostgreSQL driver
- `zod` + `drizzle-zod` — Schema validation
- `react` + `vite` + `@vitejs/plugin-react` — Frontend framework and bundler
- `@tanstack/react-query` — Async state management
- `framer-motion` — Animations
- `wouter` — Client-side routing
- `shadcn/ui` components (Radix UI + Tailwind CSS) — UI component library
- `connect-pg-simple` — PostgreSQL session store (available but may not be actively used yet)