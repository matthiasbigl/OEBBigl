<script lang="ts">
	import Button from '../ui/Button.svelte';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { browser } from '$app/environment';
	import { activePlatformFilters, availablePlatforms, filterActions } from '$lib/stores';
	
	let filterContainer: HTMLElement;
	let filterButtons: HTMLElement[] = [];
	
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
	
	$: hasActivePlatformFilters = $activePlatformFilters.size > 0;
</script>


{#if $availablePlatforms.length > 0}
	<div bind:this={filterContainer} class="w-full">
		<!-- Platform Filter Header -->
		<div class="flex items-center space-x-3 mb-4">
			<div class="w-2 h-2 bg-cyan-400 animate-pulse"></div>
			<span class="text-xs text-gray-400 font-mono tracking-wider">PLATFORM.SELECTOR</span>
			{#if hasActivePlatformFilters}
				<div class="h-3 w-px bg-gray-600"></div>
				<span class="text-xs text-cyan-400 font-mono">
					{$activePlatformFilters.size} PLATFORM{$activePlatformFilters.size !== 1 ? 'S' : ''} SELECTED
				</span>
			{/if}
		</div>
		
		<!-- Platform Buttons Grid -->
		<div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
			{#each $availablePlatforms as platform, i (platform)}
				<div bind:this={filterButtons[i]}>
					<Button
						variant={$activePlatformFilters.has(platform) ? 'platform-active' : 'platform'}
						size="sm"
						onClick={() => filterActions.handleTogglePlatformFilter(platform)}
						title="Filter by Platform {platform}"
					>
						{platform}
					</Button>
				</div>
			{/each}
			
			{#if hasActivePlatformFilters}
				<div class="col-span-2 sm:col-span-1">
					<Button
						variant="danger"
						size="sm"
						onClick={filterActions.handleClearPlatformFilters}
					>
						RESET
					</Button>
				</div>
			{/if}
		</div>
		
	</div>
{/if}
