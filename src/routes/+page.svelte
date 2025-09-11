<script lang="ts">
	import type { PageData } from './$types';
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { browser } from '$app/environment';
	import CollapsibleSearchSection from '$lib/components/search/CollapsibleSearchSection.svelte';
	import CollapsibleStationInfo from '$lib/components/station/CollapsibleStationInfo.svelte';
	import DeparturesList from '$lib/components/departures/DeparturesList.svelte';
	import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import { 
		isSearching, searchActions, currentStation, isDataLoading,
		isRefreshing, lastUpdate, refreshActions,
		activeFilters, activePlatformFilters, filteredDepartures, filterActions
	} from '$lib/stores';
	
	export let data: PageData;
	
	// Animation refs
	let pageContainer: HTMLElement;
	let headerRef: HTMLElement;
	let gridBackground: HTMLElement;
	let searchContainer: HTMLElement;
	let stationContainer: HTMLElement;
	let departuresContainer: HTMLElement;
	
	// Auto-refresh interval ID
	let autoRefreshInterval: ReturnType<typeof setInterval> | null = null;
	
	
	onMount(() => {
		// Initialize departures in the filter store
		if (data.departures) {
			filterActions.setDepartures(data.departures);
		}
		
		// Handle initial station setup and localStorage
		if (browser) {
			// If no station in URL but we have a stored station, redirect
			if (!data.station || data.station === '') {
				const lastVisited = searchActions.getLastVisitedStation();
				if (lastVisited) {
					searchActions.handleStationSearch(lastVisited);
					return; // Exit early since we're redirecting
				}
			} else {
				// Update stored station with current one
				searchActions.setCurrentStation(data.station);
			}
		}
		
		// Start auto-refresh (only in browser)
		if (browser) {
			autoRefreshInterval = refreshActions.startAutoRefresh(60);
		}
		
		// Only run animations in browser
		if (browser) {
			// Register GSAP plugins
			gsap.registerPlugin(ScrollTrigger);
			
			// Initialize GSAP animations
			initializeAnimations();
		}
	});
	
	// Update departures when data changes
	$: if (data.departures) {
		filterActions.setDepartures(data.departures);
		
		// Clear filters when switching to a new station
		if (data.station !== $currentStation) {
			filterActions.handleClearFilters();
			// Update current station and store in localStorage
			if (browser && data.station) {
				searchActions.setCurrentStation(data.station);
			}
		}
		
		// Clear data loading state when new data arrives
		if ($isDataLoading) {
			setTimeout(() => {
				refreshActions.clearDataLoading();
			}, 200);
		}
	}
	
	
	onDestroy(() => {
		// Stop auto-refresh
		if (autoRefreshInterval) {
			refreshActions.stopAutoRefresh(autoRefreshInterval);
		}
		
		// Cleanup GSAP only in browser
		if (browser && typeof gsap !== 'undefined') {
			// Kill all tweens on bound elements
			if (headerRef) gsap.killTweensOf(headerRef);
			if (searchContainer) gsap.killTweensOf(searchContainer);
			if (stationContainer) gsap.killTweensOf(stationContainer);
			if (departuresContainer) gsap.killTweensOf(departuresContainer);
			if (gridBackground) gsap.killTweensOf(gridBackground);
			
			// Clean up ALL ScrollTrigger instances
			ScrollTrigger.getAll().forEach(trigger => trigger.kill());
			ScrollTrigger.refresh();
		}
	});
	
	function initializeAnimations() {
		// Guard against SSR
		if (!browser || !headerRef || !searchContainer) return;
		
		// Set initial states for mobile-first animations
		if (headerRef && searchContainer) {
			gsap.set([headerRef, searchContainer], { 
				opacity: 0, 
				y: -30,
				scale: 0.95
			});
		}
		
		if (stationContainer) {
			gsap.set(stationContainer, { 
				opacity: 0, 
				y: 20,
				scale: 0.98
			});
		}
		
		// Create staggered entrance timeline
		const mainTl = gsap.timeline({ delay: 0.2 });
		
		// Header entrance with cyber glitch effect
		if (headerRef) {
			mainTl.to(headerRef, {
				opacity: 1,
				y: 0,
				scale: 1,
				duration: 1.2,
				ease: "power3.out"
			});
		}
		
		// Set up scroll-based parallax for grid background
		if (gridBackground) {
			// Create a scroll-triggered parallax effect
			ScrollTrigger.create({
				trigger: pageContainer,
				start: "top top",
				end: "bottom top",
				scrub: true,
				onUpdate: (self) => {
					// Move the grid background based on scroll progress
					const progress = self.progress;
					const yPos = progress * 100; // Move 100px over full scroll
					const xPos = progress * 50;  // Move 50px horizontally
					gsap.set(gridBackground, {
						backgroundPosition: `${xPos}px ${yPos}px`
					});
				}
			});
			
			// Also add the continuous subtle movement
			gsap.to(gridBackground, {
				backgroundPosition: "20px 20px",
				duration: 20,
				ease: "none",
				repeat: -1,
				yoyo: true
			});
		}
		
		
		
		// Search container with smooth slide up
		if (searchContainer) {
			mainTl.to(searchContainer, {
				opacity: 1,
				y: 0,
				scale: 1,
				duration: 0.8,
				ease: "back.out(1.2)"
			}, "-=0.6");
		}
		
		// Station container with gentle bounce
		if (stationContainer) {
			mainTl.to(stationContainer, {
				opacity: 1,
				y: 0,
				scale: 1,
				duration: 0.9,
				ease: "power2.out"
			}, "-=0.4");
		}
		
		// Animate scanlines with bound elements only
		const scanlineElements = document.querySelectorAll(".scanline");
		if (scanlineElements.length > 0) {
			gsap.to(scanlineElements, {
				y: "120vh",
				duration: 3,
				ease: "none",
				repeat: -1,
				stagger: {
					amount: 1.5,
					from: "random"
				}
			});
		}
		
		// Add subtle floating animation to bound floating elements
		const floatingElements = document.querySelectorAll(".floating-element");
		if (floatingElements.length > 0) {
			gsap.to(floatingElements, {
				y: "random(-5, 5)",
				rotation: "random(-1, 1)",
				duration: "random(3, 6)",
				ease: "sine.inOut",
				repeat: -1,
				yoyo: true,
				stagger: 0.3
			});
		}
		
		// Pulse effect for status indicators
		const pulseElements = document.querySelectorAll(".pulse-element");
		if (pulseElements.length > 0) {
			gsap.to(pulseElements, {
				scale: 1.05,
				opacity: 0.8,
				duration: 2,
				ease: "power2.inOut",
				repeat: -1,
				yoyo: true
			});
		}
	}
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
	<div bind:this={gridBackground} class="fixed inset-0 opacity-20 pointer-events-none">
		<div class="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
		<div class="absolute inset-0" style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 20px 20px;"></div>
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
						<span class="text-gray-500">◾</span>
						<span class="mx-2 sm:mx-4 text-white">CYBER STATION</span>
						<span class="text-gray-500">◾</span>
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
								{:else if $filteredDepartures.length !== (data.departures?.length || 0)}
									<div class="h-4 w-px bg-gray-600"></div>
									<span class="text-xs text-gray-500 font-mono">
										{$filteredDepartures.length}/{data.departures?.length || 0} FILTERED
									</span>
								{/if}
								{#if $activeFilters.size > 0 || $activePlatformFilters.size > 0}
									<div class="h-4 w-px bg-gray-600"></div>
									<span class="text-xs text-blue-400 font-mono">
										{$activeFilters.size + $activePlatformFilters.size} FILTER{$activeFilters.size + $activePlatformFilters.size !== 1 ? 'S' : ''} ACTIVE
									</span>
								{/if}
							</div>
							
							{#if $activeFilters.size > 0 || $activePlatformFilters.size > 0}
								<button
									on:click={filterActions.handleClearFilters}
									class="text-xs text-gray-400 hover:text-gray-200 transition-colors duration-200 font-mono"
								>
									CLEAR.ALL.FILTERS
								</button>
							{/if}
						</div>
					</div>
					
					<!-- Departures List -->
					<div class="p-4 transition-opacity duration-300 {$isDataLoading ? 'opacity-50' : 'opacity-100'}">
						<DeparturesList 
							totalDepartures={data.departures?.length || 0}
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


