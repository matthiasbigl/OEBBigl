<script lang="ts">
	import type { PageData } from './$types';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import CollapsibleJourneySearchSection from '$lib/components/journeys/CollapsibleJourneySearchSection.svelte';
	import JourneySearchForm from '$lib/components/journeys/JourneySearchForm.svelte';
	import JourneySummaryPanel from '$lib/components/journeys/JourneySummaryPanel.svelte';
	import JourneyList from '$lib/components/journeys/JourneyList.svelte';
	import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import {
		journeyActions,
		journeyResults,
		journeyError,
		journeyPagination,
		journeyMetadata,
		isJourneySearching,
		activeJourneyProductFilters,
		maxJourneyTransfers
	} from '$lib/stores';
	import {
		createPageAnimations,
		type AnimationController
	} from '$lib/utils/animations';

	export let data: PageData;

	let headerRef: HTMLElement;
	let searchContainer: HTMLElement;
	let statusContainer: HTMLElement;
	let journeysContainer: HTMLElement;

	let pageAnimationController: AnimationController | null = null;

	const hasQuery = () => Boolean(data.from && data.to);

	const parseWhenToInputs = (when: string | null | undefined): { date: string; time: string } => {
		const now = when ? new Date(when) : new Date();
		const pad = (value: number) => value.toString().padStart(2, '0');
		return {
			date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
			time: `${pad(now.getHours())}:${pad(now.getMinutes())}`
		};
	};

	// Reactive statement - automatically syncs when data changes
	$: if (browser && data.result) {
		journeyActions.initializeFromData(data.result);
		journeyActions.setIsSearching(false);
	}

	$: if (browser && !data.result && hasQuery()) {
		const { date, time } = parseWhenToInputs(data.when);
		journeyActions.updateForm({
			from: data.from ?? '',
			to: data.to ?? '',
			date,
			time,
			isArrival: Boolean(data.isArrival),
			products: data.products ?? [],
			maxTransfers: data.maxTransfers ?? null
		});
		activeJourneyProductFilters.set(new Set((data.products ?? []).map(product => product.toLowerCase())));
		maxJourneyTransfers.set(data.maxTransfers ?? null);
		journeyActions.setIsSearching(false);
	}

	$: if (browser && !data.result && !hasQuery()) {
		journeyActions.resetForm();
		journeyActions.setIsSearching(false);
	}

	const handlePaginate = async (direction: 'next' | 'prev') => {
		if (!browser) return;
		
		try {
			const target = journeyActions.handlePagination(direction);
			if (!target) {
				console.warn('No pagination target available');
				return;
			}
			
			journeyActions.setIsSearching(true);
			await goto(target, { invalidateAll: true });
		} catch (error) {
			console.error('Pagination error:', error);
			journeyActions.setIsSearching(false);
 		}
};

	onMount(() => {
		if (!browser) return;

		if (headerRef && searchContainer) {
			try {
				pageAnimationController = createPageAnimations({
					headerRef,
					searchContainer,
					stationContainer: statusContainer,
					departuresContainer: journeysContainer
				});
				pageAnimationController.initialize();
			} catch (error) {
				console.error('Animation initialization error:', error);
			}
		}
	});

	onDestroy(() => {
		pageAnimationController?.cleanup();
	});
</script>

