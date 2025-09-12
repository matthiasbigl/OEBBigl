<script lang="ts">
	import Button from '../ui/Button.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { filterAnimations, animateFilterToggle, cleanupElementAnimations } from '$lib/utils/animations';
	import { activePlatformFilters, availablePlatforms, filterActions } from '$lib/stores';
	import SectionSeparator from '../ui/SectionSeparator.svelte';

	// Constants
	const GRID_BREAKPOINTS = {
		base: 4,
		sm: 6,
		md: 8,
		lg: 10
	};

	let filterContainer: HTMLElement;
	let filterButtons: HTMLElement[] = [];
	
	// Reactive values
	$: activePlatformCount = $activePlatformFilters.size;
	$: totalPlatforms = $availablePlatforms.length;
	
	/**
	 * Handles platform filter toggle with validation and animation
	 */
	const handlePlatformToggle = (platform: string, buttonElement: HTMLElement): void => {
		if (!platform || platform.trim() === '') return;
		
		// Animate the filter toggle
		animateFilterToggle(buttonElement, !$activePlatformFilters.has(platform));
		
		// Handle the filter logic
		filterActions.handleTogglePlatformFilter(platform);
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


{#if $availablePlatforms.length > 0}
	<div bind:this={filterContainer} class="">
		<SectionSeparator label="PLATFORM.FILTER" color="blue-400" />

		<!-- Platform Buttons Grid -->
		<div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
			{#each $availablePlatforms as platform, i (platform)}
				<div bind:this={filterButtons[i]}>
					<Button
						variant={$activePlatformFilters.has(platform) ? 'platform-active' : 'platform'}
						size="sm"
						onClick={() => handlePlatformToggle(platform, filterButtons[i])}
						title="Filter by Platform {platform}"
					>
						{platform}
					</Button>
				</div>
			{/each}
		</div>
		
	</div>
{/if}
