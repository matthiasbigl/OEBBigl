<script lang="ts">
	import type { TimelineNode } from './timelineTypes';

	export let nodes: TimelineNode[] = [];

	function getStopColor(variant: TimelineNode['variant']): string {
		switch (variant) {
			case 'departure': return 'bg-cyan-400 border-cyan-400 shadow-cyan-400/50';
			case 'transfer': return 'bg-blue-400 border-blue-400 shadow-blue-400/40';
			case 'arrival': return 'bg-green-400 border-green-400 shadow-green-400/50';
			default: return 'bg-gray-400 border-gray-400 shadow-gray-400/30';
		}
	}

	function getStopSize(variant: TimelineNode['variant']): string {
		switch (variant) {
			case 'departure':
			case 'arrival':
				return 'w-3 h-3 sm:w-3.5 sm:h-3.5';
			case 'transfer':
				return 'w-2.5 h-2.5 sm:w-3 sm:h-3';
			default:
				return 'w-2 h-2 sm:w-2.5 sm:h-2.5';
		}
	}

	function getLineSegmentColor(currentVariant: TimelineNode['variant'], nextVariant?: TimelineNode['variant']): string {
		// Color based on the segment between stations
		if (currentVariant === 'departure' || currentVariant === 'transfer') {
			return 'from-cyan-500/60 via-blue-500/50 to-blue-500/40';
		}
		return 'from-blue-500/50 via-blue-500/40 to-green-500/40';
	}
</script>

<div class="relative">
	{#if nodes.length === 0}
		<div class="text-[0.65rem] sm:text-xs text-gray-500 font-mono text-center py-6">
			NO ROUTE DATA AVAILABLE
		</div>
	{:else}
		<!-- Single Continuous Timeline -->
		<div class="relative flex items-start">
			<!-- The Single Continuous Line -->
			<div class="absolute left-[5px] sm:left-[6px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-cyan-500/60 via-blue-500/40 to-green-500/60"></div>

			<!-- All Stops -->
			<div class="relative w-full space-y-0">
				{#each nodes as node, index (node.id ?? `${node.title}-${index}`)}
					{@const isFirst = index === 0}
					{@const isLast = index === nodes.length - 1}
					{@const isTransfer = node.variant === 'transfer'}
					
					<div class="relative flex items-start gap-3 sm:gap-4 {isLast ? 'pb-0' : 'pb-6 sm:pb-8'}">
						<!-- Stop Indicator -->
						<div class="relative z-10 flex-shrink-0 mt-1.5">
							<!-- Dot -->
							<div class="{getStopSize(node.variant)} rounded-full border-2 {getStopColor(node.variant)} shadow-lg transition-transform duration-200 hover:scale-125 {isFirst || isLast ? 'animate-pulse' : ''}"></div>
							
							<!-- Transfer Icon Overlay -->
							{#if isTransfer}
								<div class="absolute inset-0 flex items-center justify-center text-[0.5rem] text-white font-bold">
									⟳
								</div>
							{/if}
						</div>

						<!-- Content -->
						<div class="flex-1 min-w-0 pt-0.5">
							<!-- Station Name & Time -->
							<div class="flex items-baseline justify-between gap-2 mb-0.5">
								<h4 class="text-xs sm:text-sm font-bold text-white font-mono leading-tight truncate {isFirst || isLast ? 'text-shadow' : ''}">
									{node.title}
								</h4>
								{#if node.time}
									<time class="text-xs sm:text-sm font-mono tabular-nums font-bold shrink-0 {
										isFirst ? 'text-cyan-400' : 
										isLast ? 'text-green-400' : 
										'text-blue-300'
									}">
										{node.time}
									</time>
								{/if}
							</div>

							<!-- Train/Service Info for Transfers -->
							{#if node.details?.length}
								<div class="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[0.65rem] sm:text-xs">
									{#each node.details as detail}
										{#if detail.emphasis}
											<!-- Highlighted service info -->
											<div class="flex items-center gap-1.5">
												<span class="text-gray-500 uppercase tracking-wider">{detail.label}:</span>
												<span class="font-mono font-bold text-white">{detail.value}</span>
											</div>
										{:else}
											<!-- Regular info -->
											<div class="flex items-center gap-1.5">
												<span class="text-gray-600 uppercase tracking-wide">{detail.label}:</span>
												<span class="font-mono text-gray-400">{detail.value}</span>
											</div>
										{/if}
									{/each}
								</div>
							{/if}

							<!-- Visual separator for transfers -->
							{#if isTransfer && !isLast}
								<div class="mt-2 h-px bg-gradient-to-r from-blue-500/40 via-blue-400/20 to-transparent"></div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Journey Summary -->
		<div class="mt-3 pt-3 border-t border-gray-800/30 flex items-center justify-between text-[0.6rem] sm:text-xs text-gray-500 font-mono">
			<span class="flex items-center gap-1.5">
				<span class="w-1 h-1 bg-blue-400"></span>
				ROUTE: {nodes.length} STOPS
			</span>
			<span class="uppercase tracking-wider text-gray-600">END</span>
		</div>
	{/if}
</div>

<style>
	.text-shadow {
		text-shadow: 0 0 10px currentColor;
	}
</style>

