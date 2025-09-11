import { writable, derived } from 'svelte/store';
import type { Departure } from '$lib/server/hafas';

// State
export const activeFilters = writable<Set<string>>(new Set());
// Use a Map for departures for more efficient updates
export const departures = writable<Map<string, Departure>>(new Map());

// Derived store for filtered departures
export const filteredDepartures = derived(
	[departures, activeFilters],
	([$departures, $activeFilters]) => {
		const departureList = Array.from($departures.values());

		// Always return all departures if no filters are active
		if ($activeFilters.size === 0) {
			return departureList;
		}

		// Filter departures based on active filters
		return departureList.filter(departure => {
			if (!departure.line?.product) {
				return false;
			}
			
			const productType = departure.line.product.toLowerCase();
			return $activeFilters.has(productType);
		});
	}
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
