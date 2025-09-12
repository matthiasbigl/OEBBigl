import { writable } from 'svelte/store';
import { goto, invalidateAll } from '$app/navigation';
import { browser } from '$app/environment';
import { isDataLoading } from './refreshStore';
import type { Station } from '$lib/server/hafas';

// Constants
const STORAGE_KEY = 'cyber-station-last-visited';
const SEARCH_DEBOUNCE_MS = 300;

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

// Autocomplete state
export const searchSuggestions = writable<Station[]>([]);
export const isLoadingSuggestions = writable(false);
export const showSuggestions = writable(false);
export const selectedSuggestionIndex = writable(-1);

// Debounce timer
let searchTimeout: NodeJS.Timeout;

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
			
			// Clear suggestions
			this.clearSuggestions();
			
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

	// Search for station suggestions with debouncing
	async searchSuggestions(query: string) {
		if (!browser) return;
		
		// Clear existing timeout
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}
		
		// If query is too short, clear suggestions
		if (!query || query.trim().length < 2) {
			this.clearSuggestions();
			return;
		}
		
		// Set loading state
		isLoadingSuggestions.set(true);
		
		// Debounce the search
		searchTimeout = setTimeout(async () => {
			try {
				const response = await fetch(`/api/stations?q=${encodeURIComponent(query.trim())}`);
				const data = await response.json();
				
				if (data.stations) {
					searchSuggestions.set(data.stations);
					showSuggestions.set(data.stations.length > 0);
					selectedSuggestionIndex.set(-1);
				}
			} catch (error) {
				console.error('Suggestion search error:', error);
				this.clearSuggestions();
			} finally {
				isLoadingSuggestions.set(false);
			}
		}, SEARCH_DEBOUNCE_MS);
	},

	// Clear suggestions
	clearSuggestions() {
		searchSuggestions.set([]);
		showSuggestions.set(false);
		selectedSuggestionIndex.set(-1);
		isLoadingSuggestions.set(false);
	},

	// Handle keyboard navigation
	handleKeyNavigation(event: KeyboardEvent, currentSuggestions: Station[]) {
		if (!browser) return false;
		
		let currentIndex = -1;
		selectedSuggestionIndex.subscribe(value => currentIndex = value)();
		
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				const nextIndex = currentIndex < currentSuggestions.length - 1 ? currentIndex + 1 : 0;
				selectedSuggestionIndex.set(nextIndex);
				return true;
				
			case 'ArrowUp':
				event.preventDefault();
				const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentSuggestions.length - 1;
				selectedSuggestionIndex.set(prevIndex);
				return true;
				
			case 'Enter':
				if (currentIndex >= 0 && currentSuggestions[currentIndex]) {
					event.preventDefault();
					this.handleStationSearch(currentSuggestions[currentIndex].name);
					return true;
				}
				return false;
				
			case 'Escape':
				this.clearSuggestions();
				return true;
				
			default:
				return false;
		}
	},

	// Select a suggestion
	selectSuggestion(station: Station) {
		if (!browser) return;
		this.handleStationSearch(station.name);
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
