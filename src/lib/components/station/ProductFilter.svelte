<script lang="ts">
	import Button from '../ui/Button.svelte';
	
	export let products: Record<string, boolean>;
	export let activeFilters: Set<string>;
	export let onToggleFilter: (product: string) => void;
	export let onClearFilters: () => void;

	const productDisplayNames: Record<string, string> = {
		'nationalExpress': 'ICE/RJ',
		'national': 'IC/EC', 
		'interregional': 'IR',
		'regional': 'REX/R',
		'suburban': 'S-Bahn',
		'bus': 'Bus',
		'ferry': 'Ferry',
		'subway': 'U-Bahn',
		'tram': 'Tram',
		'onCall': 'On-Call'
	};

	const getProductDisplayName = (product: string): string => 
		productDisplayNames[product] || product.toUpperCase();

	$: availableProducts = Object.entries(products).filter(([, available]) => available);
	$: hasActiveFilters = activeFilters.size > 0;
</script>

<div class="mb-4">
	<h3 class="text-sm font-bold text-cyan-300 mb-2 font-mono">&gt; FILTER BY TRANSPORT TYPE:</h3>
	<div class="flex flex-wrap gap-2">
		{#each availableProducts as [product]}
			<Button
				variant={activeFilters.has(product.toLowerCase()) ? 'filter-active' : 'filter'}
				size="sm"
				onClick={() => onToggleFilter(product)}
				title="Click to filter by {getProductDisplayName(product)}"
			>
				{getProductDisplayName(product)}
			</Button>
		{/each}
		
		{#if hasActiveFilters}
			<Button
				variant="danger"
				size="sm"
				onClick={onClearFilters}
			>
				CLEAR ALL
			</Button>
		{/if}
	</div>
</div>
