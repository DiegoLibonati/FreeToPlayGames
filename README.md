# Free Games

## Educational Purpose

This project was created primarily for **educational and learning purposes**.  
While it is well-structured and could technically be used in production, it is **not intended for commercialization**.  
The main goal is to explore and demonstrate best practices, patterns, and technologies in software development.

## Description

**Free Games** is a full-stack web application that lets users discover, explore, and save free-to-play games from across all platforms and genres.

The app consumes the [FreeToGame API](https://www.freetogame.com/api-doc) via RapidAPI to fetch a large catalog of free-to-play titles, each with metadata such as genre, platform, publisher, developer, release date, and a direct link to the game's official page. Users can browse this catalog in several ways: a home page featuring a rotating image showcase of highlighted games alongside a spotlight card that cycles through the library, a dedicated Games page with real-time genre filtering, and a carousel-based section that groups games by category.

Authentication is handled entirely through Firebase Auth, supporting both email/password registration and login as well as Google Sign-In. Every user has a private Favorites list backed by Firestore, where they can add and remove games that interest them. The favorites persist across sessions and are tied to the authenticated user's account.

The UI is organized around a persistent navigation bar with a responsive hamburger menu, a footer with social links, and a global alert system powered by SweetAlert2. Active game details open in an overlay panel — the `ActiveGame` component — that adjusts its available actions depending on the current route (add to favorites on the explore page, remove from favorites on the favorites page). A custom disk-style card component (`DiskGame`) animates on click to reveal extended game information inline.

State is managed globally with Redux Toolkit across three slices: `auth` (user session, login images, error messages), `games` (full catalog, categories, favorites, active game), and `ui` (navbar open state, filter open state, SweetAlert2 alerts). Components never dispatch directly — they interact with the store exclusively through custom hooks (`useAuthStore`, `useGamesStore`, `useUiStore`), keeping the component layer clean and testable.

The project is fully tested with Jest and React Testing Library, covering components, pages, services, and helpers with a minimum 70% coverage threshold across all metrics. HTTP traffic is intercepted at the network layer with MSW (Mock Service Worker) — `gameService` is exercised end-to-end against MSW handlers, while components and pages that consume the service mock the module directly. Pre-commit hooks via Husky and lint-staged enforce ESLint and Prettier automatically on every commit.

## Technologies used

1. React JS
2. TypeScript
3. Vite
4. HTML5
5. CSS3
6. Firebase
7. Firestore

## Libraries used

#### Dependencies

```
"@reduxjs/toolkit": "^2.5.0"
"firebase": "^12.3.0"
"query-string": "^7.1.1"
"react": "^19.2.4"
"react-dom": "^19.2.4"
"react-router-dom": "7.13.2"
"react-icons": "^4.4.0"
"react-redux": "^9.2.0"
"react-wavify": "^1.6.2"
"sweetalert2": "^11.4.33"
```

#### devDependencies

```
"@eslint/js": "^9.0.0"
"@testing-library/dom": "^10.4.0"
"@testing-library/jest-dom": "^6.6.3"
"@testing-library/react": "^16.0.1"
"@testing-library/user-event": "^14.5.2"
"@types/jest": "^30.0.0"
"@types/node": "^22.0.0"
"@types/react": "^19.2.14"
"@types/react-dom": "^19.2.3"
"@vitejs/plugin-react": "^5.0.2"
"eslint": "^9.0.0"
"eslint-config-prettier": "^9.0.0"
"eslint-plugin-prettier": "^5.5.5"
"eslint-plugin-react-hooks": "^5.0.0"
"eslint-plugin-react-refresh": "^0.4.0"
"globals": "^15.0.0"
"husky": "^9.0.0"
"jest": "^30.3.0"
"jest-environment-jsdom": "^30.3.0"
"lint-staged": "^15.0.0"
"msw": "2.10.4"
"prettier": "^3.0.0"
"ts-jest": "^29.4.6"
"typescript": "^5.2.2"
"typescript-eslint": "^8.0.0"
"undici": "^7.25.0"
"vite": "^7.1.6"
```

## Getting Started

With the stack outlined above, follow these steps to run the project locally:

1. Clone the repository
2. Navigate to the project folder
3. Execute: `npm install`
4. Copy `.env.example` to `.env` and fill in your RapidAPI and Firebase credentials
5. Execute: `npm run dev`

The application will open automatically at `http://localhost:3000`.

## Testing

With the app running locally, you can verify everything works by exercising the test suite.

1. Navigate to the project folder
2. Execute: `npm test`

For coverage report:

```bash
npm run test:coverage
```

## Continuous Integration

The repository ships with a **GitHub Actions** pipeline defined in [`.github/workflows/ci.yml`](.github/workflows/ci.yml). It runs automatically on every `push` and `pull_request` targeting the `main` branch. The Node version is pinned via [`.nvmrc`](.nvmrc) and reused by every job through `actions/setup-node` with npm caching enabled.

### Pipeline overview

```
            ┌─── PR or push to main ───┐
            ▼                          ▼
┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    lint-and-audit    │─▶│      testing     │─▶│       build      │
│ eslint · type-check  │  │  jest (jsdom+MSW)│  │ tsc + vite build │
└──────────────────────┘  └──────────────────┘  └──────────────────┘
```

The three jobs run sequentially through the `needs:` chain — `testing` only starts if `lint-and-audit` passes, and `build` only starts if `testing` passes. If any job fails, the downstream jobs are skipped and the run is marked red.

### Validation jobs (run on every PR and push)

1. **`lint-and-audit`** — installs dependencies with `npm ci`, then runs:
   - `npm run lint` — ESLint with the project config (TypeScript + React Hooks + Prettier).
   - `npm run type-check` — `tsc -p tsconfig.app.json --noEmit`, full TypeScript check without emitting.
2. **`testing`** — `npm ci` followed by `npm run test`, which executes the full Jest suite under `jest-environment-jsdom` with MSW intercepting HTTP. Coverage is not collected in CI by default; run `npm run test:coverage` locally to inspect the 70% threshold.
3. **`build`** — `npm ci` followed by `npm run build`, which runs `tsc -p tsconfig.app.json` and then `vite build` to produce the production bundle under `dist/`. The artifact is ephemeral inside the runner — this job acts as a smoke test that the project compiles end-to-end.

### Skipping a run

To push a change to `main` without triggering CI (e.g. updating non-code files like images or a CODEOWNERS tweak), append GitHub's standard `[skip ci]` marker to the commit message:

```bash
git commit -m "docs: tweak README screenshot [skip ci]"
```

### Where the outputs live

| Output                                    | Location                                  |
| ----------------------------------------- | ----------------------------------------- |
| Validation logs (lint, type-check, tests) | **Actions** tab on GitHub                 |
| Production bundle (`dist/`)               | Ephemeral, inside the runner              |
| Coverage report (local only)              | `coverage/` after `npm run test:coverage` |

### Running the same checks locally

```bash
# lint-and-audit
npm run lint
npm run type-check

# testing
npm run test

# build
npm run build
```

## Security Audit

Beyond functional tests, the project ships with tooling to audit dependencies and overall code health.

### npm audit

Check for vulnerabilities in dependencies:

```bash
npm audit
```

### React Doctor

Run a health check on the project (security, performance, dead code, architecture):

```bash
npm run doctor
```

Use `--verbose` to see specific files and line numbers:

```bash
npm run doctor -- --verbose
```

## Known Issues

None at the moment.

## Portfolio Link

[`https://www.diegolibonati.com.ar/#/project/free-games`](https://www.diegolibonati.com.ar/#/project/free-games)
