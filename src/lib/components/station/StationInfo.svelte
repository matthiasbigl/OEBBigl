<script lang="ts">
	import ProductFilter from './ProductFilter.svelte';
	
	export let station: {
		id: string;
		name: string;
		products?: Record<string, boolean>;
	};
</script>

{#if station.products}
	<ProductFilter 
		products={station.products}
	/>
{/if}
