<script lang="ts">
	import type { PageData } from './$types';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import CollapsibleSearchSection from '$lib/components/search/CollapsibleSearchSection.svelte';
	import CollapsibleStationInfo from '$lib/components/station/CollapsibleStationInfo.svelte';
	import DeparturesList from '$lib/components/departures/DeparturesList.svelte';
	import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import { 
		isSearching, searchActions, currentStation, isDataLoading,
		isRefreshing, lastUpdate, refreshActions,
		activeFilters, activePlatformFilters, filteredDepartures, filterActions,
		totalActiveFilters, hasActiveFilters
	} from '$lib/stores';
	import { 
		createPageAnimations, 
		landingPageAnimations,
		type AnimationController
	} from '$lib/utils/animations';
	
	export let data: PageData;
	
	// Constants
	const AUTO_REFRESH_INTERVAL = 60; // seconds
	const DATA_LOADING_CLEAR_DELAY = 200; // ms
	
	// Component refs
	let pageContainer: HTMLElement;
	let headerRef: HTMLElement;
	let gridBackground: HTMLElement;
	let searchContainer: HTMLElement;
	let stationContainer: HTMLElement;
	let departuresContainer: HTMLElement;
	
	// Animation controller
	let pageAnimationController: AnimationController | null = null;
	
	// Auto-refresh interval ID
	let autoRefreshInterval: ReturnType<typeof setInterval> | null = null;
	
	// Reactive computed values - use shared stores to avoid duplicate computations
	$: filteredCount = $filteredDepartures.length;
	$: totalDepartures = data.departures?.length || 0;
	$: isFiltering = filteredCount !== totalDepartures;
	
	/**
	 * Handles initial station setup and localStorage management
	 */
	function handleInitialStationSetup(): boolean {
		if (!browser) return false;
		
		// If no station in URL but we have a stored station, redirect
		if (!data.station || data.station === '') {
			const lastVisited = searchActions.getLastVisitedStation();
			if (lastVisited) {
				searchActions.handleStationSearch(lastVisited);
				return true; // Indicates we're redirecting
			}
		} else {
			// Update stored station with current one
			searchActions.setCurrentStation(data.station);
		}
		return false;
	}
	
	/**
	 * Starts the auto-refresh functionality
	 */
	function startAutoRefresh(): void {
		if (browser) {
			autoRefreshInterval = refreshActions.startAutoRefresh(AUTO_REFRESH_INTERVAL);
		}
	}
	
	/**
	 * Handles data loading state clearing with delay
	 */
	function clearDataLoadingState(): void {
		if ($isDataLoading) {
			setTimeout(() => {
				refreshActions.clearDataLoading();
			}, DATA_LOADING_CLEAR_DELAY);
		}
	}
	
	/**
	 * Handles station change and filter clearing
	 */
	function handleStationChange(): void {
		// Clear filters when switching to a new station
		if (data.station !== $currentStation) {
			filterActions.handleClearFilters();
			// Update current station and store in localStorage
			if (browser && data.station) {
				searchActions.setCurrentStation(data.station);
			}
		}
	}
	
	onMount(() => {
		// Handle initial station setup and localStorage
		const isRedirecting = handleInitialStationSetup();
		if (isRedirecting) return; // Exit early since we're redirecting
		
		// Initialize departures in the filter store only if we have data
		if (data.departures) {
			filterActions.setDepartures(data.departures);
		}
		
		// Start auto-refresh functionality
		startAutoRefresh();
		
		// Initialize animations using our animation system
		if (browser && headerRef && searchContainer) {
			pageAnimationController = createPageAnimations({
				pageContainer,
				headerRef,
				gridBackground,
				searchContainer,
				stationContainer,
				departuresContainer
			});
			
			pageAnimationController.initialize();
		}
	});
	
	// Update departures when data changes
	$: if (data.departures) {
		filterActions.setDepartures(data.departures);
		clearDataLoadingState();
	}
	
	// Handle station changes separately to avoid unnecessary updates
	$: if (data.station && data.station !== $currentStation) {
		handleStationChange();
	}
	
	onDestroy(() => {
		// Stop auto-refresh
		if (autoRefreshInterval) {
			refreshActions.stopAutoRefresh(autoRefreshInterval);
		}
		
		// Cleanup animations using our animation system
		pageAnimationController?.cleanup();
	});
</script>

<svelte:head>
	<title>◾ CYBER STATION ◾</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
	<meta name="theme-color" content="#000000">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
</svelte:head>

