<script lang="ts">
	import ProductFilter from './ProductFilter.svelte';
	import PlatformFilter from './PlatformFilter.svelte';
	import { activeFilters, activePlatformFilters, totalActiveFilters } from '$lib/stores';
	
	export let station: {
		id: string;
		name: string;
		products?: Record<string, boolean>;
	};
	
	// Reactive values - use shared stores to avoid duplicate computations
	$: hasProducts = station.products && Object.keys(station.products).length > 0;
</script>

<!-- Filter section with proper accessibility -->
<div role="region" aria-label="Station filters" class="space-y-4">
	{#if hasProducts && station.products}
		<ProductFilter 
			products={station.products}
		/>
	{/if}

	<PlatformFilter />
	
	<!-- Filter Status Summary (hidden from screen readers since it's redundant) -->
	{#if $totalActiveFilters > 0}
		<div class="text-xs text-gray-400 font-mono text-center" aria-hidden="true">
			{$totalActiveFilters} ACTIVE FILTER{$totalActiveFilters !== 1 ? 'S' : ''}
		</div>
	{/if}
</div>
