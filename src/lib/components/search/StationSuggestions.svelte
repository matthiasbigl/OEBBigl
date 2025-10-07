<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { 
		searchAnimations, 
		cleanupElementAnimations, 
		quickAnimations,
		useFadeIn,
		ANIMATION_CONFIG 
	} from '$lib/utils/animations';
	import type { Station } from '$lib/server/hafas';
	import { 
		searchSuggestions, 
		isLoadingSuggestions, 
		selectedSuggestionIndex, 
		showSuggestions,
		searchActions 
	} from '$lib/stores/searchStore';

	// Optional overrides for custom suggestion flows (e.g., journey planner)
	export let suggestions: Station[] | null = null;
	export let loading: boolean | null = null;
	export let visible: boolean | null = null;
	export let selectedIndex: number | null = null;
	export let onSelect: ((station: Station) => void) | null = null;
	export let onHover: ((index: number) => void) | null = null;
	export let footerHint: string | null = null;

	let suggestionsRef: HTMLDivElement;
	let suggestionRefs: HTMLElement[] = [];

	// Derived state depending on overrides or global stores
	let suggestionsList: Station[] = [];
	let isLoadingState = false;
	let isVisible = false;
	let activeIndex = -1;

	$: suggestionsList = suggestions !== null ? suggestions : $searchSuggestions;
	$: isLoadingState = loading !== null ? loading : $isLoadingSuggestions;
	$: activeIndex = selectedIndex !== null ? selectedIndex : $selectedSuggestionIndex;
	$: isVisible = visible !== null ? visible : ($showSuggestions && (suggestionsList.length > 0 || isLoadingState));
	$: footerText = footerHint ?? `${suggestionsList.length} result${suggestionsList.length !== 1 ? 's' : ''}`;

	// Scroll selected item into view
	$: if (browser && activeIndex >= 0 && suggestionRefs[activeIndex]) {
		suggestionRefs[activeIndex].scrollIntoView({
			block: 'nearest',
			behavior: 'smooth'
		});
	}

	// Handle suggestion click
	const handleSuggestionClick = (station: Station) => {
		const buttonElement = suggestionRefs[suggestionRefs.length - 1];
		if (buttonElement) {
			quickAnimations.buttonPress(buttonElement);
		}
		if (onSelect) {
			onSelect(station);
		} else {
			searchActions.selectSuggestion(station);
		}
	};

	// Handle mouse enter for hover effects
	const handleMouseEnter = (index: number) => {
		if (onHover) {
			onHover(index);
		} else {
			selectedSuggestionIndex.set(index);
		}
		
		// Add subtle hover animation
		const element = suggestionRefs[index];
		if (element && browser) {
			quickAnimations.fadeIn(element);
		}
	};

	onMount(() => {
		if (!browser || !suggestionsRef) return;
		
		// Add entrance animation for the container
		useFadeIn(suggestionsRef, { 
			duration: ANIMATION_CONFIG.QUICK,
			ease: ANIMATION_CONFIG.EASING.SMOOTH 
		});
		
		// Stagger animate suggestion items when they become available
		if (suggestionRefs.length > 0) {
			searchAnimations.suggestionsEntrance(suggestionsRef, suggestionRefs);
		}
	});

	// Animate suggestions when they change
	$: if (browser && isVisible && suggestionsList.length > 0 && suggestionRefs.length > 0) {
		// Small delay to ensure DOM is updated
		setTimeout(() => {
			searchAnimations.suggestionsEntrance(suggestionsRef, suggestionRefs);
		}, 50);
	}

	onDestroy(() => {
		if (suggestionsRef) {
			cleanupElementAnimations([suggestionsRef]);
		}
		if (suggestionRefs.length > 0) {
			cleanupElementAnimations(suggestionRefs);
		}
	});
</script>

