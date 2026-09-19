# React Code Base

Minimal React 19 + TypeScript + Vite starter. It ships only the plumbing every project needs and no product code: HTTP client with token refresh, router with an auth guard, persisted user state, i18n (EN/VI), theming, toasts, tests, CI, commit hooks and a module generator.

**No authentication screens are included.** Every backend signs users in differently, so the base gives you the wiring and leaves the contract to you.

## Requirements

- Node `22+` (see `.nvmrc`)
- Yarn `1.22+`
- Git `2.32+` (required by lint-staged)

## Quick start

```bash
nvm use
yarn install
cp .env.example .env   # VITE_API_URL must include http:// or https://
yarn dev
```

## Starting a new project

1. Clone, then point the remote at your new repository.
2. Rename the project in `package.json` and the `<title>` in `index.html`.
3. Set your palette in `src/constants/colors.ts` and tokens in `src/styled/theme.ts`.
4. Point `src/constants/auth.ts` at your backend's refresh endpoint.
5. Adjust `src/interfaces/user.interface.ts` to your user shape.
6. Add routes in `src/router/routes/` and pages under `src/modules/`.
7. Scaffold features with `yarn generate:module`.

## Environment variables

| Variable        | Required | Description                                        |
| --------------- | -------- | -------------------------------------------------- |
| `VITE_PORT`     | no       | Dev server port. Defaults to `3000`.               |
| `VITE_API_URL`  | yes      | Backend base URL, including scheme.                |
| `VITE_ENV`      | yes      | `DEVELOP`, `STAGING` or `PRODUCTION`.              |
| `VITE_LANGUAGE` | no       | Initial language (`en` or `vi`). Defaults to `en`. |

Env vars are validated with zod at boot in `src/constants/env.ts`. Restart `yarn dev` after editing `.env`.

## Scripts

| Script                 | Description                              |
| ---------------------- | ---------------------------------------- |
| `yarn dev`             | Start dev server                         |
| `yarn build`           | Typecheck and build to `build/`          |
| `yarn preview`         | Preview the production build             |
| `yarn lint`            | ESLint                                   |
| `yarn format`          | Prettier                                 |
| `yarn typecheck`       | `tsc --noEmit`                           |
| `yarn test`            | Vitest in watch mode                     |
| `yarn test:run`        | Vitest once (used in CI)                 |
| `yarn generate:module` | Scaffold api + query + page for a module |

## Project structure

```
src/
  api/            axios instance (401 refresh), typed service wrapper
  assets/         global css
  components/
    common/       AppButton, AppInput, AppLoader, AppRoute (guard), NotFound, ...
    layouts/      RootLayout (providers), AppLayout, AuthLayout
  constants/      env, routes, colors, auth paths, query client
  hooks/          useAppToast, useDebounce, useLanguage, useAuthLogoutListener
  interfaces/     shared API/user shapes
  react-query/    generated query hooks
  redux/          store, persist, user slice
  router/         AppRouter + route groups
  styled/         theme
  translations/   i18n setup, en/vi resources
  types/          shared TS types
  utils/          lazyImport, getAPIErrorMsg
```

## Routing

`src/router/AppRouter.tsx` mounts `RootLayout` (providers, toasts, logout listener) and two route groups:

- `authRoutes` render inside `AuthLayout`. Signed-in users are redirected to `/`.
- `appRoutes` render inside `AppLayout`. Wrap children in `<AppRoute />` to require a signed-in user.

Route paths live in `src/constants/routes.ts`. Lazy-load pages with `lazyImport` from `@/utils`:

```tsx
const { Home } = lazyImport(() => import('@/modules/home'), 'Home');
```

## Auth plumbing

Included:

- `apiClient` sends cookies (`withCredentials: true`) and retries once after a `401` by calling `AUTH_REFRESH_PATH`. Requests under `AUTH_PATH_PREFIX` are never retried.
- When refresh fails, an `AUTH_LOGOUT_EVENT` is dispatched. `useAuthLogoutListener` clears the user and navigates to `/sign-in`.
- `useReduxUser()` exposes `user`, `setUserInfo` and `resetUserInfo`. The user is persisted to `localStorage`.
- `AppRoute` redirects to `/sign-in` when no user exists in Redux.

You write: the sign-in page (call your API, then `setUserInfo(user)`), and register it under `authRoutes`.

## HTTP layer

Use `axiosService` from `@/api`. It returns `IAppResponse<T>` and unwraps `res.data`. A `lang` query param is added to every request from the current i18n language.

## State and data fetching

- Server state: TanStack Query. Default options in `src/constants/queryClient.ts`.
- Client state: Redux Toolkit + redux-persist. Add slices in `src/redux/`.

## i18n

`react-i18next` with `en` and `vi` resources in `src/translations/`. `useLanguage()` and `LanguageSwitcher` switch languages. The chosen language is stored in `localStorage`.

## Toasts

`useAppToast()` returns `showAppToast`, `showServerSuccessMsg` and `showServerErrorMsg`. Errors are parsed by `getAPIErrorMsg` and `401` is ignored.

## Forms

`react-hook-form` with `zod` via `@hookform/resolvers`. Validation messages live in `src/translations/*/validation.json`.

## Code generation

```bash
yarn generate:module   # prompts for a kebab-case name
```

Creates `src/api/<name>/`, `src/react-query/<name>/` and `src/modules/<name>/pages/`, and appends barrel exports.

## Quality

- **Lint / format:** ESLint + Prettier, run on staged files by husky `pre-commit` together with `yarn typecheck`.
- **Commits:** Conventional Commits enforced by commitlint.
- **Tests:** Vitest + Testing Library, `jsdom` environment.
- **CI:** `.github/workflows/ci.yml` runs lint, typecheck, test and build on push and PR.

## Backend contract

Responses are expected to follow:

```ts
interface IAppResponse<T> {
  data?: T;
  success: boolean;
  code: number;
  message?: string;
}
```

Validation errors may be returned as `errors: string | Record<string, string | string[]>`.

## Troubleshooting

- **Requests go to `localhost:3000/api/...`:** `VITE_API_URL` is missing its scheme.
- **CORS error with credentials:** the backend must return a concrete `Access-Control-Allow-Origin`, not `*`.
- **Signed-in user bounces to `/sign-in`:** make sure the sign-in handler calls `setUserInfo`.
- **Pre-commit hook fails:** upgrade Git to `2.32+`.
