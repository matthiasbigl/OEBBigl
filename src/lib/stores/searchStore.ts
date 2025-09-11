import { writable } from 'svelte/store';
import { goto, invalidateAll } from '$app/navigation';
import { browser } from '$app/environment';

// State
export const isSearching = writable(false);

// Actions
export const searchActions = {
	async handleStationSearch(stationName: string) {
		// Only run in browser
		if (!browser || !stationName?.trim()) return;
		
		try {
			isSearching.set(true);
			
			// Navigate to the new station
			await goto(`/?station=${encodeURIComponent(stationName.trim())}`, {
				invalidateAll: true
			});
		} catch (error) {
			console.error('Search error:', error);
		} finally {
			isSearching.set(false);
		}
	}
};
