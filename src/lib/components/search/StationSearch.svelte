<script lang="ts">
	import Button from '../ui/Button.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { searchAnimations, cleanupElementAnimations } from '$lib/utils/animations';
	import { isSearching, currentStation, searchActions } from '$lib/stores/searchStore';
	
	export let stationName: string;

	let inputValue = stationName;
	let inputRef: HTMLInputElement;
	let formRef: HTMLFormElement;
	let lastStationName = stationName;

	// Only update input value when the station name prop changes (not when user types)
	$: if (stationName !== lastStationName) {
		inputValue = stationName;
		lastStationName = stationName;
	}

	const handleSubmit = () => {
		if (inputValue.trim()) {
			searchActions.handleStationSearch(inputValue.trim());
		}
	};
	
	onMount(() => {
		if (!browser || !inputRef) return;
		
		// Add focus/blur animations using our animation system
		const handleFocus = () => {
			if (browser && inputRef) {
				searchAnimations.inputFocus(inputRef);
			}
		};
		
		const handleBlur = () => {
			if (browser && inputRef) {
				searchAnimations.inputBlur(inputRef);
			}
		};
		
		inputRef.addEventListener('focus', handleFocus);
		inputRef.addEventListener('blur', handleBlur);
		
		return () => {
			if (inputRef) {
				inputRef.removeEventListener('focus', handleFocus);
				inputRef.removeEventListener('blur', handleBlur);
			}
		};
	});
	
	onDestroy(() => {
		cleanupElementAnimations([inputRef]);
	});
</script>


<div class="w-full">
	<form bind:this={formRef} on:submit|preventDefault={handleSubmit} class="space-y-4">
		<!-- Input Field with Terminal Styling -->
		<div class="relative">
			<!-- Terminal Prompt -->
			<div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-mono text-sm pointer-events-none">
				$&gt;
			</div>
			
			<input 
				bind:this={inputRef}
				type="text" 
				bind:value={inputValue}
				placeholder="ENTER STATION NAME..."
				disabled={$isSearching}
				class="w-full pl-12 pr-4 py-3 bg-black/60 border border-gray-600 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-all duration-200 font-mono text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
			>
			
			<!-- Input Border Effect -->
			<div class="absolute inset-0 border border-gray-600 pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100"></div>
		</div>
		
		<!-- Submit Button -->
		<div class="flex justify-center">
			<Button variant="primary" onClick={handleSubmit} disabled={$isSearching}>
				{$isSearching ? 'SEARCHING...' : 'EXECUTE.SEARCH'}
			</Button>
		</div>
	</form>
	
	<!-- Help Text -->
	<div class="mt-3 text-center space-y-1">
		<span class="text-xs text-gray-500 font-mono">
			// Type station name and press EXECUTE.SEARCH
		</span>
		{#if browser && !inputValue && searchActions.getLastVisitedStation()}
			<div class="text-xs text-blue-400 font-mono">
				LAST: {searchActions.getLastVisitedStation()}
			</div>
			<button
				on:click={() => searchActions.handleStationSearch(searchActions.getLastVisitedStation())}
				class="text-xs text-cyan-400 hover:text-cyan-200 transition-colors duration-200 font-mono underline"
				disabled={$isSearching}
			>
				RETURN.TO.LAST
			</button>
		{/if}
	</div>
</div>
