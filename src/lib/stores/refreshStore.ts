import { writable } from 'svelte/store';
import { invalidateAll } from '$app/navigation';
import { browser } from '$app/environment';

// State
export const isRefreshing = writable(false);
export const isDataLoading = writable(false);
export const lastUpdate = writable(new Date());

// Actions
export const refreshActions = {
	async handleManualRefresh() {
		// Only run in browser
		if (!browser) return;
		
		try {
			isRefreshing.set(true);
			isDataLoading.set(true);
			
			// Force refresh the page data
			await invalidateAll();
			lastUpdate.set(new Date());
		} catch (error) {
			console.error('Refresh error:', error);
		} finally {
			isRefreshing.set(false);
			// Note: isDataLoading is cleared in the page component when data arrives
		}
	},

	startAutoRefresh(intervalSeconds: number = 60): ReturnType<typeof setInterval> {
		// Only run in browser
		if (!browser) return null as any;
		
		// Update last update time initially
		lastUpdate.set(new Date());
		
		return setInterval(async () => {
			try {
				isDataLoading.set(true);
				await invalidateAll();
				lastUpdate.set(new Date());
			} catch (error) {
				console.error('Auto refresh error:', error);
			}
			// Note: isDataLoading is cleared in the page component when data arrives
		}, intervalSeconds * 1000);
	},

	stopAutoRefresh(intervalId: ReturnType<typeof setInterval>) {
		if (intervalId && browser) {
			clearInterval(intervalId);
		}
	},

	clearDataLoading() {
		isDataLoading.set(false);
	}
};
