# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Build in this order: data tier, then logic tier, then presentation tier. The schemas and seed data are the contract that the APIs and UI must honor.

- Presentation tier decision: wire `App.tsx` and the four capability pages (activities, teams, leaderboard, workouts) to the shared API client using relative `/api` paths only; each page shows a loading state, the data list, a meaningful empty state, and an error message with `role="alert"` when the API fails.
- Logic tier decision: implement the Express routes with deliberate validation; invalid or malformed input returns `400/404/4xx`, never `501` or a `500` from a cast error; keep ranking and suggestion logic in small service functions.
- Data tier decision: add required-field validation to the `User`, `Team`, `Activity`, and `Workout` Mongoose schemas and keep representative seed data in `seed.ts`.
- Activity tracking approach: `POST /api/activities` validates that `userId` and `teamId` are well-formed IDs of an existing user and team, then stores `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`.
- Team management approach: `POST /api/teams` stores `name` and `mascot` and rejects a missing name with `400`; `GET /api/teams` returns teams with members.
- Leaderboard approach: sum activity points per team, sort highest first, return `teamName`, `totalPoints`, and a 1-based `rank`.
- Workout suggestions approach: look up the user by email (`404` if not found), check their goal and recent activity pattern, and return suggestions whose first `focus` matches, each with a `reason`.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — baseline result: `1 passed, 4 failed`; this means the required-field validation is missing on `User`, `Team`, `Activity`, and `Workout` schemas.
- API command: `npm run test:api --prefix octofit-tracker/backend` — baseline result: `4 failed`; this means invalid submissions return `501` instead of `4xx`, the leaderboard is empty, workout suggestions pick the wrong focus, and unknown users are not handled correctly.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — baseline result: `15 failed`; this means every route still shows the placeholder "Implementation pending" state instead of data, empty-state handling, or an accessible alert on API failure.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — goal: compile the backend with no TypeScript errors.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — goal: compile the frontend with no TypeScript or Vite build errors.
