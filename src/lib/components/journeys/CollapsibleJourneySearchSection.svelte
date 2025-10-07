<script lang="ts">
	import CollapsibleSearchSection from '../search/CollapsibleSearchSection.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	export let originName: string = '';
	export let indicatorColor: string = 'bg-blue-400';
	
	let isCollapsed = false;

	// Auto-collapse on mobile after initial load
	onMount(() => {
		if (!browser) return;
		
		const checkMobile = () => window.innerWidth < 768;
		isCollapsed = checkMobile();
	});
</script>

<CollapsibleSearchSection
	stationName={originName}
	bind:isCollapsed
	label="ROUTE.SEARCH"
	indicatorColor={indicatorColor}
>
	<slot />
</CollapsibleSearchSection>
