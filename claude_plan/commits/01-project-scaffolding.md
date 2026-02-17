# Commit 1: Initialize Vite + React + TypeScript Project

## Goal
Set up the project foundation: build tooling, styling, testing infrastructure.

## What to implement

1. **Scaffold with Vite**
   - `npm create vite@latest . -- --template react-ts`
   - Clean out default boilerplate (App.css, assets, etc.)

2. **Tailwind CSS**
   - Install `tailwindcss`, `postcss`, `autoprefixer`
   - Create `tailwind.config.ts` with content paths
   - Create `postcss.config.js`
   - Add Tailwind directives to `src/index.css`

3. **Vitest**
   - Install `vitest`
   - Add `test` script to `package.json`: `"test": "vitest"`
   - Configure in `vite.config.ts`: `test: { globals: true, environment: 'jsdom' }`

4. **TypeScript config**
   - Strict mode enabled
   - Path alias: `@/*` → `src/*`
   - Update `vite.config.ts` with resolve alias

5. **`.gitignore`**
   - node_modules, dist, .env, .DS_Store

6. **`src/App.tsx`** — minimal shell: dark background div with "Traffic Simulator" heading
7. **`src/main.tsx`** — standard React entry point
8. **`src/index.css`** — Tailwind base + dark theme defaults

## Files created
- `package.json`
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `vite.config.ts`
- `tailwind.config.ts`
- `postcss.config.js`
- `index.html`
- `.gitignore`
- `src/main.tsx`
- `src/App.tsx`
- `src/index.css`
- `src/vite-env.d.ts`

## Verification
- `npm install` succeeds
- `npm run dev` → browser shows "Traffic Simulator" on dark background
- `npm test` → runs with 0 tests (no failures)
