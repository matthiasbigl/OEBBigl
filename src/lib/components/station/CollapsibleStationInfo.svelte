<script lang="ts">
	import StationInfo from './StationInfo.svelte';
	import LoadingSpinner from '../ui/LoadingSpinner.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { browser } from '$app/environment';
	
	export let station: {
		id: string;
		name: string;
		products?: Record<string, boolean>;
	};
	export let activeFilters: Set<string>;
	export let onToggleFilter: (product: string) => void;
	export let onClearFilters: () => void;
	export let onRefresh: () => Promise<void>;
	export let isRefreshing: boolean = false;
	export let lastUpdate: Date;
	export let isCollapsed: boolean = false;

	let containerRef: HTMLElement;
	let contentRef: HTMLElement;

	const toggleCollapse = () => {
		isCollapsed = !isCollapsed;
		if (browser && contentRef) {
			if (isCollapsed) {
				gsap.to(contentRef, {
					height: 0,
					opacity: 0,
					duration: 0.4,
					ease: "power2.inOut"
				});
			} else {
				// First, get the natural height
				gsap.set(contentRef, { height: 'auto' });
				const autoHeight = contentRef.offsetHeight;
				gsap.set(contentRef, { height: 0, opacity: 0 });
				
				// Then animate to that height
				gsap.to(contentRef, {
					height: autoHeight,
					opacity: 1,
					duration: 0.4,
					ease: "power2.inOut",
					onComplete: () => {
						gsap.set(contentRef, { height: 'auto' });
					}
				});
			}
		}
	};

	onDestroy(() => {
		if (browser && contentRef) {
			gsap.killTweensOf(contentRef);
		}
	});
</script>

<div bind:this={containerRef} class="border border-gray-700 bg-black/50 backdrop-blur-sm">
	<!-- Station Header with Controls -->
	<div class="border-b border-gray-700 px-4 py-3 bg-gray-900/30">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
			<!-- Station Title with Collapse Button -->
			<button 
				on:click={toggleCollapse}
				class="flex items-center space-x-3 hover:bg-gray-800/40 transition-colors duration-200 group px-2 py-1 -mx-2 -my-1"
			>
				<div class="w-2 h-2 bg-green-400 pulse-element"></div>
				<div class="text-xs text-gray-400 font-mono tracking-wider">STATION.ACTIVE</div>
				<div class="h-4 w-px bg-gray-600"></div>
				<h2 class="text-lg font-bold text-white truncate font-title">{station.name}</h2>
				<div class="text-gray-400 transition-transform duration-200 {isCollapsed ? '' : 'rotate-180'}">
					▼
				</div>
			</button>
			
			<!-- Refresh Controls - Separate from collapse button -->
			<div class="flex items-center space-x-4 text-xs">
				<!-- Manual Refresh Button -->
				<button 
					on:click={onRefresh}
					disabled={isRefreshing}
					class="flex items-center space-x-2 px-3 py-1 border border-gray-600 bg-black/50 hover:bg-gray-900/50 disabled:opacity-50 transition-all duration-200 floating-element"
				>
					{#if isRefreshing}
						<LoadingSpinner size="sm" color="white" />
						<span class="text-gray-300 font-mono">SYNC</span>
					{:else}
						<span class="text-gray-400">◾◾</span>
						<span class="text-gray-300 font-mono">REFRESH</span>
					{/if}
				</button>
				
				<!-- Status Display -->
				<div class="hidden sm:flex items-center space-x-3 text-gray-400">
					<div class="flex items-center space-x-1">
						<div class="w-1 h-1 bg-green-400 pulse-element"></div>
						<span class="font-mono">AUTO-SYNC</span>
					</div>
					<div class="text-gray-500 font-mono">
						{lastUpdate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
					</div>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Collapsible Station Info Content -->
	<div bind:this={contentRef} class="overflow-hidden {isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'}">
		<div class="p-4">
			<StationInfo 
				{station}
				{activeFilters}
				{onToggleFilter}
				{onClearFilters}
			/>
		</div>
	</div>
</div>
