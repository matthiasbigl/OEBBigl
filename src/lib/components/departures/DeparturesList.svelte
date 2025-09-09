<script lang="ts">
	import type { Departure } from '$lib/server/hafas';
	import DepartureCard from './DepartureCard.svelte';
	import Button from '../ui/Button.svelte';
	
	export let departures: Departure[];
	export let totalDepartures: number;
	export let activeFilters: Set<string>;
	export let onClearFilters: () => void;

	$: hasFilters = activeFilters.size > 0;
	$: isFiltered = hasFilters && departures.length !== totalDepartures;
</script>

{#if departures.length > 0}
	<div class="max-w-6xl mx-auto">
		<div class="flex items-center justify-between mb-8">
			<h2 class="text-3xl font-bold text-cyan-400 font-mono">&gt; LIVE DEPARTURES</h2>
			<div class="text-cyan-300 font-mono text-sm">
				{#if isFiltered}
					<span class="text-yellow-400">FILTERED:</span> {departures.length} of {totalDepartures} departures
				{:else}
					{departures.length} departures
				{/if}
			</div>
		</div>
		<div class="grid gap-4">
			{#each departures as departure}
				<DepartureCard {departure} />
			{/each}
		</div>
	</div>
{:else if totalDepartures > 0 && departures.length === 0}
	<div class="max-w-4xl mx-auto text-center">
		<div class="bg-slate-800/30 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-12">
			<div class="text-6xl mb-4">🔍</div>
			<h3 class="text-2xl font-bold text-yellow-400 mb-4 font-mono">&gt; NO RESULTS FOR FILTER</h3>
			<p class="text-yellow-300/70 font-mono mb-4">No departures match the selected transport types</p>
			<Button variant="primary" onClick={onClearFilters}>
				CLEAR FILTERS
			</Button>
		</div>
	</div>
{:else}
	<div class="max-w-4xl mx-auto text-center">
		<div class="bg-slate-800/30 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-12">
			<div class="text-6xl mb-4">🔍</div>
			<h3 class="text-2xl font-bold text-cyan-400 mb-4 font-mono">&gt; NO DEPARTURES FOUND</h3>
			<p class="text-cyan-300/70 font-mono">Try searching for a different station</p>
		</div>
	</div>
{/if}