<!-- Main Container with Retro-Futuristic Background -->
<div bind:this={pageContainer} class="min-h-screen bg-black text-gray-100 font-mono relative overflow-hidden">
	<!-- Animated Grid Background -->
	<div bind:this={gridBackground} class="fixed pointer-events-none" style="top: -100px; left: -100px; right: -100px; bottom: -100px; opacity: 0.2;">
		<div class="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
		<div class="absolute inset-0 bg-grid"></div>
	</div>
	
	<!-- Scanlines for CRT Effect -->
	<div class="scanline fixed w-full h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-20 pointer-events-none"></div>
	<div class="scanline fixed w-full h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-20 pointer-events-none" style="animation-delay: 0.5s;"></div>
	<div class="scanline fixed w-full h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-20 pointer-events-none" style="animation-delay: 1s;"></div>
	
	<!-- Noise Overlay -->
	<div class="fixed inset-0 pointer-events-none bg-noise"></div>
	
	<div class="relative z-10 min-h-screen flex flex-col">
		<!-- Header Section -->
		<header bind:this={headerRef} class="px-4 py-6 sm:px-6 lg:px-8">
			<div class="max-w-4xl mx-auto">
				<!-- Top Border Line -->
				<div class="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent mb-6"></div>
				
				<!-- Main Title -->
				<div class="text-center space-y-2">
					<h1 class="text-2xl sm:text-3xl lg:text-4xl font-title tracking-wider">
						
						<span class="mx-2 sm:mx-4 text-white">CYBER STATION</span>
						
					</h1>
					<div class="text-xs sm:text-sm text-gray-400 tracking-widest font-mono">
						REALTIME DEPARTURE MATRIX
					</div>
					<div class="text-xs text-gray-600 font-mono">
						[SYSTEM.ONLINE] → ACCESSING TRANSPORT GRID
					</div>
				</div>
				
				<!-- Bottom Border Line -->
				<div class="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent mt-6"></div>
			</div>
		</header>

		<!-- Station Search Section -->
		<div bind:this={searchContainer} class="px-4 py-4 sm:px-6 lg:px-8">
			<div class="max-w-4xl mx-auto">
				<CollapsibleSearchSection
					stationName={data.station}
				/>
			</div>
		</div>

		<!-- Station Info Section -->
		{#if data.location}
			<div bind:this={stationContainer} class="px-4 py-4 sm:px-6 lg:px-8">
				<div class="max-w-4xl mx-auto">
					<CollapsibleStationInfo
						station={data.location}
						onRefresh={refreshActions.handleManualRefresh}
						isRefreshing={$isRefreshing}
						lastUpdate={$lastUpdate}
					/>
				</div>
			</div>
		{/if}

		<!-- Error Message -->
		{#if data.error}
			<div class="px-4 py-4 sm:px-6 lg:px-8">
				<div class="max-w-4xl mx-auto">
					<ErrorMessage error={data.error} />
				</div>
			</div>
		{/if}

		<!-- Departures Section -->
		<div bind:this={departuresContainer} class="flex-1 px-4 py-4 sm:px-6 lg:px-8 pb-8">
			<div class="max-w-4xl mx-auto">
				<div class="border border-gray-700 bg-black/50 backdrop-blur-sm min-h-[50vh]">
					<!-- Departures Header -->
					<div class="border-b border-gray-700 px-4 py-3 bg-gray-900/30">
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-3">
								<div class="w-2 h-2 bg-blue-400 pulse-element {$isDataLoading ? 'animate-pulse' : ''}"></div>
								<span class="text-xs sm:text-sm text-gray-400 tracking-wider font-mono">
									DEPARTURE.MATRIX
								</span>
								{#if $isDataLoading}
									<div class="h-4 w-px bg-gray-600"></div>
									<span class="text-xs text-cyan-400 font-mono animate-pulse">
										UPDATING...
									</span>
								{:else if isFiltering}
									<div class="h-4 w-px bg-gray-600"></div>
									<span class="text-xs text-gray-500 font-mono">
										{filteredCount}/{totalDepartures} FILTERED
									</span>
								{/if}
								{#if $hasActiveFilters}
									<div class="h-4 w-px bg-gray-600"></div>
									<span class="text-xs text-blue-400 font-mono">
										{$totalActiveFilters} FILTER{$totalActiveFilters !== 1 ? 'S' : ''} ACTIVE
									</span>
								{/if}
							</div>
							
							{#if $hasActiveFilters}
								<button
									on:click={filterActions.handleClearFilters}
									class="text-xs text-gray-400 hover:text-gray-200 transition-colors duration-200 font-mono"
									title="Clear all {$totalActiveFilters} active filter{$totalActiveFilters !== 1 ? 's' : ''}"
								>
									CLEAR.ALL.FILTERS
								</button>
							{/if}
						</div>
					</div>
					
					<!-- Departures List -->
					<div class="p-4 transition-opacity duration-300 {$isDataLoading ? 'opacity-50' : 'opacity-100'}">
						<DeparturesList 
							totalDepartures={totalDepartures}
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Loading Overlay for Station Search -->
{#if $isSearching}
	<div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
		<div class="border border-gray-700 bg-black/90 p-8 max-w-sm mx-4">
			<div class="text-center space-y-4">
				<LoadingSpinner size="lg" color="white" />
				<div class="text-sm text-gray-300 tracking-wider font-mono">ACCESSING DATABASE</div>
				<div class="text-xs text-gray-500 font-mono">CONNECTING TO TRANSPORT GRID...</div>
			</div>
		</div>
	</div>
{/if}


