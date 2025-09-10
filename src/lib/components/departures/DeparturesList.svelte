<script lang="ts">
	import type { Departure } from '$lib/server/hafas';
	import DepartureCard from './DepartureCard.svelte';
	import Button from '../ui/Button.svelte';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { browser } from '$app/environment';
	
	export let departures: Departure[];
	export let totalDepartures: number;
	export let activeFilters: Set<string>;
	export let onClearFilters: () => void;

	$: hasFilters = activeFilters.size > 0;
	$: isFiltered = hasFilters && departures.length !== totalDepartures;
	
	let departureCards: HTMLElement[] = [];
	let containerRef: HTMLElement;
	
	// Animate departures when they load
	$: if (browser && departures.length > 0 && departureCards.length > 0) {
		animateCards();
	}
	
	function animateCards() {
		if (!browser || !departureCards.length) return;
		
		gsap.fromTo(departureCards, 
			{ 
				opacity: 0, 
				y: 30,
				scale: 0.95
			},
			{ 
				opacity: 1, 
				y: 0,
				scale: 1,
				duration: 0.6,
				ease: "power2.out",
				stagger: 0.1
			}
		);
	}
</script>


{#if departures.length > 0}
	<div bind:this={containerRef} class="w-full">
		<!-- Status Header -->
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-2 sm:space-y-0">
			<div class="flex items-center space-x-3">
				<div class="w-2 h-2 bg-green-400 animate-pulse"></div>
				<span class="text-xs sm:text-sm text-gray-400 tracking-wider font-mono">
					LIVE.FEED
				</span>
				<div class="h-3 w-px bg-gray-600"></div>
				<span class="text-xs sm:text-sm text-gray-300 font-bold">
					{departures.length} ENTRIES
				</span>
			</div>
			
			{#if isFiltered}
				<div class="flex items-center space-x-2 text-xs text-orange-400">
					<span class="font-mono">FILTERED:</span>
					<span class="text-white">{departures.length}/{totalDepartures}</span>
				</div>
			{/if}
		</div>
		
		<!-- Departures Grid -->
		<div class="space-y-2">
			{#each departures as departure, i}
				<div bind:this={departureCards[i]} class="departure-card-container">
					<DepartureCard {departure} />
				</div>
			{/each}
		</div>
	</div>
{:else if totalDepartures > 0 && departures.length === 0}
	<!-- Filtered No Results -->
	<div class="w-full text-center py-12">
		<div class="border border-orange-500/30 bg-black/60 backdrop-blur-sm p-8 max-w-md mx-auto">
			<!-- Header -->
			<div class="border-b border-orange-500/30 pb-3 mb-6">
				<div class="flex items-center justify-center space-x-2 text-xs text-orange-400">
					<div class="w-2 h-2 bg-orange-400 animate-pulse"></div>
					<span>FILTER.ERROR</span>
				</div>
			</div>
			
			<!-- Content -->
			<div class="space-y-4">
				<div class="text-4xl text-orange-400 font-mono">◯</div>
				<h3 class="text-lg font-bold text-orange-300 font-mono tracking-wider">
					NO MATCHES FOUND
				</h3>
				<p class="text-sm text-gray-400 font-mono">
					No departures match current filter criteria
				</p>
				<div class="pt-4">
					<Button variant="primary" onClick={onClearFilters}>
						RESET.FILTERS
					</Button>
				</div>
			</div>
		</div>
	</div>
{:else}
	<!-- No Departures -->
	<div class="w-full text-center py-12">
		<div class="border border-gray-600/30 bg-black/60 backdrop-blur-sm p-8 max-w-md mx-auto">
			<!-- Header -->
			<div class="border-b border-gray-600/30 pb-3 mb-6">
				<div class="flex items-center justify-center space-x-2 text-xs text-gray-400">
					<div class="w-2 h-2 bg-gray-500 animate-pulse"></div>
					<span>DATA.EMPTY</span>
				</div>
			</div>
			
			<!-- Content -->
			<div class="space-y-4">
				<div class="text-4xl text-gray-500 font-mono">◯</div>
				<h3 class="text-lg font-bold text-gray-300 font-mono tracking-wider">
					NO DEPARTURES
				</h3>
				<p class="text-sm text-gray-400 font-mono">
					No departure data available for this station
				</p>
			</div>
		</div>
	</div>
{/if}