{#if isVisible}
	<div 
		bind:this={suggestionsRef}
		class="absolute top-full left-0 right-0 z-50 mt-1 bg-black/90 border border-gray-600 backdrop-blur-sm max-h-64 shadow-xl rounded-sm flex flex-col"
		role="listbox"
	>
		{#if isLoadingState}
			<!-- Loading State -->
			<div class="p-3 flex items-center space-x-3 text-gray-400">
				<div class="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
				<span class="text-sm font-mono">Searching stations...</span>
			</div>
		{:else}
			<!-- Suggestions List with controlled overflow -->
			<div class="overflow-y-auto flex-1 min-h-0">
				{#each suggestionsList as station, index (station.id)}
				<button
					bind:this={suggestionRefs[index]}
					class="w-full px-4 py-3 text-left hover:bg-gray-800/50 transition-all duration-300 border-b border-gray-700/50 last:border-b-0 group {activeIndex === index ? 'bg-gray-700/70 transform scale-[1.02]' : ''}"
					on:click={() => handleSuggestionClick(station)}
					on:mouseenter={() => handleMouseEnter(index)}
					role="option"
					aria-selected={activeIndex === index}
					style="opacity: 0; transform: translateY(10px);"
				>
					<div class="flex items-center justify-between">
						<!-- Station Info -->
						<div class="flex-1 min-w-0">
							<div class="flex items-center space-x-2">
								<!-- Station Icon -->
								<div class="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 transition-all duration-300 {activeIndex === index ? 'pulse-element bg-cyan-400 scale-125' : ''}"></div>
								
								<!-- Station Name -->
								<span class="text-gray-100 font-mono text-sm truncate transition-colors duration-300 {activeIndex === index ? 'text-white' : ''}">
									{station.name}
								</span>
							</div>
							
							<!-- Station ID (subtle) -->
							<div class="mt-1 text-xs text-gray-500 font-mono pl-4">
								ID: {station.id}
							</div>
						</div>
						
						<!-- Available Products (Transportation Types) -->
						{#if station.products && Object.keys(station.products).length > 0}
							<div class="flex items-center space-x-1 ml-3 flex-shrink-0">
								{#each Object.entries(station.products) as [product, available]}
									{#if available}
										<span class="px-1.5 py-0.5 text-xs bg-gray-700/50 text-gray-300 rounded font-mono">
											{product.substring(0, 3).toUpperCase()}
										</span>
									{/if}
								{/each}
							</div>
						{/if}
						
						<!-- Selection Indicator -->
						{#if activeIndex === index}
							<div class="ml-3 text-blue-400 flex-shrink-0 animate-pulse">
								<span class="text-sm transition-transform duration-300 transform scale-110">→</span>
							</div>
						{/if}
					</div>
				</button>
				{/each}

			</div>
			
			<!-- Footer with keyboard hint - always visible -->
			{#if suggestionsList.length > 0}
				<div class="px-4 py-2 border-t border-gray-700/50 bg-gray-900/30 flex-shrink-0 animate-fadeIn">
					<div class="text-xs text-gray-500 font-mono flex items-center justify-between">
						<span class="animate-pulse">↑↓ Navigate • Enter Select • Esc Close</span>
						<span class="text-gray-600">{footerText}</span>
					</div>
				</div>
			{/if}
		{/if}
	</div>
{/if}

<style>
	/* Custom scrollbar for suggestions */
	div::-webkit-scrollbar {
		width: 4px;
	}
	
	div::-webkit-scrollbar-track {
		background: rgba(55, 65, 81, 0.1);
	}
	
	div::-webkit-scrollbar-thumb {
		background: rgba(107, 114, 128, 0.5);
		border-radius: 2px;
	}
	
	div::-webkit-scrollbar-thumb:hover {
		background: rgba(107, 114, 128, 0.7);
	}
	
	/* Pulse animation for selected item */
	.pulse-element {
		animation: pulse 2s infinite;
	}
	
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
	
	/* Fade in animation */
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.animate-fadeIn {
		animation: fadeIn 0.3s ease-out;
	}
	
	/* Smooth hover transitions */
	button:hover {
		transform: translateX(2px);
	}
	
	button:active {
		transform: scale(0.98) translateX(2px);
	}
</style>
