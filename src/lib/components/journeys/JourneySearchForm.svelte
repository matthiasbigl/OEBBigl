<script lang="ts">
	import { goto } from '$app/navigation';
	import StationSearchField from '../search/StationSearchField.svelte';
	import Button from '../ui/Button.svelte';
	import SectionSeparator from '../ui/SectionSeparator.svelte';
	import { journeyForm, journeyActions, isJourneySearching, maxJourneyTransfers } from '$lib/stores';
	import { get } from 'svelte/store';

	const formStore = journeyForm;
	const searching = isJourneySearching;

	const handleFromSelect = async (stationName: string) => {
		journeyActions.updateForm({ from: stationName });
		await submit();
	};

	const handleToSelect = async (stationName: string) => {
		journeyActions.updateForm({ to: stationName });
		await submit();
	};

	const submit = async () => {
		const formState = get(formStore);
		const targetUrl = journeyActions.handleJourneySearch(formState);
		if (!targetUrl) {
			return;
		}

		try {
			await goto(targetUrl, { invalidateAll: true });
		} finally {
			journeyActions.setIsSearching(false);
		}
	};

	const swapStations = () => {
		journeyActions.swapStations();
	};

	const toggleSearchType = () => {
		journeyActions.updateForm({ isArrival: !get(formStore).isArrival });
	};

	const handleDateChange = (event: Event) => {
		const value = (event.target as HTMLInputElement).value;
		journeyActions.updateForm({ date: value });
	};

	const handleTimeChange = (event: Event) => {
		const value = (event.target as HTMLInputElement).value;
		journeyActions.updateForm({ time: value });
	};

	const handleMaxTransfers = (event: Event) => {
		const value = (event.target as HTMLSelectElement).value;
		const numValue = value ? parseInt(value, 10) : null;
		console.log('[JourneySearchForm] handleMaxTransfers:', { value, numValue });
		// Update both stores to keep them in sync
		journeyActions.setMaxTransfers(numValue);
	};
</script>

<div class="space-y-4 sm:space-y-5">
	<SectionSeparator label="DEFINE.ROUTE" color="cyan-400" />

	<div class="grid gap-3 sm:gap-4 md:grid-cols-2">
		<div class="space-y-1.5 sm:space-y-2">
			<label class="text-[0.65rem] sm:text-xs text-gray-500 font-mono tracking-widest">FROM</label>
			<StationSearchField
				value={$formStore.from}
				placeholder="ORIGIN STATION"
				on:input={(event) => journeyActions.updateForm({ from: event.detail.value })}
				on:select={(event) => handleFromSelect(event.detail.station.name)}
				disabled={$searching}
				label={null}
			/>
		</div>

		<div class="space-y-1.5 sm:space-y-2">
			<label class="text-[0.65rem] sm:text-xs text-gray-500 font-mono tracking-widest">TO</label>
			<StationSearchField
				value={$formStore.to}
				placeholder="DESTINATION STATION"
				on:input={(event) => journeyActions.updateForm({ to: event.detail.value })}
				on:select={(event) => handleToSelect(event.detail.station.name)}
				disabled={$searching}
				label={null}
			/>
		</div>
	</div>

	<!-- Swap Button - Full Width on Mobile -->
	<button
		type="button"
		on:click={swapStations}
		class="w-full sm:w-auto px-3 py-2.5 sm:py-2 border border-gray-600 bg-black/40 hover:bg-gray-900/40 active:bg-gray-900/60 transition-all duration-200 text-[0.65rem] sm:text-xs font-mono text-gray-300 uppercase touch-manipulation"
		disabled={$searching}
	>
		↕ SWAP.STATIONS
	</button>

	<!-- Date/Time Section -->
	<div class="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
		<div class="space-y-1.5 sm:space-y-2">
			<label class="text-[0.65rem] sm:text-xs text-gray-500 font-mono tracking-widest">DATE</label>
			<input
				type="date"
				value={$formStore.date}
				on:change={handleDateChange}
				disabled={$searching}
				class="w-full bg-black/60 border border-gray-600 text-gray-100 px-3 py-2.5 sm:py-2 font-mono text-sm focus:outline-none focus:border-gray-400 touch-manipulation"
			/>
		</div>
		<div class="space-y-1.5 sm:space-y-2">
			<label class="text-[0.65rem] sm:text-xs text-gray-500 font-mono tracking-widest">TIME</label>
			<input
				type="time"
				value={$formStore.time}
				on:change={handleTimeChange}
				disabled={$searching}
				class="w-full bg-black/60 border border-gray-600 text-gray-100 px-3 py-2.5 sm:py-2 font-mono text-sm focus:outline-none focus:border-gray-400 touch-manipulation"
			/>
		</div>
	</div>

	<!-- Search Type Toggle -->
	<button
		type="button"
		on:click={toggleSearchType}
		class="w-full sm:w-auto px-4 py-2.5 sm:py-2 border-2 border-cyan-500/50 bg-cyan-900/20 hover:bg-cyan-900/40 active:bg-cyan-900/60 transition-all duration-200 text-[0.65rem] sm:text-xs font-mono text-cyan-200 uppercase font-bold tracking-wider touch-manipulation"
		disabled={$searching}
	>
		{$formStore.isArrival ? '📍 ARRIVE BY' : '🚀 DEPART AT'}
	</button>

	<!-- Max Transfers -->
	<div class="space-y-1.5 sm:space-y-2">
		<label class="text-[0.65rem] sm:text-xs text-gray-500 font-mono tracking-widest">MAX.TRANSFERS</label>
		<select
			value={$maxJourneyTransfers ?? ''}
			on:change={handleMaxTransfers}
			disabled={$searching}
			class="w-full bg-black/60 border border-gray-600 text-gray-100 px-3 py-2.5 sm:py-2 font-mono text-sm focus:outline-none focus:border-gray-400 hover:border-gray-500 transition-colors touch-manipulation"
		>
			<option value="">ANY</option>
			<option value="0">DIRECT ONLY</option>
			<option value="1">MAX 1 TRANSFER</option>
			<option value="2">MAX 2 TRANSFERS</option>
			<option value="3">MAX 3 TRANSFERS</option>
		</select>
	</div>

	<!-- Submit Button - Full Width on Mobile -->
	<div class="pt-2">
		<Button variant="primary" size="lg" onClick={submit} disabled={$searching}>
			<span class="text-xs sm:text-sm font-bold tracking-wider">
				{$searching ? '⚡ CALCULATING...' : '🎯 CALCULATE.ROUTE'}
			</span>
		</Button>
	</div>
</div>
