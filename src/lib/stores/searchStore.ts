import { writable } from 'svelte/store';
import { goto, invalidateAll } from '$app/navigation';
import { browser } from '$app/environment';
import { isDataLoading } from './refreshStore';

// Constants
const STORAGE_KEY = 'cyber-station-last-visited';

// Helper functions for localStorage
const getStoredStation = (): string => {
	if (!browser) return '';
	try {
		return localStorage.getItem(STORAGE_KEY) || '';
	} catch {
		return '';
	}
};

const setStoredStation = (station: string): void => {
	if (!browser) return;
	try {
		if (station.trim()) {
			localStorage.setItem(STORAGE_KEY, station.trim());
		}
	} catch {
		// Ignore localStorage errors
	}
};

// State
export const isSearching = writable(false);
export const currentStation = writable<string>(getStoredStation());

// Actions
export const searchActions = {
	async handleStationSearch(stationName: string) {
		// Only run in browser
		if (!browser || !stationName?.trim()) return;
		
		try {
			isSearching.set(true);
			isDataLoading.set(true);
			
			const trimmedStation = stationName.trim();
			
			// Update current station and store in localStorage
			currentStation.set(trimmedStation);
			setStoredStation(trimmedStation);
			
			// Navigate to the new station
			await goto(`/?station=${encodeURIComponent(trimmedStation)}`, {
				invalidateAll: true
			});
		} catch (error) {
			console.error('Search error:', error);
		} finally {
			isSearching.set(false);
			// Note: isDataLoading is cleared in the page component when data arrives
		}
	},

	// Helper to update current station without navigation (for initial load)
	setCurrentStation(stationName: string) {
		if (!browser) return;
		
		const trimmedStation = stationName.trim();
		currentStation.set(trimmedStation);
		setStoredStation(trimmedStation);
	},

	// Helper to get the last visited station
	getLastVisitedStation(): string {
		return getStoredStation();
	},

	// Helper to clear stored station
	clearStoredStation() {
		if (!browser) return;
		try {
			localStorage.removeItem(STORAGE_KEY);
			currentStation.set('');
		} catch {
			// Ignore localStorage errors
		}
	}
};
