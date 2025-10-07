<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { browser } from '$app/environment';
	import StationSuggestions from './StationSuggestions.svelte';
	import { searchAnimations, cleanupElementAnimations } from '$lib/utils/animations';
	import type { Station } from '$lib/server/hafas';

	export let value: string = '';
	export let placeholder: string = 'ENTER STATION NAME...';
	export let label: string | null = null;
	export let disabled: boolean = false;
	export let minQueryLength: number = 2;
	export let autoFocus: boolean = false;
	export let name: string | null = null;
	export let prompt: string = '$>';
	export let showPrompt: boolean = true;
	export let debounce: number = 300;

	const dispatch = createEventDispatcher<{
		input: { value: string };
		change: { value: string };
		submit: { value: string; station?: Station };
		select: { station: Station };
	}>();

	let inputRef: HTMLInputElement;
	let suggestions: Station[] = [];
	let isLoading = false;
	let showSuggestionList = false;
	let selectedIndex = -1;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let abortController: AbortController | null = null;

	$: currentValue = value ?? '';
	$: if (selectedIndex >= suggestions.length) {
		selectedIndex = suggestions.length > 0 ? suggestions.length - 1 : -1;
	}

	function updateValue(newValue: string, emitChange = true) {
		value = newValue;
		if (emitChange) {
			dispatch('input', { value: newValue });
			dispatch('change', { value: newValue });
		}
	}

	function clearSuggestions(delay = 0) {
		const reset = () => {
			suggestions = [];
			showSuggestionList = false;
			selectedIndex = -1;
			isLoading = false;
		};
		if (delay > 0) {
			setTimeout(reset, delay);
		} else {
			reset();
		}
	}

	async function fetchSuggestions(query: string) {
		if (!browser) return;

		abortController?.abort();
		abortController = new AbortController();

		isLoading = true;

		try {
			const response = await fetch(`/api/stations?q=${encodeURIComponent(query)}`, {
				signal: abortController.signal
			});

			if (!response.ok) {
				throw new Error('Failed to fetch station suggestions');
			}

			const data = await response.json();
			suggestions = data.stations ?? [];
			showSuggestionList = suggestions.length > 0;
		} catch (error) {
			if ((error as Error).name === 'AbortError') return;
			suggestions = [];
			showSuggestionList = false;
		} finally {
			isLoading = false;
		}
	}

	function scheduleSuggestionFetch(query: string) {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
		if (!query || query.trim().length < minQueryLength) {
			clearSuggestions();
			return;
		}

		debounceTimer = setTimeout(() => {
			fetchSuggestions(query.trim());
		}, debounce);
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const newValue = target.value;
		value = newValue;
		dispatch('input', { value: newValue });
		scheduleSuggestionFetch(newValue);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!showSuggestionList || suggestions.length === 0) {
			if (event.key === 'Enter') {
				event.preventDefault();
				commitSubmission();
			}
			return;
		}

		switch (event.key) {
			case 'ArrowDown': {
				event.preventDefault();
				selectedIndex = (selectedIndex + 1) % suggestions.length;
				const station = suggestions[selectedIndex];
				if (station) {
					updateValue(station.name, false);
				}
				break;
			}
			case 'ArrowUp': {
				event.preventDefault();
				selectedIndex = selectedIndex <= 0 ? suggestions.length - 1 : selectedIndex - 1;
				const station = suggestions[selectedIndex];
				if (station) {
					updateValue(station.name, false);
				}
				break;
			}
			case 'Enter': {
				event.preventDefault();
				const station = selectedIndex >= 0 ? suggestions[selectedIndex] : null;
				if (station) {
					handleSuggestionSelect(station);
				} else {
					commitSubmission();
				}
				break;
			}
			case 'Escape': {
				clearSuggestions();
				break;
			}
		}
	}

	function handleSuggestionSelect(station: Station) {
		updateValue(station.name);
		selectedIndex = -1;
		showSuggestionList = false;
		suggestions = [];
		dispatch('select', { station });
		dispatch('submit', { value: station.name, station });
	}

	function handleSuggestionHover(index: number) {
		selectedIndex = index;
	}

	function commitSubmission() {
		const trimmed = (value ?? '').trim();
		if (!trimmed) return;
		dispatch('submit', { value: trimmed });
		clearSuggestions();
	}

	function handleFocus() {
		if (!browser || !inputRef) return;
		searchAnimations.inputFocus(inputRef);
		if (value.trim().length >= minQueryLength && suggestions.length === 0) {
			fetchSuggestions(value.trim());
		} else {
			showSuggestionList = suggestions.length > 0;
		}
	}

	function handleBlur() {
		if (!browser || !inputRef) return;
		searchAnimations.inputBlur(inputRef);
		clearSuggestions(150);
	}

	onMount(() => {
		if (!browser || !inputRef) return;
		if (autoFocus) {
			setTimeout(() => inputRef?.focus(), 0);
		}
	});

	onDestroy(() => {
		cleanupElementAnimations([inputRef]);
		abortController?.abort();
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
	});
</script>

<div class="space-y-2">
	{#if label}
		<div class="text-xs text-gray-500 font-mono tracking-wider uppercase">{label}</div>
	{/if}

	<div class="relative">
		{#if showPrompt}
			<div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm pointer-events-none z-10">
				{prompt}
			</div>
		{/if}

		<input
			name={name}
			type="text"
			bind:this={inputRef}
			value={currentValue}
			on:input={handleInput}
			on:keydown={handleKeyDown}
			on:focus={handleFocus}
			on:blur={handleBlur}
			placeholder={placeholder}
			disabled={disabled}
			autocomplete="off"
			class="w-full pl-12 pr-4 py-3 bg-black/60 border border-gray-600 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-all duration-200 font-mono text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
			role="combobox"
			aria-expanded={showSuggestionList}
			aria-haspopup="listbox"
		/>

		<StationSuggestions
			suggestions={suggestions}
			loading={isLoading}
			visible={showSuggestionList || isLoading}
			selectedIndex={selectedIndex}
			onSelect={handleSuggestionSelect}
			onHover={handleSuggestionHover}
		/> 
	</div>
</div>
