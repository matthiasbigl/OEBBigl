<script lang="ts">
	import Button from '../ui/Button.svelte';
	import StationSearchField from './StationSearchField.svelte';
	import { isSearching, searchActions } from '$lib/stores/searchStore';
	import { browser } from '$app/environment';

	export let stationName: string;

	let inputValue = stationName;
	let lastStationName = stationName;

	$: if (stationName !== lastStationName) {
		inputValue = stationName;
		lastStationName = stationName;
	}

	const handleSubmit = (value: string) => {
		if (value.trim()) {
			searchActions.handleStationSearch(value.trim());
		}
	};

	const handleSelect = (event: CustomEvent<{ station: { name: string } }>) => {
		const station = event.detail.station?.name;
		if (station) {
			handleSubmit(station);
		}
	};

	const handleReturnToLast = () => {
		const last = searchActions.getLastVisitedStation();
		if (last) {
			handleSubmit(last);
		}
	};
</script>

<div class="w-full space-y-4">
	<StationSearchField
		value={inputValue}
		on:input={(event) => (inputValue = event.detail.value)}
		on:change={(event) => (inputValue = event.detail.value)}
		on:submit={(event) => handleSubmit(event.detail.value)}
		on:select={handleSelect}
		disabled={$isSearching}
		placeholder="ENTER STATION NAME..."
	/>

	<div class="flex justify-center">
		<Button variant="primary" onClick={() => handleSubmit(inputValue)} disabled={$isSearching}>
			{$isSearching ? 'SEARCHING...' : 'EXECUTE.SEARCH'}
		</Button>
	</div>

	<div class="mt-3 text-center space-y-1">
		<span class="text-xs text-gray-500 font-mono">
			// Type station name and press EXECUTE.SEARCH
		</span>
		{#if browser && !inputValue && searchActions.getLastVisitedStation()}
			<div class="text-xs text-blue-400 font-mono">
				LAST: {searchActions.getLastVisitedStation()}
			</div>
			<button
				on:click={handleReturnToLast}
				class="text-xs text-cyan-400 hover:text-cyan-200 transition-colors duration-200 font-mono underline"
				disabled={$isSearching}
			>
				RETURN.TO.LAST
			</button>
		{/if}
	</div>
</div>
