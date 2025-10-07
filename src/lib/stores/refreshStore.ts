import { writable, get } from 'svelte/store';
import { invalidateAll } from '$app/navigation';
import { browser } from '$app/environment';

// State
export const isRefreshing = writable(false);
export const isDataLoading = writable(false);
export const lastUpdate = writable(new Date());
export const refreshError = writable<string | null>(null);

// Actions
export const refreshActions = {
	async handleManualRefresh() {
		if (!browser) return;
		
		// Prevent concurrent refreshes
		if (get(isRefreshing)) {
			console.log('Refresh already in progress');
			return;
		}
		
		try {
			isRefreshing.set(true);
			isDataLoading.set(true);
			refreshError.set(null);
			
			await invalidateAll();
			lastUpdate.set(new Date());
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown refresh error';
			console.error('Refresh error:', error);
			refreshError.set(errorMessage);
			throw error;
		} finally {
			isRefreshing.set(false);
		}
	},

	startAutoRefresh(intervalSeconds: number = 60): ReturnType<typeof setInterval> | null {
		if (!browser) return null;
		
		if (intervalSeconds < 10) {
			console.warn('Auto-refresh interval too short, setting to 10 seconds minimum');
			intervalSeconds = 10;
		}
		
		lastUpdate.set(new Date());
		
		const intervalId = setInterval(async () => {
			// Skip if manual refresh is in progress
			if (get(isRefreshing)) {
				console.log('Skipping auto-refresh: manual refresh in progress');
				return;
			}
			
			try {
				isDataLoading.set(true);
				refreshError.set(null);
				await invalidateAll();
				lastUpdate.set(new Date());
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Auto-refresh error';
				console.error('Auto refresh error:', error);
				refreshError.set(errorMessage);
			}
		}, intervalSeconds * 1000);
		
		return intervalId;
	},

	stopAutoRefresh(intervalId: ReturnType<typeof setInterval> | null) {
		if (intervalId && browser) {
			try {
				clearInterval(intervalId);
			} catch (error) {
				console.error('Error stopping auto-refresh:', error);
			}
		}
	},

	clearDataLoading() {
		isDataLoading.set(false);
	},

	clearError() {
		refreshError.set(null);
	}
};
