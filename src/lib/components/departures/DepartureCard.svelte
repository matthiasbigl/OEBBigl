<script lang="ts">
	import type { Departure } from '$lib/server/hafas';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { addHoverEffects, cleanupElementAnimations, animationPresets } from '$lib/utils/animations';
	
	export let departure: Departure;

	let cardRef: HTMLElement;
	
	const formatTime = (dateString: string | null | undefined): string => {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleTimeString('de-DE', {
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const getDelayColor = (delay: number | null | undefined): string => {
		if (!delay || delay === 0) return 'text-green-400';
		if (delay <= 300) return 'text-orange-400'; // <= 5 min
		return 'text-red-400'; // > 5 min
	};

	const formatDelay = (delay: number | null | undefined): string => {
		if (!delay || delay === 0) return '';
		const minutes = Math.floor(delay / 60);
		return `+${minutes}`;
	};
	
	const getStatusIcon = (delay: number | null | undefined): string => {
		if (!delay || delay === 0) return '●';
		if (delay <= 300) return '◐';
		return '◯';
	};
	
	onMount(() => {
		if (!browser || !cardRef) return;
		
		// Add hover effects using our animation system
		addHoverEffects([cardRef], animationPresets.card.hover);
	});
	
	onDestroy(() => {
		cleanupElementAnimations([cardRef]);
	});
</script>


<div bind:this={cardRef} class="border border-gray-700 bg-black/40 backdrop-blur-sm hover:border-gray-500 transition-all duration-300 cursor-pointer group">
	<!-- Header with Terminal Style -->
	<div class="border-b border-gray-700 px-4 py-2 bg-gray-900/20">
		<div class="flex items-center justify-between">
			<!-- Transport Line -->
			<div class="flex items-center space-x-5">
				<div class="w-8 h-8 bg-gray-800 border border-gray-600 flex items-center justify-center text-xs font-bold text-white group-hover:bg-gray-700 transition-colors duration-200 text-center text-ellipsis overflow-hidden ">
					{departure.line?.name || departure.line?.id || '?'}
				</div>
				<div class="text-xs text-gray-400 font-mono tracking-wider">
					{departure.line?.product?.toUpperCase() || 'TRANSPORT'}
				</div>
			</div>
			
			<!-- Status Indicator -->
			<div class="flex items-center space-x-2 text-xs">
				<div class="w-2 h-2 {getDelayColor(departure.delay)} {getStatusIcon(departure.delay)}"></div>
				<span class="text-gray-400 font-mono">
					{departure.delay ? 'DELAYED' : 'ON.TIME'}
				</span>
			</div>
		</div>
	</div>
	
	<!-- Main Content -->
	<div class="p-4">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
			<!-- Destination & Platform -->
			<div class="flex-1 min-w-0">
				<h3 class="text-lg font-bold text-white font-mono truncate group-hover:text-gray-200 transition-colors duration-200">
					{departure.direction || 'UNKNOWN DESTINATION'}
				</h3>
				<div class="flex items-center space-x-4 mt-1 text-xs text-gray-400">
					<span class="font-mono">PLATFORM: {departure.platform || 'TBA'}</span>
					{#if departure.line?.trainNumber}
						<span class="text-gray-500">|</span>
						<span class="font-mono">#{departure.line.trainNumber}</span>
					{/if}
				</div>
			</div>

			<!-- Time Display -->
			<div class="text-right">
				<div class="text-2xl sm:text-3xl font-bold font-mono {getDelayColor(departure.delay)} group-hover:scale-105 transition-transform duration-200">
					{formatTime(departure.when)}
				</div>
				{#if departure.delay}
					<div class="text-sm font-bold {getDelayColor(departure.delay)} font-mono mt-1">
						{formatDelay(departure.delay)}min
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Remarks/Alerts -->
	{#if departure.remarks && departure.remarks.length > 0}
		<div class="border-t border-gray-700 px-4 py-3 bg-gray-900/10">
			<div class="flex items-center space-x-2 mb-2">
				<div class="w-1 h-1 bg-orange-400 animate-pulse"></div>
				<span class="text-xs text-gray-400 font-mono tracking-wider">ALERTS</span>
			</div>
			<div class="space-y-1">
				{#each departure.remarks as remark}
					<div class="text-xs text-orange-300 font-mono bg-orange-900/20 border-l-2 border-orange-600 pl-3 py-1">
						{remark.text}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
