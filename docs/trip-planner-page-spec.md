# Trip Planner Page Specification

Version: 2025-10-07
Author: GitHub Copilot (AI dev partner)

## 1. Purpose & Scope

Create a new **Trip Planner** experience that mirrors the current "Cyber Station" aesthetic while enabling users to plan a journey between two stations (origin → destination) with optional date/time control and product filtering. The page must:

- Live at `/journeys` with its own `+page.svelte` and `+page.server.ts`.
- Reuse existing UI primitives (buttons, collapsible panels, spinners) to maintain visual cohesion.
- Share the animation system (`createPageAnimations`, `collapsibleAnimations`, etc.).
- Integrate with HAFAS journeys API via a new server helper (`getJourneys`).
- Provide paginated and filterable journey results, including transfer legs.

## 2. User Stories

1. **Plan a trip** – As a rider, I can enter a "FROM" and "TO" station, choose departure/arrival preferences, and retrieve journey options.
2. **Inspect journey details** – I can expand a journey to see legs (line, platform, transfer time) styled with the retro terminal design.
3. **Adjust filters** – I can toggle transport products (rail, bus, etc.) and optionally limit transfers or max duration.
4. **Refresh data** – I can manually refresh to fetch the latest journeys, and auto-refresh keeps results up-to-date every 60 seconds.
5. **Handle errors gracefully** – Invalid searches, zero results, and backend failures present themed messaging.

## 3. Page Layout & Sections

Replicate the structural stacking from `src/routes/+page.svelte`:

1. **Hero Header** – Reuse existing header markup/styles (`CYBER STATION` title). Update subtitle to `REALTIME JOURNEY MATRIX`.
2. **Search Panel** – New `CollapsibleJourneySearchSection` derived from `CollapsibleSearchSection`.
   - Contains a two-column form on desktop, stacked on mobile.
   - Fields: `FROM`, `TO`, `Date`, `Time`, `Search type` toggle (depart at / arrive by), and inline `Button` labelled `CALCULATE.ROUTE`.
   - Provide swap origin/destination button.
3. **Journey Metadata Panel** – Mirror `CollapsibleStationInfo` but focused on journey query summary.
   - Show selected filters, timestamp, auto-refresh indicator, and quick filter chips (e.g., `MAX 1 TRANSFER`).
4. **Error Banner** – Reuse `ErrorMessage` for API failures or validation errors.
5. **Journey Results Section** – Styled container akin to departures list.
   - Header shows total journeys, active filter count, loading status.
   - Body renders list of `JourneyCard` items with collapsible leg details.
6. **Overlay** – When searching, reuse `LoadingSpinner` overlay pattern from existing page.

## 4. Component Reuse & New Components

| Component | Action | Notes |
|-----------|--------|-------|
| `ui/Button`, `ui/LoadingSpinner`, `ui/ErrorMessage`, `ui/SectionSeparator` | Reuse as-is | Maintain consistent styling. |
| `search/StationSuggestions` | Factor out to reusable suggestion controller | Wrap in new `StationSearchField` component. |
| `search/StationSearch` | Refactor into `StationSearchField` (shared) + legacy wrapper | Trip planner form will use two copies with independent state. |
| `search/CollapsibleSearchSection` | Extend into `CollapsibleJourneySearchSection` | Accepts slot for custom form; inherits animation logic. |
| `station/ProductFilter`, `station/PlatformFilter` | Reuse for journey-level filters | Placed inside metadata panel; platform filters renamed to `TransferFilter` if needed. |
| **New** `journeys/JourneySearchForm.svelte` | Build trip planner form | Implements from/to/time UI leveraging refactored inputs. |
| **New** `journeys/JourneyList.svelte` + `journeys/JourneyCard.svelte` | Create journey result views | Render summaries and leg details with staggered animations. |
| **New** `journeys/LegDetails.svelte` | Provide per-leg breakdown | Stepper layout for transfers, platforms, and timing. |
| **New Store** `stores/journeyStore.ts` | Manage journey state | Holds form state, loading flags, filters, debounce logic, and auto-refresh management. |

## 5. Server & API Layer

### 5.1 `lib/server/hafas.ts`

Add:

```ts
export interface JourneyLeg { /* ... */ }
export interface JourneyOption { /* ... */ }
export interface JourneySearchOptions { /* from, to, dateTime, arrival, products, transfers */ }
export interface JourneySearchResult { /* journeys, context, error */ }
```

Implement `getJourneys(fromQuery: string, toQuery: string, options: JourneySearchOptions, baseUrl?: string)`:

- Resolve origin/destination via `client.locations` (cache results for identical queries during request).
- Call `client.journeys({ from: stationA.id, to: stationB.id, departure: date, results, transfers, products, remarks: false, polylines: false })`.
- Normalize response into `JourneyOption[]` with per-leg information and high-level summaries (duration, transfers, departure/arrival times).
- Provide pagination tokens via HAFAS `journeysContext` (store `refreshToken` for next/prev).

