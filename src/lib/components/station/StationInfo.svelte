<script lang="ts">
	import ProductFilter from './ProductFilter.svelte';
	
	export let station: {
		id: string;
		name: string;
		products?: Record<string, boolean>;
	};
	export let activeFilters: Set<string>;
	export let onToggleFilter: (product: string) => void;
	export let onClearFilters: () => void;
</script>

{#if station.products}
	<ProductFilter 
		products={station.products}
		{activeFilters}
		{onToggleFilter}
		{onClearFilters}
	/>
{/if}
