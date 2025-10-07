<script lang="ts">
	import Button from '../ui/Button.svelte';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { browser } from '$app/environment';
	import { activeFilters, filterActions } from '$lib/stores';
	import SectionSeparator from '../ui/SectionSeparator.svelte';
	
	export let products: Record<string, boolean>;
	export let activeFiltersOverride: Set<string> | null = null;
	export let onToggleOverride: ((product: string) => void) | null = null;
	export let label: string = 'PRODUCT.FILTER';
	export let indicatorColor: string = 'blue-400';

	// Constants
	const ANIMATION_DURATION = 0.5;
	const ANIMATION_EASE = "back.out(1.7)";
	const STAGGER_DELAY = 0.05;
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
	$: activeFiltersSet = activeFiltersOverride ?? $activeFilters;
	$: activeProductCount = activeFiltersSet.size;
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
	 * Animates product filter buttons on mount
	 */
	function animateFilterButtons(): void {
		if (!browser || !filterButtons.length) return;
		
		gsap.fromTo(filterButtons,
			{ 
				opacity: 0, 
				scale: 0.8, 
				y: 10 
			},
			{ 
				opacity: 1, 
				scale: 1, 
				y: 0, 
				duration: ANIMATION_DURATION,
				ease: ANIMATION_EASE,
				stagger: STAGGER_DELAY
			}
		);
	}
	
	/**
	 * Handles product filter toggle with validation
	 */
	const handleProductToggle = (product: string): void => {
		if (!product || product.trim() === '') return;
		
		// Handle the filter logic
		if (onToggleOverride) {
			onToggleOverride(product);
		} else {
			filterActions.handleToggleFilter(product);
		}
	};
	
	onMount(() => {
		animateFilterButtons();
	});
</script>


{#if availableProducts.length > 0}
	<div bind:this={filterContainer} class="">
		<SectionSeparator {label} color={indicatorColor} />
		
		<!-- Product Buttons Grid -->
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
			{#each availableProducts as [product], i (product)}
				<div bind:this={filterButtons[i]}>
					<Button
						variant={activeFiltersSet.has(product.toLowerCase()) ? 'filter-active' : 'filter'}
						size="sm"
						onClick={() => handleProductToggle(product)}
						title="Filter by {getProductDisplayName(product)}"
					>
						{getProductDisplayName(product)}
					</Button>
				</div>
			{/each}
		</div>
	</div>
{/if}
