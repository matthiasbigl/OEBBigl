<script lang="ts">
	import Button from '../ui/Button.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { filterAnimations, animateFilterToggle, cleanupElementAnimations } from '$lib/utils/animations';
	import { activeFilters, filterActions } from '$lib/stores';
	import SectionSeparator from '../ui/SectionSeparator.svelte';
	
	export let products: Record<string, boolean>;

	// Constants
	const GRID_BREAKPOINTS = {
		base: 2,
		sm: 3,
		md: 4,
		lg: 5
	};

	let filterContainer: HTMLElement;
	let filterButtons: HTMLElement[] = [];
	
	// Reactive values
	$: availableProducts = Object.entries(products).filter(([, available]) => available);
	$: activeProductCount = $activeFilters.size;
	$: totalProducts = availableProducts.length;
	
	/**
	 * Product type display names mapping
	 */
	const productDisplayNames: Record<string, string> = {
		'nationalExpress': 'ICE',
		'national': 'IC', 
		'interregional': 'IR',
		'regional': 'REX',
		'suburban': 'S-BAHN',
		'bus': 'BUS',
		'ferry': 'FERRY',
		'subway': 'U-BAHN',
		'tram': 'TRAM',
		'onCall': 'ON-CALL'
	};

	/**
	 * Gets the display name for a product type
	 */
	const getProductDisplayName = (product: string): string => 
		productDisplayNames[product] || product.toUpperCase();
	
	/**
	 * Handles product filter toggle with validation and animation
	 */
	const handleProductToggle = (product: string, buttonElement: HTMLElement): void => {
		if (!product || product.trim() === '') return;
		
		// Animate the filter toggle
		animateFilterToggle(buttonElement, !$activeFilters.has(product.toLowerCase()));
		
		// Handle the filter logic
		filterActions.handleToggleFilter(product);
	};
	
	onMount(() => {
		// Animate filter buttons entrance using our animation system
		if (browser && filterButtons.length) {
			filterAnimations.buttonEntrance(filterButtons);
		}
	});
	
	onDestroy(() => {
		cleanupElementAnimations(filterButtons);
	});
</script>


<div bind:this={filterContainer} class="w-full">
	<!-- Filter Header -->
	<SectionSeparator label="PRODUCT.FILTER" color="blue-400" />
	
	<!-- Filter Buttons Grid -->
	<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
		{#each availableProducts as [product], i (product)}
			<div bind:this={filterButtons[i]}>
				<Button
					variant={$activeFilters.has(product.toLowerCase()) ? 'filter-active' : 'filter'}
					size="sm"
					onClick={() => handleProductToggle(product, filterButtons[i])}
					title="Filter by {getProductDisplayName(product)}"
				>
					{getProductDisplayName(product)}
				</Button>
			</div>
		{/each}
	</div>
</div>
