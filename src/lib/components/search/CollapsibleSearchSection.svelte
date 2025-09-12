<script lang="ts">
	import StationSearch from './StationSearch.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { collapsibleAnimations, cleanupElementAnimations } from '$lib/utils/animations';
	
	export let stationName: string;
	export let isCollapsed: boolean = false;
	
	// Constants
	const MOBILE_BREAKPOINT = 768;
	
	let containerRef: HTMLElement;
	let collapsibleContentRef: HTMLElement;
	let isMobile = false;
	
	/**
	 * Checks if the current viewport is considered mobile
	 */
	function checkIsMobile(): boolean {
		return window.innerWidth < MOBILE_BREAKPOINT;
	}
	
	/**
	 * Animates the collapsible content using our animation system
	 */
	function animateContent(collapsed: boolean): void {
		if (!browser || !collapsibleContentRef) return;
		
		// Use our collapsible animation system
		collapsibleAnimations.toggle(collapsibleContentRef, collapsed);
	}
	
	// Mobile detection and default collapse state
	onMount(() => {
		// Check if mobile on mount
		isMobile = checkIsMobile();
		
		// Add resize listener
		const handleResize = (): void => {
			isMobile = checkIsMobile();
		};
		
		window.addEventListener('resize', handleResize);
		
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
	
	/**
	 * Toggles the collapsed state of the search section
	 */
	const toggleCollapse = (): void => {
		isCollapsed = !isCollapsed;
		animateContent(isCollapsed);
	};
	
	onDestroy(() => {
		cleanupElementAnimations([collapsibleContentRef]);
	});
</script>

<div bind:this={containerRef} class="border border-gray-700 bg-black/50 backdrop-blur-sm">
	<!-- Collapsible Header -->
	<button 
		on:click={toggleCollapse}
		class="w-full border-b border-gray-700 px-4 py-3 bg-gray-900/30 hover:bg-gray-800/40 transition-colors duration-200 group"
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-3">
				<div class="w-2 h-2 bg-gray-500 pulse-element"></div>
				<span class="text-xs text-gray-400 font-mono tracking-wider">SEARCH.MODULE</span>
			</div>
			<div class="flex items-center space-x-2">
				<div class="text-gray-400 transition-transform duration-200 {isCollapsed ? '' : 'rotate-180'}">
					▼
				</div>
			</div>
		</div>
	</button>
	
	<!-- Collapsible Content -->
	<div bind:this={collapsibleContentRef} class="collapsible-content {isCollapsed ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100 overflow-visible'}">
		<div class="p-4 relative">
			<StationSearch 
				{stationName}
			/>
		</div>
	</div>
</div>
