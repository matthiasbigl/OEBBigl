<script lang="ts">
	import Button from '../ui/Button.svelte';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { browser } from '$app/environment';
	
	export let products: Record<string, boolean>;
	export let activeFilters: Set<string>;
	export let onToggleFilter: (product: string) => void;
	export let onClearFilters: () => void;

	let filterContainer: HTMLElement;
	let filterButtons: HTMLElement[] = [];

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

	const getProductDisplayName = (product: string): string => 
		productDisplayNames[product] || product.toUpperCase();

	$: availableProducts = Object.entries(products).filter(([, available]) => available);
	$: hasActiveFilters = activeFilters.size > 0;
	
	onMount(() => {
		// Only run animations in browser
		if (!browser || !filterButtons.length) return;
		
		// Animate filter buttons on mount
		gsap.fromTo(filterButtons,
			{ opacity: 0, scale: 0.8, y: 10 },
			{ 
				opacity: 1, 
				scale: 1, 
				y: 0, 
				duration: 0.5,
				ease: "back.out(1.7)",
				stagger: 0.05
			}
		);
	});
</script>


<div bind:this={filterContainer} class="w-full">
	<!-- Filter Header -->
	<div class="flex items-center space-x-3 mb-4">
		<div class="w-2 h-2 bg-blue-400 animate-pulse"></div>
		<span class="text-xs text-gray-400 font-mono tracking-wider">TRANSPORT.FILTER</span>
		{#if hasActiveFilters}
			<div class="h-3 w-px bg-gray-600"></div>
			<span class="text-xs text-orange-400 font-mono">
				{activeFilters.size} ACTIVE
			</span>
		{/if}
	</div>
	
	<!-- Filter Buttons Grid -->
	<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
		{#each availableProducts as [product], i}
			<div bind:this={filterButtons[i]}>
				<Button
					variant={activeFilters.has(product.toLowerCase()) ? 'filter-active' : 'filter'}
					size="sm"
					onClick={() => onToggleFilter(product)}
					title="Filter by {getProductDisplayName(product)}"
				>
					{getProductDisplayName(product)}
				</Button>
			</div>
		{/each}
		
		{#if hasActiveFilters}
			<div class="col-span-2 sm:col-span-1">
				<Button
					variant="danger"
					size="sm"
					onClick={onClearFilters}
				>
					RESET.ALL
				</Button>
			</div>
		{/if}
	</div>
	
	<!-- Filter Help Text -->
	<div class="mt-3 text-center">
		<span class="text-xs text-gray-500 font-mono">
			// Click transport types to filter departures
		</span>
	</div>
</div>
