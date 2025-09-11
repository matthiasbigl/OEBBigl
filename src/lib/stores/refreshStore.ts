import { writable } from 'svelte/store';
import { invalidateAll } from '$app/navigation';
import { browser } from '$app/environment';

// State
export const isRefreshing = writable(false);
export const lastUpdate = writable(new Date());

// Actions
export const refreshActions = {
	async handleManualRefresh() {
		// Only run in browser
		if (!browser) return;
		
		try {
			isRefreshing.set(true);
			
			// Force refresh the page data
			await invalidateAll();
			lastUpdate.set(new Date());
		} catch (error) {
			console.error('Refresh error:', error);
		} finally {
			isRefreshing.set(false);
		}
	},

	startAutoRefresh(intervalSeconds: number = 60): ReturnType<typeof setInterval> {
		// Only run in browser
		if (!browser) return null as any;
		
		// Update last update time initially
		lastUpdate.set(new Date());
		
		return setInterval(async () => {
			try {
				await invalidateAll();
				lastUpdate.set(new Date());
			} catch (error) {
				console.error('Auto refresh error:', error);
			}
		}, intervalSeconds * 1000);
	},

	stopAutoRefresh(intervalId: ReturnType<typeof setInterval>) {
		if (intervalId && browser) {
			clearInterval(intervalId);
		}
	}
};
