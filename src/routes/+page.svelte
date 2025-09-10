<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { invalidateAll } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { browser } from '$app/environment';
	import StationSearch from '$lib/components/search/StationSearch.svelte';
	import StationInfo from '$lib/components/station/StationInfo.svelte';
	import DeparturesList from '$lib/components/departures/DeparturesList.svelte';
	import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import { filterDepartures, toggleFilter, clearAllFilters } from '$lib/utils/filterUtils';
	
	export let data: PageData;
	
	// Animation refs
	let pageContainer: HTMLElement;
	let headerRef: HTMLElement;
	let gridBackground: HTMLElement;
	let searchContainer: HTMLElement;
	let stationContainer: HTMLElement;
	let departuresContainer: HTMLElement;
	let searchCollapsibleContent: HTMLElement;
	let stationCollapsibleContent: HTMLElement;
	let glitchElements: HTMLElement[] = [];
	let scanlines: HTMLElement[] = [];
	
	// Collapsible state
	let isSearchCollapsed = false;
	let isStationInfoCollapsed = false;
	
	// Mobile detection and default collapse state
	let isMobile = false;
	
	onMount(() => {
		// Check if mobile on mount
		isMobile = window.innerWidth < 768;
		
		// Collapse by default on mobile
		if (isMobile) {
			isSearchCollapsed = true;
			isStationInfoCollapsed = true;
		}
		
		// Add resize listener
		const handleResize = () => {
			const wasMobile = isMobile;
			isMobile = window.innerWidth < 768;
			
			// If switching from desktop to mobile, collapse
			if (!wasMobile && isMobile) {
				isSearchCollapsed = true;
				isStationInfoCollapsed = true;
			}
			// If switching from mobile to desktop, expand
			else if (wasMobile && !isMobile) {
				isSearchCollapsed = false;
				isStationInfoCollapsed = false;
			}
		};
		
		window.addEventListener('resize', handleResize);
		
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
	
	// Toggle functions with animations
	function toggleSearchCollapse() {
		isSearchCollapsed = !isSearchCollapsed;
		if (browser && searchCollapsibleContent) {
			if (isSearchCollapsed) {
				gsap.to(searchCollapsibleContent, {
					height: 0,
					opacity: 0,
					duration: 0.4,
					ease: "power2.inOut"
				});
			} else {
				// First, get the natural height
				gsap.set(searchCollapsibleContent, { height: 'auto' });
				const autoHeight = searchCollapsibleContent.offsetHeight;
				gsap.set(searchCollapsibleContent, { height: 0, opacity: 0 });
				
				// Then animate to that height
				gsap.to(searchCollapsibleContent, {
					height: autoHeight,
					opacity: 1,
					duration: 0.4,
					ease: "power2.inOut",
					onComplete: () => {
						gsap.set(searchCollapsibleContent, { height: 'auto' });
					}
				});
			}
		}
	}
	
	function toggleStationInfoCollapse() {
		isStationInfoCollapsed = !isStationInfoCollapsed;
		if (browser && stationCollapsibleContent) {
			if (isStationInfoCollapsed) {
				gsap.to(stationCollapsibleContent, {
					height: 0,
					opacity: 0,
					duration: 0.4,
					ease: "power2.inOut"
				});
			} else {
				// First, get the natural height
				gsap.set(stationCollapsibleContent, { height: 'auto' });
				const autoHeight = stationCollapsibleContent.offsetHeight;
				gsap.set(stationCollapsibleContent, { height: 0, opacity: 0 });
				
				// Then animate to that height
				gsap.to(stationCollapsibleContent, {
					height: autoHeight,
					opacity: 1,
					duration: 0.4,
					ease: "power2.inOut",
					onComplete: () => {
						gsap.set(stationCollapsibleContent, { height: 'auto' });
					}
				});
			}
		}
	}
	
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
		// Only run animations in browser
		if (browser) {
			// Register GSAP plugins
			gsap.registerPlugin(ScrollTrigger);
			
			// Initialize GSAP animations
			initializeAnimations();
		}
		
		// Only start auto-refresh if we have a station
		if (data.station) {
			startAutoRefresh();
		}
	});
	
	onDestroy(() => {
		if (refreshInterval) {
			clearInterval(refreshInterval);
		}
		// Cleanup GSAP only in browser
		if (browser && typeof gsap !== 'undefined') {
			// Kill all tweens on bound elements
			if (headerRef) gsap.killTweensOf(headerRef);
			if (searchContainer) gsap.killTweensOf(searchContainer);
			if (stationContainer) gsap.killTweensOf(stationContainer);
			if (departuresContainer) gsap.killTweensOf(departuresContainer);
			if (gridBackground) gsap.killTweensOf(gridBackground);
			if (searchCollapsibleContent) gsap.killTweensOf(searchCollapsibleContent);
			if (stationCollapsibleContent) gsap.killTweensOf(stationCollapsibleContent);
			
			// Clean up ScrollTrigger instances
			ScrollTrigger.getAll().forEach(trigger => trigger.kill());
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
		
		// Animate grid background with subtle parallax if element exists
		if (gridBackground) {
			gsap.to(gridBackground, {
				backgroundPosition: "50px 50px",
				duration: 30,
				ease: "none",
				repeat: -1
			});
		}
		
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
	<title>◾ CYBER STATION ◾</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
	<meta name="theme-color" content="#000000">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
</svelte:head>

<!-- Main Container with Retro-Futuristic Background -->
<div bind:this={pageContainer} class="min-h-screen bg-black text-gray-100 font-mono relative overflow-hidden">
	<!-- Animated Grid Background -->
	<div bind:this={gridBackground} class="fixed inset-0 opacity-10 pointer-events-none">
		<div class="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
		<div class="absolute inset-0" style="background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 20px 20px;"></div>
	</div>
	
	<!-- Scanlines for CRT Effect -->
	<div class="scanline fixed w-full h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-20 pointer-events-none"></div>
	<div class="scanline fixed w-full h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-20 pointer-events-none" style="animation-delay: 0.5s;"></div>
	<div class="scanline fixed w-full h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-20 pointer-events-none" style="animation-delay: 1s;"></div>
	
	<!-- Noise Overlay -->
	<div class="fixed inset-0 opacity-5 pointer-events-none bg-noise"></div>
	
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
				<div class="border border-gray-700 bg-black/50 backdrop-blur-sm">
					<!-- Collapsible Header -->
					<button 
						on:click={toggleSearchCollapse}
						class="w-full border-b border-gray-700 px-4 py-3 bg-gray-900/30 hover:bg-gray-800/40 transition-colors duration-200 group"
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-3">
								<div class="w-2 h-2 bg-gray-500 pulse-element"></div>
								<span class="text-xs text-gray-400 font-mono tracking-wider">SEARCH.MODULE</span>
							</div>
							<div class="flex items-center space-x-2">
								{#if isMobile}
									<span class="text-xs text-gray-500 font-mono">MOBILE</span>
								{/if}
								<div class="text-gray-400 transition-transform duration-200 {isSearchCollapsed ? '' : 'rotate-180'}">
									▼
								</div>
							</div>
						</div>
					</button>
					
					<!-- Collapsible Content -->
					<div bind:this={searchCollapsibleContent} class="collapsible-content overflow-hidden {isSearchCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'}">
						<div class="p-4">
							<StationSearch 
								stationName={data.station} 
								onSearch={handleStationSearch} 
							/>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Station Info Section -->
		{#if data.location}
			<div bind:this={stationContainer} class="px-4 py-4 sm:px-6 lg:px-8">
				<div class="max-w-4xl mx-auto">
					<div class="border border-gray-700 bg-black/50 backdrop-blur-sm">
						<!-- Station Header with Controls -->
						<div class="border-b border-gray-700 px-4 py-3 bg-gray-900/30">
							<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
								<!-- Station Title with Collapse Button -->
								<button 
									on:click={toggleStationInfoCollapse}
									class="flex items-center space-x-3 hover:bg-gray-800/40 transition-colors duration-200 group px-2 py-1 -mx-2 -my-1"
								>
									<div class="w-2 h-2 bg-green-400 pulse-element"></div>
									<div class="text-xs text-gray-400 font-mono tracking-wider">STATION.ACTIVE</div>
									<div class="h-4 w-px bg-gray-600"></div>
									<h2 class="text-lg font-bold text-white truncate font-title">{data.location.name}</h2>
									<div class="text-gray-400 transition-transform duration-200 {isStationInfoCollapsed ? '' : 'rotate-180'}">
										▼
									</div>
								</button>
								
								<!-- Refresh Controls - Separate from collapse button -->
								<div class="flex items-center space-x-4 text-xs">
									<!-- Manual Refresh Button -->
									<button 
										on:click={handleManualRefresh}
										disabled={isRefreshing}
										class="flex items-center space-x-2 px-3 py-1 border border-gray-600 bg-black/50 hover:bg-gray-900/50 disabled:opacity-50 transition-all duration-200 floating-element"
									>
										{#if isRefreshing}
											<LoadingSpinner size="sm" color="white" />
											<span class="text-gray-300 font-mono">SYNC</span>
										{:else}
											<span class="text-gray-400">◾◾</span>
											<span class="text-gray-300 font-mono">REFRESH</span>
										{/if}
									</button>
									
									<!-- Status Display -->
									<div class="hidden sm:flex items-center space-x-3 text-gray-400">
										<div class="flex items-center space-x-1">
											<div class="w-1 h-1 bg-green-400 pulse-element"></div>
											<span class="font-mono">AUTO-SYNC</span>
										</div>
										<div class="text-gray-500 font-mono">
											{lastUpdate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
										</div>
									</div>
								</div>
							</div>
						</div>
						
						<!-- Collapsible Station Info Content -->
						<div bind:this={stationCollapsibleContent} class="collapsible-content overflow-hidden {isStationInfoCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'}">
							<div class="p-4">
								<StationInfo 
									station={data.location} 
									{activeFilters}
									onToggleFilter={handleToggleFilter}
									onClearFilters={handleClearFilters}
								/>
							</div>
						</div>
					</div>
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
								<div class="w-2 h-2 bg-blue-400 pulse-element"></div>
								<span class="text-xs sm:text-sm text-gray-400 tracking-wider font-mono">
									DEPARTURE.MATRIX
								</span>
								{#if filteredDepartures.length !== (data.departures?.length || 0)}
									<div class="h-4 w-px bg-gray-600"></div>
									<span class="text-xs text-gray-500 font-mono">
										{filteredDepartures.length}/{data.departures?.length || 0} FILTERED
									</span>
								{/if}
							</div>
							
							{#if activeFilters.size > 0}
								<button
									on:click={handleClearFilters}
									class="text-xs text-gray-400 hover:text-gray-200 transition-colors duration-200 font-mono"
								>
									CLEAR.FILTERS
								</button>
							{/if}
						</div>
					</div>					<!-- Departures List -->
					<div class="p-4">
						<DeparturesList 
							departures={filteredDepartures}
							totalDepartures={data.departures?.length || 0}
							{activeFilters}
							onClearFilters={handleClearFilters}
						/>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Loading Overlay for Station Search -->
		{#if isSearching}
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
	</div>
</div>

<style>
	/* Custom CSS for effects that Tailwind can't handle */
	.bg-noise {
		background-image: 
			radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0);
		background-size: 20px 20px;
		animation: noise 0.2s infinite linear;
	}
	
	@keyframes noise {
		0% { transform: translate(0, 0); }
		10% { transform: translate(-5%, -5%); }
		20% { transform: translate(-10%, 5%); }
		30% { transform: translate(5%, -10%); }
		40% { transform: translate(-5%, 15%); }
		50% { transform: translate(-10%, 5%); }
		60% { transform: translate(15%, 0%); }
		70% { transform: translate(0%, 15%); }
		80% { transform: translate(-15%, 10%); }
		90% { transform: translate(10%, 5%); }
		100% { transform: translate(5%, 0%); }
	}
	
	/* Custom scrollbar for webkit browsers */
	:global(::-webkit-scrollbar) {
		width: 4px;
	}
	
	:global(::-webkit-scrollbar-track) {
		background: rgba(0, 0, 0, 0.5);
	}
	
	:global(::-webkit-scrollbar-thumb) {
		background: rgba(156, 163, 175, 0.5);
		border-radius: 0;
	}
	
	:global(::-webkit-scrollbar-thumb:hover) {
		background: rgba(156, 163, 175, 0.8);
	}
	
	/* Scanline animation */
	.scanline {
		transform: translateY(-100vh);
	}
	
	/* iOS safe area support */
	@supports (padding: max(0px)) {
		.min-h-screen {
			min-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
			padding-top: env(safe-area-inset-top);
			padding-bottom: env(safe-area-inset-bottom);
		}
	}
	
	/* Touch optimizations for iOS */
	:global(button) {
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
	}
	
	/* Prevent zoom on input focus for iOS */
	:global(input[type="text"]) {
		font-size: 16px;
	}
	
	@media (max-width: 640px) {
		:global(input[type="text"]) {
			font-size: 16px !important;
		}
	}
</style>
