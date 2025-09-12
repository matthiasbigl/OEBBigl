<script lang="ts">
	import StationInfo from './StationInfo.svelte';
	import LoadingSpinner from '../ui/LoadingSpinner.svelte';
	import SectionSeparator from '../ui/SectionSeparator.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { collapsibleAnimations, cleanupElementAnimations } from '$lib/utils/animations';
	import { activeFilters, activePlatformFilters, filterActions, totalActiveFilters, hasActiveFilters } from '$lib/stores';
	
	export let station: {
		id: string;
		name: string;
		products?: Record<string, boolean>;
	};
	export let onRefresh: () => Promise<void>;
	export let isRefreshing: boolean = false;
	export let lastUpdate: Date;
	export let isCollapsed: boolean = false;

	// Constants
	const MOBILE_BREAKPOINT = 768;

	let containerRef: HTMLElement;
	let collapsibleContentRef: HTMLElement;
	let isMobile = false;
	
	// Reactive values - use shared stores to avoid duplicate computations
	$: formattedLastUpdate = lastUpdate.toLocaleTimeString('de-DE', { 
		hour: '2-digit', 
		minute: '2-digit', 
		second: '2-digit' 
	});
	
	/**
	 * Checks if the current viewport is considered mobile
	 */
	function checkIsMobile(): boolean {
		return window.innerWidth < MOBILE_BREAKPOINT;
	}
	
	/**
	 * Animates the collapsible content using our animation system
	 */
	function animateContent(collapsed: boolean): void {
		if (!browser || !collapsibleContentRef) return;
		
		// Use our collapsible animation system
		collapsibleAnimations.toggle(collapsibleContentRef, collapsed);
	}
	
	/**
	 * Handles responsive behavior when viewport size changes
	 */
	function handleResponsiveCollapse(wasMobile: boolean, currentlyMobile: boolean): void {
		// If switching from desktop to mobile, collapse station info
		if (!wasMobile && currentlyMobile) {
			isCollapsed = true;
			animateContent(true);
		}
		// If switching from mobile to desktop, expand station info
		else if (wasMobile && !currentlyMobile) {
			isCollapsed = false;
			animateContent(false);
		}
	}
	
	// Mobile detection and default collapse state
	onMount(() => {
		// Check if mobile on mount
		isMobile = checkIsMobile();
		
		// Collapse by default on mobile
		if (isMobile) {
			isCollapsed = true;
		}
		
		// Add resize listener
		const handleResize = (): void => {
			const wasMobile = isMobile;
			isMobile = checkIsMobile();
			
			handleResponsiveCollapse(wasMobile, isMobile);
		};
		
		window.addEventListener('resize', handleResize);
		
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	/**
	 * Toggles the collapsed state of the station info section
	 */
	const toggleCollapse = (): void => {
		isCollapsed = !isCollapsed;
		animateContent(isCollapsed);
	};
	
	/**
	 * Handles refresh with proper error handling
	 */
	const handleRefresh = async (): Promise<void> => {
		try {
			await onRefresh();
		} catch (error) {
			console.error('Refresh failed:', error);
			// Could emit a custom event here for error handling
		}
	};
	
	/**
	 * Clears all active filters
	 */
	const handleClearAllFilters = (): void => {
		filterActions.handleClearFilters();
	};

	onDestroy(() => {
		cleanupElementAnimations([collapsibleContentRef]);
	});
</script>

<div bind:this={containerRef} class="border border-gray-700 bg-black/50 backdrop-blur-sm">
	<!-- Station Header with Controls -->
	<div class="border-b border-gray-700 px-4 py-3 bg-gray-900/30">
		<!-- Station Title with Collapse Button -->
		<button 
			on:click={toggleCollapse}
			class="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 hover:bg-gray-800/40 transition-colors duration-200 group px-2 py-1 -mx-2 -my-1 w-full text-left"
			aria-expanded={!isCollapsed}
			aria-controls="station-info-content"
		>
			<div class="flex items-center space-x-3">
				<div class="w-2 h-2 bg-green-400 pulse-element"></div>
				<div class="text-xs text-gray-400 font-mono tracking-wider">OPTIONS</div>
				<div class="h-4 w-px bg-gray-600"></div>
			</div>
			<div class="flex items-center justify-between w-full md:w-auto">
				<h2 class="text-lg font-bold text-white truncate font-title">{station.name}</h2>
				<div class="flex items-center space-x-2 md:ml-3">
					<div class="text-gray-400 transition-transform duration-200 {isCollapsed ? '' : 'rotate-180'}">
						▼
					</div>
				</div>
			</div>
		</button>
	</div>
	
	<!-- Collapsible Station Info Content -->
	<div bind:this={collapsibleContentRef} class="overflow-hidden {isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'}" id="station-info-content">
		<div class="p-4 space-y-4">
			
			<SectionSeparator label="OPTIONS" color="blue-400" />
			
			<!-- Refresh Controls -->
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
				<div class="flex items-center space-x-3">
					<!-- Manual Refresh Button -->
					<button 
						on:click={handleRefresh}
						disabled={isRefreshing}
						class="flex items-center space-x-2 px-3 py-2 border border-gray-600 bg-black/50 hover:bg-gray-900/50 disabled:opacity-50 transition-all duration-200 floating-element"
						title="Manually refresh departure data"
					>
						{#if isRefreshing}
							<LoadingSpinner size="sm" color="white" />
							<span class="text-gray-300 font-mono">SYNC</span>
						{:else}
							<span class="text-gray-400">⟳</span>
							<span class="text-gray-300 font-mono">REFRESH</span>
						{/if}
					</button>
					
					<!-- Clear All Filters Button -->
					{#if $hasActiveFilters}
						<button 
							on:click={handleClearAllFilters}
							class="flex items-center space-x-2 px-3 py-2 border border-red-600/50 bg-red-900/20 hover:bg-red-900/40 transition-all duration-200"
							title="Clear all active filters ({$totalActiveFilters})"
						>
							<span class="text-red-400">✕</span>
							<span class="text-red-300 font-mono text-sm">CLEAR.ALL</span>
						</button>
					{/if}
				</div>
				
				<!-- Status Display -->
				<div class="flex items-center space-x-3 text-gray-400 text-xs">
					<div class="flex items-center space-x-1">
						<div class="w-1 h-1 bg-green-400 pulse-element"></div>
						<span class="font-mono">AUTO-SYNC</span>
					</div>
					<div class="text-gray-500 font-mono">
						{formattedLastUpdate}
					</div>
				</div>
			</div>
			
			<StationInfo 
				{station}
			/>
		</div>
	</div>
</div>
