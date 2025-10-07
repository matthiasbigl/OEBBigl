# Component Catalog

A quick reference of reusable UI building blocks in the Cyber Station interface. Each entry lists the component's intent, notable props, and relevant states to help with composing new views (e.g., the upcoming trip planner page).

## Search Module

- **`search/CollapsibleSearchSection.svelte`** – Collapsible wrapper for station search. Props: `stationName`, optional `isCollapsed`. Animates open/close using shared animation utilities.
- **`search/StationSearch.svelte`** – Single-station search form with terminal styling. Manages submission via `searchActions` and renders suggestions. Props: `stationName`.
- **`search/StationSuggestions.svelte`** – Suggestion dropdown fed by `searchStore` state. Uses shared animations for entrance, hover, and selection.

## Station Module

- **`station/CollapsibleStationInfo.svelte`** – Collapsible container for station metadata, manual refresh, and filter controls. Props: `station`, `onRefresh`, `isRefreshing`, `lastUpdate`, optional `isCollapsed`.
- **`station/StationInfo.svelte`** – Displays station metadata (products, IDs, etc.) with terminal-flavored layout.
- **`station/PlatformFilter.svelte`** – Toggles platform-specific filters via `filterStore`.
- **`station/ProductFilter.svelte`** – Toggles product filters (rail, bus, etc.) via `filterStore`.

## Departures Module

- **`departures/DeparturesList.svelte`** – Wrapper that reads `filteredDepartures` and renders cards with status headers and empty states. Prop: `totalDepartures`.
- **`departures/DepartureCard.svelte`** – Individual departure presentation with delay, platform, and product styling.

## Journeys Module

- **`journeys/CollapsibleJourneySearchSection.svelte`** – Journey-specific wrapper around the shared collapsible search shell. Provides purple-accented header and slot support for the planner form.
- **`journeys/JourneySearchForm.svelte`** – Two-station planner form powered by `journeyStore`. Handles swaps, arrival/depart toggles, and submits via client-side navigation.
- **`journeys/JourneySummaryPanel.svelte`** – Surface for route status, filters, and manual refresh. Uses `journeyStore` filter state and shares `ProductFilter` styling.
- **`journeys/JourneyList.svelte`** – Reads `filteredJourneys` to render cards, loading states, and pagination controls.
- **`journeys/JourneyCard.svelte`** – Detailed journey visualization with leg toggles, duration, product badges, and remark highlighting.

## UI Primitives

- **`ui/Button.svelte`** – Core button with variant theming (`primary`, `secondary`, `danger`, `filter`, `filter-active`, `platform`, `platform-active`). Exposes `onClick`, disabled state, and slots icon/text.
- **`ui/ErrorMessage.svelte`** – Visual treatment for request failures or validation errors.
- **`ui/LoadingSpinner.svelte`** – Spinner sizes (`sm`, `md`, `lg`) with configurable color.
- **`ui/SectionSeparator.svelte`** – Animated separator label for grouping content.

## Utilities

- Layout and page animations live in `src/lib/utils/animations.ts` and friends. Components above rely on these helpers for consistent transitions.

> Tip: Most interactive wrappers (collapsible panels, suggestion lists) already expose DOM refs for animation controllers. Favor extending existing logic before introducing new animation entry points.