<svelte:head>
	<title>Journey Planner - ÖBB Trip Planning Console</title>
	<meta name="description" content="Plan your journey across Austria's rail network. Search stations, view detailed itineraries with transfer times, and inspect platform information. Complete HAFAS integration." />
	<meta name="keywords" content="journey planner, trip planner, ÖBB routes, train itinerary, Austria travel" />
	<meta name="author" content="Cyber Station Network" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
	<meta name="theme-color" content="#000000">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
	<link rel="canonical" href="https://oebbigl.vercel.app/journeys" />
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://oebbigl.vercel.app/journeys" />
	<meta property="og:title" content="Journey Planner - ÖBB Trip Planning Console" />
	<meta property="og:description" content="Plan your journey across Austria's rail network. Search stations, view detailed itineraries with transfer times, and inspect platform information. Complete HAFAS integration." />
	<meta property="og:image" content="/og-image.png" />
	<meta property="og:locale" content="en_US" />
	<meta property="og:site_name" content="Cyber Station Control Hub" />
	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://oebbigl.vercel.app/journeys" />
	<meta name="twitter:title" content="Journey Planner - ÖBB Trip Planning Console" />
	<meta name="twitter:description" content="Plan your journey across Austria's rail network. Search stations, view detailed itineraries with transfer times, and inspect platform information. Complete HAFAS integration." />
	<meta name="twitter:image" content="/og-image.png" />
	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: 'Journey Planner - ÖBB Trip Planning Console',
		description: 'Plan your journey across Austria\'s rail network. Search stations, view detailed itineraries with transfer times, and inspect platform information. Complete HAFAS integration.',
		url: 'https://oebbigl.vercel.app/journeys',
		keywords: 'journey planner, trip planner, ÖBB routes, train itinerary, Austria travel',
		inLanguage: 'en',
		isPartOf: 'https://oebbigl.vercel.app/'
	})}</script>`}
</svelte:head>

<div class="min-h-screen text-gray-100 font-mono relative overflow-hidden">
	<div class="scanline fixed w-full h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-20 pointer-events-none"></div>
	<div class="scanline fixed w-full h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-20 pointer-events-none" style="animation-delay: 0.5s;"></div>
	<div class="scanline fixed w-full h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-20 pointer-events-none" style="animation-delay: 1s;"></div>

	<div class="fixed inset-0 pointer-events-none bg-noise"></div>

	<div class="relative z-10 min-h-screen flex flex-col">
		<!-- Skip Navigation Links -->
		<div class="sr-only focus-within:not-sr-only focus-within:absolute focus-within:left-4 focus-within:top-4 focus-within:z-50 focus-within:flex focus-within:gap-2">
			<a
				href="#journey-search"
				class="bg-cyan-400 px-4 py-2 text-black font-bold hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-600"
			>
				Skip to journey search
			</a>
			<a
				href="#journey-results"
				class="bg-cyan-400 px-4 py-2 text-black font-bold hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-600"
			>
				Skip to results
			</a>
		</div>
		
		<header bind:this={headerRef} class="px-3 py-4 sm:px-6 lg:px-8">
			<div class="max-w-6xl mx-auto">
				<div class="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent mb-4"></div>
				<div class="text-center space-y-1.5">
					<h1 class="text-xl sm:text-2xl lg:text-3xl font-title tracking-wider text-white">
						CYBER ROUTER
					</h1>
					<div class="text-[0.65rem] sm:text-xs text-gray-400 tracking-widest">
						INTERCITY JOURNEY MATRIX
					</div>
					<div class="text-[0.6rem] sm:text-xs text-gray-600">
						[SYSTEM.ONLINE] → CALCULATING OPTIMAL TRANSIT PATHS
					</div>
				</div>
				<div class="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent mt-4"></div>
			</div>
		</header>

		<div id="journey-search" bind:this={searchContainer} class="px-3 py-3 sm:px-6 lg:px-8 relative z-20">
			<div class="max-w-6xl mx-auto">
				<CollapsibleJourneySearchSection>
					<JourneySearchForm />
				</CollapsibleJourneySearchSection>
			</div>
		</div>

		{#if hasQuery()}
			<div bind:this={statusContainer} class="px-3 py-3 sm:px-6 lg:px-8 relative z-10">
				<div class="max-w-6xl mx-auto">
					<JourneySummaryPanel
						fromLocation={data.result?.fromLocation}
						toLocation={data.result?.toLocation}
						metadata={$journeyMetadata}
					/>
				</div>
			</div>
		{/if}

		{#if $journeyError && hasQuery()}
			<div class="px-3 py-3 sm:px-6 lg:px-8">
				<div class="max-w-6xl mx-auto">
					<ErrorMessage error={$journeyError} />
				</div>
			</div>
		{/if}

		<div id="journey-results" bind:this={journeysContainer} class="flex-1 px-3 py-3 sm:px-6 lg:px-8 pb-20">
			<div class="max-w-6xl mx-auto">
			<div class="border border-gray-700/50 bg-black/40 backdrop-blur-sm min-h-[50vh]">
			<div class="border-b border-gray-700/50 px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-900/20">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
			<div class="flex items-center space-x-2 sm:space-x-3">
			<div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 pulse-element {$isJourneySearching ? 'animate-pulse' : ''}"></div>
			<span class="text-[0.65rem] sm:text-xs text-gray-300 tracking-wider">JOURNEY.RESULTS</span>
			{#if $journeyMetadata?.totalCount}
			<div class="h-3 sm:h-4 w-px bg-gray-700"></div>
			<span class="text-[0.65rem] sm:text-xs text-gray-500">
			 {$journeyMetadata.totalCount} ROUTES
			</span>
			{/if}
			</div>
			<!-- Accessibility: aria-live region for journey results -->
			<div aria-live="polite" aria-atomic="true" class="sr-only">
			 Journey results updated. Showing {$journeyMetadata?.totalCount ?? 0} routes.
			</div>
			{#if $journeyPagination?.totalResults}
			<div class="text-[0.6rem] sm:text-xs text-gray-500">
			 CONTEXT: {$journeyPagination.currentContext ?? 'INITIAL'}
			</div>
			{/if}
			</div>
			</div>

			<div class="p-3 sm:p-4">
			<JourneyList
			 totalJourneys={$journeyResults.length}
			 isSearching={$isJourneySearching}
			 error={$journeyError}
			 pagination={$journeyPagination}
			 onPaginate={handlePaginate}
			/>
			</div>
			</div>
			</div>
		</div>
	</div>
</div>

{#if $isJourneySearching}
	<div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
		<div class="border border-gray-700 bg-black/90 p-8 max-w-sm mx-4">
			<div class="text-center space-y-4">
				<LoadingSpinner size="lg" color="white" />
				<div class="text-sm text-gray-200 tracking-wider">CALCULATING ROUTES</div>
				<div class="text-xs text-gray-500">SYNCHRONIZING WITH RAIL NETWORK...</div>
			</div>
		</div>
	</div>
{/if}

