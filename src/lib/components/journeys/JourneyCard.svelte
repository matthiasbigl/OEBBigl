<script lang="ts">
	import type { JourneyOption, JourneyLeg } from '$lib/server/hafas';
	import JourneyTimeline from './JourneyTimeline.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { addHoverEffects, cleanupElementAnimations, animationPresets } from '$lib/utils/animations';

	export let journey: JourneyOption;

	let cardRef: HTMLElement;
	let showDetails = false;

	const formatTime = (iso: string | null): string => {
		if (!iso) return '--:--';
		return new Date(iso).toLocaleTimeString('de-DE', {
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const formatDate = (iso: string | null): string => {
		if (!iso) return '---';
		return new Date(iso).toLocaleDateString('de-DE', {
			weekday: 'short',
			day: '2-digit',
			month: '2-digit'
		}).toUpperCase();
	};

	const formatDuration = (minutes: number): string => {
		const hrs = Math.floor(minutes / 60);
		const mins = minutes % 60;
		const parts = [];
		if (hrs > 0) parts.push(`${hrs}H`);
		parts.push(`${mins}M`);
		return parts.join(' ');
	};

	const formatPlatform = (platform?: string | null): string => {
		if (!platform) return '---';
		return platform.toString().toUpperCase();
	};

	const hasLegRemarks = (leg: JourneyLeg): boolean => Array.isArray(leg.remarks) && leg.remarks.length > 0;

	const toggleDetails = () => {
		showDetails = !showDetails;
	};

	$: firstLeg = journey.legs?.[0];
	$: lastLeg = journey.legs?.[journey.legs.length - 1];
	$: serviceLabel = firstLeg?.lineName ?? firstLeg?.product ?? 'SERVICE';
	$: serviceId = firstLeg?.trainNumber ?? firstLeg?.tripId ?? journey.id;
	$: departureLabel = firstLeg?.origin?.name ?? 'START';
	$: arrivalLabel = lastLeg?.destination?.name ?? 'ZIEL';
	$: badgeProducts = journey.products.length ? journey.products : firstLeg?.product ? [firstLeg.product] : [];
	
</script>

<div
	bind:this={cardRef}
	class="border border-gray-700 bg-black/40 backdrop-blur-sm hover:border-gray-500 transition-all duration-300 cursor-pointer group overflow-hidden active:scale-[0.98]"
>
	<!-- Header with Terminal Style -->
	<div class="border-b border-gray-700 px-4 py-2 bg-gray-900/20">
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-5">
				<div class="flex flex-col">
					<div class="text-xs text-gray-400 font-mono tracking-wider">{serviceLabel}</div>
					<div class="text-xs text-gray-500 font-mono mt-0.5">
						{journey.transfers} TRANSFER{journey.transfers === 1 ? '' : 'S'}
					</div>
				</div>
			</div>
			<div class="flex items-center space-x-2 text-xs">
				<div class="w-2 h-2 bg-blue-400"></div>
				<span class="text-gray-400 font-mono">{formatDuration(journey.durationMinutes)}</span>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="p-4">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
			<!-- Route Info -->
			<div class="flex-1 min-w-0">
				<h3 class="text-lg font-bold text-white font-mono truncate group-hover:text-gray-200 transition-colors duration-200">
					{departureLabel} → {arrivalLabel}
				</h3>
				<div class="flex items-center space-x-4 mt-1 text-xs text-gray-400">
					<span class="font-mono">DEPART: {firstLeg?.departurePlatform ? `PL ${formatPlatform(firstLeg.departurePlatform)}` : 'TBA'}</span>
					<span class="text-gray-500">|</span>
					<span class="font-mono">ARRIVE: {lastLeg?.arrivalPlatform ? `PL ${formatPlatform(lastLeg.arrivalPlatform)}` : 'TBA'}</span>
				</div>
			</div>

			<!-- Time Display -->
			<div class="text-right">
				<div class="text-2xl sm:text-3xl font-bold font-mono text-blue-400 group-hover:scale-105 transition-transform duration-200">
					{formatTime(journey.departure)}
				</div>
				<div class="text-sm font-bold text-green-400 font-mono mt-1">
					→ {formatTime(journey.arrival)}
				</div>
			</div>
		</div>
	</div>

	<!-- Train Info Section -->
	<div class="border-t border-gray-700 px-4 py-3 bg-gray-900/10">
		<div class="flex items-center space-x-2 mb-2">
			<div class="w-1 h-1 bg-blue-400"></div>
			<span class="text-xs text-gray-400 font-mono tracking-wider">TRAIN.INFO</span>
		</div>
		<div class="flex flex-wrap gap-2 items-center">
			<span class="text-xs text-gray-500 font-mono">#{serviceId}</span>
			{#if badgeProducts.length}
				{#each badgeProducts as product}
					<span class="px-2 py-1 text-xs font-mono border border-gray-600 uppercase bg-gray-900/40">
						{product}
					</span>
				{/each}
			{/if}
		</div>
	</div>

	<!-- Journey Route Timeline -->
	<div class="border-t border-gray-700 px-4 py-3 bg-black/20">
		<div class="flex items-center space-x-2 mb-3">
			<div class="w-1 h-1 bg-cyan-400"></div>
			<span class="text-xs text-gray-400 font-mono tracking-wider">ROUTE.MAP</span>
		</div>
		<JourneyTimeline {journey} />
	</div>

	{#if journey.remarks?.length}
		<div class="border-t border-gray-700 px-4 py-3 bg-gray-900/10">
			<div class="flex items-center space-x-2 mb-2">
				<div class="w-1 h-1 bg-orange-400 animate-pulse"></div>
				<span class="text-xs text-gray-400 font-mono tracking-wider">ALERTS</span>
			</div>
			<div class="space-y-1">
				{#each journey.remarks as remark}
					<div class="text-xs text-orange-300 font-mono bg-orange-900/20 border-l-2 border-orange-600 pl-3 py-1">
						{remark}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div class="border-t border-gray-700 bg-gray-900/10 px-4 py-3">
		<button
			on:click={toggleDetails}
			class="w-full text-center py-2 text-xs font-mono text-gray-400 hover:text-gray-200 transition-colors duration-200 touch-manipulation border border-gray-700 hover:border-gray-500 bg-black/40 hover:bg-gray-800/40 active:bg-gray-700/40"
		>
			{showDetails ? '▲ HIDE SEGMENT DETAILS' : '▼ SHOW SEGMENT DETAILS'}
		</button>

		{#if showDetails}
			<div class="mt-3 space-y-2 sm:space-y-3">
				{#each journey.legs as leg, index}
					<div class="border border-gray-700/40 bg-black/30 p-2.5 sm:p-3 space-y-2">
						<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
							<div class="space-y-0.5 sm:space-y-1">
								<div class="text-[0.6rem] sm:text-xs text-gray-500 font-mono">SEGMENT {index + 1}</div>
								<div class="text-xs sm:text-sm font-mono text-white font-bold">
									{leg.lineName ?? leg.product ?? 'UNKNOWN'}
								</div>
								<div class="text-[0.6rem] sm:text-xs text-gray-500 font-mono uppercase truncate">
									→ {leg.direction ?? 'NO DIRECTION'}
								</div>
							</div>
							<div class="text-left sm:text-right text-[0.6rem] sm:text-xs text-gray-400 font-mono">
								PL {formatPlatform(leg.departurePlatform)} → {formatPlatform(leg.arrivalPlatform)}
							</div>
						</div>
						<div class="grid grid-cols-2 gap-2 sm:gap-3 text-[0.65rem] sm:text-xs font-mono">
							<div class="space-y-0.5 sm:space-y-1 bg-black/30 p-2 border border-gray-800/50">
								<div class="text-gray-500">DEPART</div>
								<div class="text-gray-200 font-bold tabular-nums">{formatTime(leg.departure)}</div>
							</div>
							<div class="space-y-0.5 sm:space-y-1 bg-black/30 p-2 border border-gray-800/50">
								<div class="text-gray-500">ARRIVE</div>
								<div class="text-gray-200 font-bold tabular-nums">{formatTime(leg.arrival)}</div>
							</div>
						</div>

						{#if hasLegRemarks(leg)}
							<div class="space-y-1 border-l-2 border-amber-500 pl-2 sm:pl-3 bg-amber-900/10">
								{#each leg.remarks ?? [] as remark}
									<div class="text-[0.6rem] sm:text-xs text-amber-200 font-mono leading-relaxed">{remark}</div>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
