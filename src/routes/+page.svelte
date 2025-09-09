<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { invalidateAll } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import StationSearch from '$lib/components/search/StationSearch.svelte';
	import StationInfo from '$lib/components/station/StationInfo.svelte';
	import DeparturesList from '$lib/components/departures/DeparturesList.svelte';
	import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import { filterDepartures, toggleFilter, clearAllFilters } from '$lib/utils/filterUtils';
	
	export let data: PageData;
	
	// Constants
	const AUTO_REFRESH_INTERVAL_SECONDS = 60;
	const AUTO_REFRESH_INTERVAL_MS = AUTO_REFRESH_INTERVAL_SECONDS * 1000;
	
	// Filter state
	let activeFilters: Set<string> = new Set();
	
	// Loading states
	let isSearching = false;
	
	// Auto-refresh state
	let refreshInterval: NodeJS.Timeout|null;
	let isRefreshing = false;
	let lastUpdate = new Date();
	
	// Reactive filtered departures
	$: filteredDepartures = filterDepartures(data.departures || [], activeFilters);
	
	// Auto-refresh functionality
	onMount(() => {
		// Only start auto-refresh if we have a station
		if (data.station) {
			startAutoRefresh();
		}
	});
	
	onDestroy(() => {
		if (refreshInterval) {
			clearInterval(refreshInterval);
		}
	});
	
	function startAutoRefresh() {
		// Clear any existing interval
		if (refreshInterval) {
			clearInterval(refreshInterval);
		}
		
		// Set up 60-second refresh interval
		refreshInterval = setInterval(async () => {
			if (data.station && !isRefreshing) {
				isRefreshing = true;
				try {
					await invalidateAll();
					lastUpdate = new Date();
				} catch (error) {
					console.error('Auto-refresh failed:', error);
				} finally {
					isRefreshing = false;
				}
			}
		}, AUTO_REFRESH_INTERVAL_MS);
	}
	
	function stopAutoRefresh() {
		if (refreshInterval) {
			clearInterval(refreshInterval);
			refreshInterval = null;
		}
	}
	
	// Event handlers
	const handleToggleFilter = (product: string) => {
		activeFilters = toggleFilter(activeFilters, product);
	};
	
	const handleClearFilters = () => {
		activeFilters = clearAllFilters();
	};
	
	const handleStationSearch = async (station: string) => {
		stopAutoRefresh(); // Stop current refresh
		isSearching = true;
		try {
			await goto(`/?station=${encodeURIComponent(station)}`);
		} finally {
			isSearching = false;
		}
		// Note: Auto-refresh will restart automatically via the reactive statement
	};	// Manual refresh function
	const handleManualRefresh = async () => {
		if (!isRefreshing && data.station) {
			isRefreshing = true;
			try {
				await invalidateAll();
				lastUpdate = new Date();
			} catch (error) {
				console.error('Manual refresh failed:', error);
			} finally {
				isRefreshing = false;
			}
		}
	};
	
	// Watch for data changes to restart auto-refresh
	$: {
		if (data.station) {
			// Only start auto-refresh if not already running
			if (!refreshInterval) {
				startAutoRefresh();
			}
			// Update timestamp when we get new data (not just when station changes)
			if (data.departures) {
				lastUpdate = new Date();
			}
		} else {
			stopAutoRefresh();
		}
	}
</script>

<svelte:head>
	<title>🚄 Cyber Bahnhof Monitor</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
	<!-- Animated grid background -->
	<div class="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
	
	<div class="relative z-10 container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="text-6xl font-bold text-yellow-400 mb-4 font-mono tracking-wider">
				Train Departure Monitor
			</h1>
			<div class="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto rounded-full"></div>
		</div>

		<!-- Station Search -->
		<StationSearch 
			stationName={data.station} 
			onSearch={handleStationSearch} 
		/>

		<!-- Station Info with Filters -->
		{#if data.location}
			<div class="max-w-4xl mx-auto mb-8">
				<div class="bg-slate-800/30 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
					<!-- Station Header with Auto-refresh Status -->
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-2xl font-bold text-cyan-400 font-mono">&gt; STATION: {data.location.name}</h2>
						<div class="flex items-center gap-3">
							<!-- Manual Refresh Button -->
							<button 
								on:click={handleManualRefresh}
								disabled={isRefreshing}
								class="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-600 text-white text-xs font-bold rounded-lg transition-all duration-300 font-mono cursor-pointer hover:cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
								title="Manual refresh"
							>
								{#if isRefreshing}
									<LoadingSpinner size="sm" color="white" />
									UPDATING...
								{:else}
									🔄 REFRESH
								{/if}
							</button>
							
							<!-- Auto-refresh Status -->
							<div class="text-xs font-mono">
								<div class="flex items-center gap-1 text-cyan-300">
									<div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
									AUTO-REFRESH: ON
								</div>
								<div class="text-cyan-400/70 text-[10px]">
									Last: {lastUpdate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
								</div>
							</div>
						</div>
					</div>
					
					<StationInfo 
						station={data.location} 
						{activeFilters}
						onToggleFilter={handleToggleFilter}
						onClearFilters={handleClearFilters}
					/>
				</div>
			</div>
		{/if}

		<!-- Error Message -->
		{#if data.error}
			<ErrorMessage error={data.error} />
		{/if}

		<!-- Departures List -->
		<DeparturesList 
			departures={filteredDepartures}
			totalDepartures={data.departures?.length || 0}
			{activeFilters}
			onClearFilters={handleClearFilters}
		/>
		
		<!-- Loading Overlay for Station Search -->
		{#if isSearching}
			<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
				<div class="bg-slate-800/90 border border-cyan-500/30 rounded-lg p-8 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
					<LoadingSpinner size="lg" color="cyan" text="LOADING STATION DATA..." />
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
	
	:global(body) {
		font-family: 'JetBrains Mono', monospace;
	}
</style>
