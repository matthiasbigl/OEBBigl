<script lang="ts">
	import ProductFilter from '../station/ProductFilter.svelte';
	import SectionSeparator from '../ui/SectionSeparator.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { collapsibleAnimations, cleanupElementAnimations } from '$lib/utils/animations';
	import {
		activeJourneyProductFilters,
		journeyActions,
		totalJourneyFilters,
		hasJourneyFilters,
		maxJourneyTransfers
	} from '$lib/stores';
	import type { Station } from '$lib/server/hafas';

	type JourneyMetadata = {
		timestamp: string;
		totalCount: number;
		availableProducts: string[];
		format: string;
	};

	export let fromLocation: Station | undefined = undefined;
	export let toLocation: Station | undefined = undefined;
	export let metadata: JourneyMetadata | null = null;

	// Constants
	const MOBILE_BREAKPOINT = 768;

	let containerRef: HTMLElement;
	let collapsibleContentRef: HTMLElement;
	let isMobile = false;
	let isCollapsed = false;

	// Reactive computed values
	$: productMap = (metadata?.availableProducts ?? []).reduce<Record<string, boolean>>((acc, product) => {
		acc[product] = true;
		return acc;
	}, {});

	$: hasProducts = Object.keys(productMap).length > 0;
	
	$: formattedTimestamp = metadata?.timestamp 
		? new Date(metadata.timestamp).toLocaleTimeString('de-DE', { 
			hour: '2-digit', 
			minute: '2-digit', 
			second: '2-digit' 
		})
		: '--:--:--';

	$: routeText = fromLocation && toLocation 
		? `${fromLocation.name} → ${toLocation.name}` 
		: 'NO ROUTE SELECTED';

	$: totalRoutes = metadata?.totalCount ?? 0;

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
		collapsibleAnimations.toggle(collapsibleContentRef, collapsed);
	}

	/**
	 * Handles responsive behavior when viewport size changes
	 */
	function handleResponsiveCollapse(wasMobile: boolean, currentlyMobile: boolean): void {
		if (!wasMobile && currentlyMobile) {
			isCollapsed = true;
			animateContent(true);
		} else if (wasMobile && !currentlyMobile) {
			isCollapsed = false;
			animateContent(false);
		}
	}

	// Mobile detection and default collapse state
	onMount(() => {
		isMobile = checkIsMobile();
		
		// Collapse by default on mobile
		if (isMobile) {
			isCollapsed = true;
		}
		
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
	 * Toggles the collapsed state of the journey options section
	 */
	const toggleCollapse = (): void => {
		isCollapsed = !isCollapsed;
		animateContent(isCollapsed);
	};

	/**
	 * Handles max transfers selection change
	 */
	const handleMaxTransfersChange = (event: Event) => {
		const value = (event.target as HTMLSelectElement).value;
		const numValue = value ? Number.parseInt(value, 10) : null;
		console.log('[JourneySummaryPanel] handleMaxTransfersChange:', { value, numValue });
		journeyActions.setMaxTransfers(numValue);
	};

	/**
	 * Clears all active filters
	 */
	const handleClearAllFilters = (): void => {
		journeyActions.clearFilters();
	};

	onDestroy(() => {
		cleanupElementAnimations([collapsibleContentRef]);
	});
</script>

<div bind:this={containerRef} class="border border-gray-700 bg-black/50 backdrop-blur-sm">
	<!-- Journey Header with Controls -->
	<div class="border-b border-gray-700 px-4 py-3 bg-gray-900/30">
		<!-- Journey Route Title with Collapse Button -->
		<button 
			on:click={toggleCollapse}
			class="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 hover:bg-gray-800/40 transition-colors duration-200 group px-2 py-1 -mx-2 -my-1 w-full text-left"
			aria-expanded={!isCollapsed}
			aria-controls="journey-options-content"
		>
			<div class="flex items-center space-x-3">
				<div class="w-2 h-2 bg-blue-400 pulse-element"></div>
				<div class="text-xs text-gray-400 font-mono tracking-wider">JOURNEY.OPTIONS</div>
				<div class="h-4 w-px bg-gray-600"></div>
			</div>
			<div class="flex items-center justify-between w-full md:w-auto">
				<h2 class="text-lg font-bold text-white truncate font-title">{routeText}</h2>
				<div class="flex items-center space-x-2 md:ml-3">
					<div class="text-gray-400 transition-transform duration-200 {isCollapsed ? '' : 'rotate-180'}">
						▼
					</div>
				</div>
			</div>
		</button>
	</div>
	
	<!-- Collapsible Journey Options Content -->
	<div 
		bind:this={collapsibleContentRef} 
		class="overflow-hidden transition-all duration-300 ease-in-out" 
		style="{isCollapsed ? 'max-height: 0; opacity: 0;' : 'max-height: 2000px; opacity: 1;'}"
		id="journey-options-content"
	>
		<div class="p-4 space-y-4">
			<!-- Route Statistics -->
			<div class="space-y-3">
				<SectionSeparator label="ROUTE.INFO" color="green-400" />
				
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<!-- Origin Station -->
					<div class="border border-gray-700 bg-black/30 p-3">
						<div class="text-xs text-gray-500 font-mono mb-1">ORIGIN</div>
						<div class="text-sm text-gray-200 font-mono">
							{fromLocation?.name ?? '---'}
						</div>
					</div>
					
					<!-- Destination Station -->
					<div class="border border-gray-700 bg-black/30 p-3">
						<div class="text-xs text-gray-500 font-mono mb-1">DESTINATION</div>
						<div class="text-sm text-gray-200 font-mono">
							{toLocation?.name ?? '---'}
						</div>
					</div>
				</div>

				<!-- Search Statistics -->
				<div class="flex flex-wrap items-center gap-3 text-xs">
					<div class="flex items-center space-x-2">
						<div class="w-1.5 h-1.5 bg-green-400 pulse-element"></div>
						<span class="text-gray-400 font-mono">{totalRoutes} ROUTES.FOUND</span>
					</div>
					<div class="text-gray-600">•</div>
					<div class="flex items-center space-x-2">
						<span class="text-gray-500 font-mono">SCAN.TIME:</span>
						<span class="text-gray-400 font-mono">{formattedTimestamp}</span>
					</div>
				</div>
			</div>

			<SectionSeparator label="FILTERS" color="blue-400" />
			
			<!-- Filter Controls -->
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
				<div class="text-xs text-gray-400 font-mono">
					REFINE.RESULTS
				</div>
				
				<!-- Clear All Filters Button -->
				{#if $hasJourneyFilters}
					<button 
						on:click={handleClearAllFilters}
						class="flex items-center space-x-2 px-3 py-2 border border-red-600/50 bg-red-900/20 hover:bg-red-900/40 transition-all duration-200"
						title="Clear all active filters ({$totalJourneyFilters})"
					>
						<span class="text-red-400">✕</span>
						<span class="text-red-300 font-mono text-sm">CLEAR.ALL</span>
					</button>
				{/if}
			</div>

			<!-- Product Type Filter -->
			{#if hasProducts}
				<ProductFilter 
					products={productMap}
					activeFiltersOverride={$activeJourneyProductFilters}
					onToggleOverride={(product) => journeyActions.toggleProductFilter(product)}
				/>
			{/if}

			<!-- Max Transfers Filter -->
			<div class="space-y-2">
				<div class="flex items-center space-x-3">
					<div class="w-2 h-2 bg-blue-400"></div>
					<span class="text-xs text-gray-400 font-mono tracking-wider">MAX.TRANSFERS</span>
					<div class="flex-1 h-px bg-gray-700"></div>
				</div>
				<select
					value={$maxJourneyTransfers ?? ''}
					on:change={handleMaxTransfersChange}
					class="w-full bg-black/60 border border-gray-600 text-gray-100 px-3 py-2 font-mono text-sm focus:outline-none focus:border-gray-400 hover:border-gray-500 transition-colors touch-manipulation"
					aria-label="Maximum number of transfers"
				>
					<option value="">ANY</option>
					<option value="0">DIRECT ONLY</option>
					<option value="1">MAX 1 TRANSFER</option>
					<option value="2">MAX 2 TRANSFERS</option>
					<option value="3">MAX 3 TRANSFERS</option>
				</select>
			</div>
			
			<!-- Filter Status Summary -->
			{#if $totalJourneyFilters > 0}
				<div class="border-t border-gray-700 pt-3">
					<div class="flex items-center justify-center space-x-2 text-xs text-gray-400 font-mono">
						<div class="w-1.5 h-1.5 bg-yellow-400 pulse-element"></div>
						<span>{$totalJourneyFilters} ACTIVE FILTER{$totalJourneyFilters !== 1 ? 'S' : ''}</span>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
