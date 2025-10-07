<script lang="ts">
	import type { JourneySearchResult } from '$lib/server/hafas';
	import { filteredJourneys } from '$lib/stores';
	import JourneyCard from './JourneyCard.svelte';
	import LoadingSpinner from '../ui/LoadingSpinner.svelte';
	import ErrorMessage from '../ui/ErrorMessage.svelte';
	import Button from '../ui/Button.svelte';

	export let totalJourneys = 0;
	export let isSearching = false;
	export let error: string | null = null;
	export let pagination: JourneySearchResult['pagination'] | null = null;
	export let onPaginate: (direction: 'next' | 'prev') => void = () => {};

	$: hasNext = Boolean(pagination?.hasNextPage && pagination?.nextToken);
	$: hasPrev = Boolean(pagination?.hasPrevPage && pagination?.prevToken);
	$: filteredCount = $filteredJourneys.length;
</script>

{#if isSearching}
	<div class="flex items-center justify-center py-12 sm:py-16">
		<div class="flex flex-col items-center space-y-3 sm:space-y-4">
			<LoadingSpinner size="lg" color="white" />
			<div class="text-xs text-gray-400 font-mono tracking-widest">
				SCANNING.NETWORK...
			</div>
		</div>
	</div>
{:else if error}
	<ErrorMessage error={error} />
{:else if totalJourneys === 0}
	<!-- No Journeys -->
	<div class="w-full text-center py-12">
		<div class="border border-gray-600/30 bg-black/60 backdrop-blur-sm p-8 max-w-md mx-auto">
			<div class="border-b border-gray-600/30 pb-3 mb-6">
				<div class="flex items-center justify-center space-x-2 text-xs text-gray-400">
					<div class="w-2 h-2 bg-gray-500 animate-pulse"></div>
					<span>DATA.EMPTY</span>
				</div>
			</div>
			<div class="space-y-4">
				<div class="text-4xl text-gray-500 font-mono">◯</div>
				<h3 class="text-lg font-bold text-gray-300 font-mono tracking-wider">
					NO JOURNEYS
				</h3>
				<p class="text-sm text-gray-400 font-mono">
					Initiate search to display routes
				</p>
			</div>
		</div>
	</div>
{:else if filteredCount === 0}
	<!-- Filtered No Results -->
	<div class="w-full text-center py-12">
		<div class="border border-orange-500/30 bg-black/60 backdrop-blur-sm p-8 max-w-md mx-auto">
			<div class="border-b border-orange-500/30 pb-3 mb-6">
				<div class="flex items-center justify-center space-x-2 text-xs text-orange-400">
					<div class="w-2 h-2 bg-orange-400 animate-pulse"></div>
					<span>FILTER.ERROR</span>
				</div>
			</div>
			<div class="space-y-4">
				<div class="text-4xl text-orange-400 font-mono">◯</div>
				<h3 class="text-lg font-bold text-orange-300 font-mono tracking-wider">
					NO MATCHES FOUND
				</h3>
				<p class="text-sm text-gray-400 font-mono">
					No journeys match current filter criteria
				</p>
			</div>
		</div>
	</div>
{:else}
	<!-- Status Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-2 sm:space-y-0">
		<div class="flex items-center space-x-3">
			<div class="w-2 h-2 bg-blue-400 animate-pulse"></div>
			<span class="text-xs sm:text-sm text-gray-400 tracking-wider font-mono">
				LIVE.ROUTES
			</span>
			<div class="h-3 w-px bg-gray-600"></div>
			<span class="text-xs sm:text-sm text-gray-300 font-bold">
				{filteredCount} ENTRIES
			</span>
		</div>
		
		{#if filteredCount !== totalJourneys}
			<div class="flex items-center space-x-2 text-xs text-orange-400">
				<span class="font-mono">FILTERED:</span>
				<span class="text-white">{filteredCount}/{totalJourneys}</span>
			</div>
		{/if}
	</div>

	<!-- Journeys Grid -->
	<div class="space-y-2">
		{#each $filteredJourneys as journey}
			<JourneyCard {journey} />
		{/each}
	</div>
{/if}

{#if totalJourneys > 0}
	<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-800/30">
		<div class="text-center sm:text-left text-xs text-gray-400 font-mono">
			{filteredCount}/{totalJourneys} ROUTES DISPLAYED
		</div>
		<div class="flex gap-2 sm:gap-3">
			<Button
				variant="secondary"
				disabled={!hasPrev}
				onClick={() => hasPrev && onPaginate('prev')}
			>
				<span class="text-xs">◀ EARLIER</span>
			</Button>
			<Button
				variant="secondary"
				disabled={!hasNext}
				onClick={() => hasNext && onPaginate('next')}
			>
				<span class="text-xs">LATER ▶</span>
			</Button>
		</div>
	</div>
{/if}
