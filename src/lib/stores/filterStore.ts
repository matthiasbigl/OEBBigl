import { writable, derived } from 'svelte/store';
import type { Departure } from '$lib/server/hafas';

// State
export const activeFilters = writable<Set<string>>(new Set());
export const activePlatformFilters = writable<Set<string>>(new Set());
// Use a Map for departures for more efficient updates
export const departures = writable<Map<string, Departure>>(new Map());

// Derived store for filtered departures
export const filteredDepartures = derived(
	[departures, activeFilters, activePlatformFilters],
	([$departures, $activeFilters, $activePlatformFilters]) => {
		const departureList = Array.from($departures.values());

		// Filter by product type first
		let filtered = departureList;
		if ($activeFilters.size > 0) {
			filtered = filtered.filter(departure => {
				if (!departure.line?.product) {
					return false;
				}
				
				const productType = departure.line.product.toLowerCase();
				return $activeFilters.has(productType);
			});
		}

		// Then filter by platform
		if ($activePlatformFilters.size > 0) {
			filtered = filtered.filter(departure => {
				if (!departure.platform) {
					return false;
				}
				return $activePlatformFilters.has(departure.platform);
			});
		}

		return filtered;
	}
);

// Derived store for available platforms
export const availablePlatforms = derived(
	departures,
	($departures) => {
		const platforms = new Set<string>();
		Array.from($departures.values()).forEach(departure => {
			if (departure.platform && departure.platform !== 'TBA') {
				platforms.add(departure.platform);
			}
		});
		return Array.from(platforms).sort((a, b) => {
			// Sort platforms numerically if they're numbers, otherwise alphabetically
			const aNum = parseInt(a);
			const bNum = parseInt(b);
			if (!isNaN(aNum) && !isNaN(bNum)) {
				return aNum - bNum;
			}
			return a.localeCompare(b);
		});
	}
);

// Shared derived stores to prevent duplicate computations
export const totalActiveFilters = derived(
	[activeFilters, activePlatformFilters],
	([$activeFilters, $activePlatformFilters]) => $activeFilters.size + $activePlatformFilters.size
);

export const hasActiveFilters = derived(
	totalActiveFilters,
	($totalActiveFilters) => $totalActiveFilters > 0
);

// Actions
export const filterActions = {
	handleToggleFilter(productType: string) {
		activeFilters.update(filters => {
			const newFilters = new Set(filters);
			const productLower = productType.toLowerCase();
			if (newFilters.has(productLower)) {
				newFilters.delete(productLower);
			} else {
				newFilters.add(productLower);
			}
			return newFilters;
		});
	},

	handleClearFilters() {
		activeFilters.set(new Set());
		activePlatformFilters.set(new Set());
	},

	handleTogglePlatformFilter(platform: string) {
		activePlatformFilters.update(filters => {
			const newFilters = new Set(filters);
			if (newFilters.has(platform)) {
				newFilters.delete(platform);
			} else {
				newFilters.add(platform);
			}
			return newFilters;
		});
	},

	handleClearPlatformFilters() {
		activePlatformFilters.set(new Set());
	},

	setDepartures(newDepartures: Departure[]) {
		departures.update(() => {
			const newMap = new Map<string, Departure>();
			for (const dep of newDepartures) {
				newMap.set(dep.tripId, dep);
			}
			return newMap;
		});
	},

	addDepartures(newDepartures: Departure[]) {
		departures.update(map => {
			for (const dep of newDepartures) {
				map.set(dep.tripId, dep);
			}
			return map;
		});
	}
};
