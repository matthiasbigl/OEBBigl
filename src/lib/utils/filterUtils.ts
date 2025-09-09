import type { Departure } from '$lib/server/hafas';

/**
 * Filter departures based on active transport type filters
 */
export const filterDepartures = (
	departures: Departure[], 
	activeFilters: Set<string>
): Departure[] => {
	if (activeFilters.size === 0) return departures;
	
	return departures.filter(departure => {
		const productType = departure.line?.product?.toLowerCase();
		return productType && activeFilters.has(productType);
	});
};

/**
 * Toggle a filter in the active filters set
 */
export const toggleFilter = (
	activeFilters: Set<string>, 
	product: string
): Set<string> => {
	const newFilters = new Set(activeFilters);
	const productLower = product.toLowerCase();
	
	if (newFilters.has(productLower)) {
		newFilters.delete(productLower);
	} else {
		newFilters.add(productLower);
	}
	
	return newFilters;
};

/**
 * Clear all active filters
 */
export const clearAllFilters = (): Set<string> => new Set();

/**
 * Check if any filters are active
 */
export const hasActiveFilters = (activeFilters: Set<string>): boolean => 
	activeFilters.size > 0;
