<script lang="ts">
	import Button from '../ui/Button.svelte';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { browser } from '$app/environment';
	import { activePlatformFilters, availablePlatforms, filterActions } from '$lib/stores';
	import SectionSeparator from '../ui/SectionSeparator.svelte';

	// Constants
	const ANIMATION_DURATION = 0.5;
	const ANIMATION_EASE = "back.out(1.7)";
	const STAGGER_DELAY = 0.05;
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
	 * Animates platform filter buttons on mount
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
	 * Handles platform filter toggle with validation
	 */
	const handlePlatformToggle = (platform: string): void => {
		if (!platform || platform.trim() === '') return;
		filterActions.handleTogglePlatformFilter(platform);
	};
	
	onMount(() => {
		animateFilterButtons();
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
						onClick={() => handlePlatformToggle(platform)}
						title="Filter by Platform {platform}"
					>
						{platform}
					</Button>
				</div>
			{/each}
		</div>
		
	</div>
{/if}
