<script lang="ts">
	import ProductFilter from './ProductFilter.svelte';
	import PlatformFilter from './PlatformFilter.svelte';
	
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

<!-- Separator -->
<div class="my-6 flex items-center">
	<div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
	<div class="px-4">
		<div class="w-2 h-2 bg-cyan-400 animate-pulse"></div>
	</div>
	<div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
</div>

<!-- Platform Filter Section -->
<div>
	<PlatformFilter />
</div>
