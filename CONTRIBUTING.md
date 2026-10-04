# Contributing to ClearView

Thank you for considering a contribution. This guide describes how to set up the project and the quality checks every change must pass.

## Requirements

- Node.js 20 or newer (see `.nvmrc`)
- npm 10 or newer

## Setup

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:5173`.

## Available scripts

| Script                 | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `npm run dev`          | Starts the Vite development server                       |
| `npm run build`        | Type checks and builds the production bundle             |
| `npm run preview`      | Serves the production bundle locally                     |
| `npm test`             | Runs the unit test suite once                            |
| `npm run test:watch`   | Runs the unit tests in watch mode                        |
| `npm run typecheck`    | Runs the TypeScript compiler without emitting files      |
| `npm run lint`         | Runs ESLint and fails on any warning                     |
| `npm run lint:fix`     | Runs ESLint and applies automatic fixes                  |
| `npm run format`       | Formats every file with Prettier                         |
| `npm run format:check` | Verifies formatting without writing changes              |
| `npm run validate`     | Runs formatting, lint, type check and tests sequentially |

Run `npm run validate` before opening a pull request. It mirrors the CI pipeline.

## Code style

- Formatting is handled by Prettier. Do not format code by hand.
- ESLint enforces TypeScript, React Hooks and accessibility (`jsx-a11y`) rules.
- Keep files small and focused. Prefer a new component, hook or service over growing an existing file.
- Write comments only where the code is not self explanatory.
- User facing text must go through the i18n dictionaries in `src/i18n/locales`. Keep `pt` and `en` in parity.
- Do not use em dashes or emojis in code, UI strings or documentation.

## Editor setup

The repository ships VS Code settings in `.vscode/`. Install the recommended extensions (ESLint, Prettier and EditorConfig) to get format on save and automatic lint fixes.

## Continuous integration

Every push and pull request to `main` runs the following jobs in GitHub Actions:

1. **Lint and format**: `npm run format:check` and `npm run lint`
2. **Type check**: `npm run typecheck`
3. **Unit tests**: `npm test`
4. **Production build**: runs only after the three jobs above succeed and uploads `dist` as an artifact

## Pull requests

- Keep each pull request focused on a single change.
- Add or update tests for any behavior you change.
- Describe what changed and why in the pull request description.
