<script lang="ts">
	import type { Departure } from '$lib/server/hafas';
	
	export let departure: Departure;

	const formatTime = (dateString: string | null | undefined): string => {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleTimeString('de-DE', {
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const getDelayColor = (delay: number | null | undefined): string => {
		if (!delay || delay === 0) return 'text-cyan-400';
		if (delay <= 300) return 'text-yellow-400'; // <= 5 min
		return 'text-red-400'; // > 5 min
	};

	const formatDelay = (delay: number | null | undefined): string => {
		if (!delay || delay === 0) return '';
		const minutes = Math.floor(delay / 60);
		return `+${minutes}min`;
	};
</script>

<div class="bg-slate-800/40 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all duration-300 group">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<!-- Train Info -->
		<div class="flex items-center gap-4">
			<div class="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-white text-lg">
				{departure.line?.name || departure.line?.id || '?'}
			</div>
			<div>
				<h3 class="text-xl font-bold text-cyan-100 font-mono">
					{departure.direction || 'Unknown Direction'}
				</h3>
				<p class="text-cyan-300/70 font-mono text-sm">
					{departure.line?.product || 'Train'} • Platform {departure.platform || 'TBA'}
					{#if departure.line?.trainNumber}
						• Train #{departure.line.trainNumber}
					{/if}
				</p>
			</div>
		</div>

		<!-- Time Info -->
		<div class="text-right">
			<div class="text-3xl font-bold font-mono {getDelayColor(departure.delay)}">
				{formatTime(departure.when)}
			</div>
			{#if departure.delay}
				<div class="text-lg font-bold {getDelayColor(departure.delay)} font-mono">
					{formatDelay(departure.delay)}
				</div>
			{/if}
		</div>
	</div>

	<!-- Additional Info -->
	{#if departure.remarks && departure.remarks.length > 0}
		<div class="mt-4 pt-4 border-t border-cyan-500/20">
			<div class="flex flex-wrap gap-2">
				{#each departure.remarks as remark}
					<span class="px-2 py-1 bg-yellow-600/20 border border-yellow-500/30 rounded text-yellow-300 text-xs font-mono">
						{remark.text}
					</span>
				{/each}
			</div>
		</div>
	{/if}
</div>