### 5.2 API Route

Create `src/routes/api/journeys/+server.ts`:

- Accepts `from`, `to`, `when`, `isArrival`, `products`, `transfers`, `pageToken`.
- Validates inputs (return 400 with message on failure).
- Calls `getJourneys`, returns JSON payload with journeys, pagination context, metadata.
- Cache-control: `no-store`.

### 5.3 Page `load`

`src/routes/journeys/+page.server.ts`:

- Parses query params (mirroring API route).
- Calls `getJourneys` server-side to SSR initial data.
- Returns typed `PageData` with `journeys`, `query`, `metadata`, `error`.

## 6. State Management

- `journeyStore.ts` exports writable stores: `origin`, `destination`, `journeyOptions`, `journeyResults`, `isSearching`, `autoRefreshInterval`, `formErrors`.
- Actions:
  - `initializeFromData(PageData)` to hydrate from SSR data.
  - `handleJourneySearch(formValues)` to call `/journeys` route via `goto` (keeps URL a source of truth).
  - `swapStations()` to interchange origin/destination.
  - `updateProducts`, `updateTransfers` to maintain filter state.
  - `startAutoRefresh(intervalSeconds)` & `stopAutoRefresh` leveraging `refreshStore` utilities (consider exporting helper from `refreshStore`).

## 7. Data Contracts

### 7.1 JourneyOption (client-side)

```ts
interface JourneyOption {
  id: string; // unique hash (trip IDs + departure)
  departure: string; // ISO
  arrival: string;   // ISO
  durationMinutes: number;
  transfers: number;
  products: string[]; // aggregated
  legs: Array<{
    lineName: string;
    product: string;
    departure: string;
    departurePlatform?: string;
    arrival: string;
    arrivalPlatform?: string;
    direction: string;
  }>;
  remarks?: string[];
}
```

### 7.2 API Response

```json
{
  "journeys": JourneyOption[],
  "query": {
    "from": string,
    "to": string,
    "when": string,
    "isArrival": boolean,
    "products": string[],
    "maxTransfers": number | null
  },
  "pagination": {
    "hasNextPage": boolean,
    "hasPrevPage": boolean,
    "nextToken": string | null,
    "prevToken": string | null,
    "currentContext": string
  },
  "metadata": {
    "timestamp": string,
    "totalCount": number,
    "format": "journey-full"
  },
  "error": string | null
}
```

## 8. Validation & Error Handling

- Require `from` and `to` (non-empty, not identical).
- Validate `when` is ISO or fallback to `new Date()`.
- `maxTransfers` within 0–5.
- Limit results to ≤ 10 per request (HAFAS-friendly).
- If HAFAS returns `no journeys`, display themed empty state inside results container.
- Network errors use `ErrorMessage` with `error.code` when available.

## 9. Accessibility

- Each search input uses ARIA combobox pattern (reuse from `StationSearchField`).
- Swap button has `aria-label="Swap origin and destination"`.
- Journey results use `role="list"` / `role="listitem"` and keyboard accessible toggles for expanding legs.
- Ensure contrast meets existing theme (respect tailwind classes).

## 10. Animations & Performance

- Reuse `createPageAnimations` for page-level parallax.
- Copy collapsible animation hooks for search + metadata panels.
- Use `departureAnimations.entranceStagger` variant for journey cards. Provide new helper `journeyAnimations` if necessary but align with durations from `ANIMATION_GUIDE.md`.
- Debounce search interactions at 300ms (same as station search) to protect API calls.

## 11. Analytics & Logging

- Console log major lifecycle events in dev mode only (reuse pattern from `hafas.ts`).
- Wrap HAFAS errors with contextual info (`from`, `to`, `options`).

## 12. Implementation Checklist

1. Refactor `StationSearch` into reusable `StationSearchField` while keeping backwards compatibility for the existing departures page.
2. Scaffold `stores/journeyStore.ts` with state/actions.
3. Implement `getJourneys` in `lib/server/hafas.ts` plus related types.
4. Create `/api/journeys` endpoint and shared response schema.
5. Build `/journeys/+page.server.ts` to SSR initial data and handle query params.
6. Implement `/journeys/+page.svelte` replicating layout/animations.
7. Build journey-specific components (`JourneySearchForm`, `JourneyList`, `JourneyCard`, `LegDetails`).
8. Wire auto-refresh using `refreshActions` or wrapper methods.
9. Add unit/integration tests for `getJourneys` (mocking hafas client) and store logic.
10. Validate accessibility (keyboard navigation, aria labels).
11. Update root README with link to trip planner once page ships.

## 13. Open Questions

- Should trip planner support intermediate via stations? (Out of scope for MVP.)
- Do we need to persist recent journeys? (Consider follow-up iteration using localStorage.)
- Should we share `filterStore` for journey result filters or create dedicated store? (Current plan: dedicated `journeyStore` to avoid coupling.)
