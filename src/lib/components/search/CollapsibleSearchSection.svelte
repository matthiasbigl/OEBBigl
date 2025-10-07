<script lang="ts">
	import StationSearch from './StationSearch.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { collapsibleAnimations, cleanupElementAnimations } from '$lib/utils/animations';
	
	export let stationName: string;
	export let isCollapsed: boolean = false;
	export let label: string = 'SEARCH.MODULE';
	export let indicatorColor: string = 'bg-gray-500';
	
	const MOBILE_BREAKPOINT = 768;
	
	let containerRef: HTMLElement;
	let collapsibleContentRef: HTMLElement;
	let isMobile = false;
	let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
	
	function checkIsMobile(): boolean {
		return browser && window.innerWidth < MOBILE_BREAKPOINT;
	}
	
	function animateContent(collapsed: boolean): void {
		if (!browser || !collapsibleContentRef) return;
		
		try {
			collapsibleAnimations.toggle(collapsibleContentRef, collapsed);
		} catch (error) {
			console.error('Animation error:', error);
		}
	}
	
	onMount(() => {
		if (!browser) return;
		
		isMobile = checkIsMobile();
		
		const handleResize = (): void => {
			if (resizeTimeout) {
				clearTimeout(resizeTimeout);
			}
			resizeTimeout = setTimeout(() => {
				isMobile = checkIsMobile();
				resizeTimeout = null;
			}, 150);
		};
		
		window.addEventListener('resize', handleResize, { passive: true });
		
		return () => {
			window.removeEventListener('resize', handleResize);
			if (resizeTimeout) {
				clearTimeout(resizeTimeout);
			}
		};
	});
	
	const toggleCollapse = (): void => {
		isCollapsed = !isCollapsed;
		animateContent(isCollapsed);
	};
	
	// React to external changes in isCollapsed
	$: if (browser && collapsibleContentRef) {
		animateContent(isCollapsed);
	}
	
	onDestroy(() => {
		if (collapsibleContentRef) {
			cleanupElementAnimations([collapsibleContentRef]);
		}
		if (resizeTimeout) {
			clearTimeout(resizeTimeout);
		}
	});
</script>

<div bind:this={containerRef} class="border border-gray-700/50 bg-black/40 backdrop-blur-sm">
	<button 
		on:click={toggleCollapse}
		class="w-full border-b border-gray-700/50 px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-900/20 hover:bg-gray-800/30 active:bg-gray-800/40 transition-colors duration-200 group touch-manipulation"
		aria-expanded={!isCollapsed}
		aria-label={isCollapsed ? `Expand ${label}` : `Collapse ${label}`}
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2 sm:gap-3">
				<div class={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${indicatorColor} pulse-element`}></div>
				<span class="text-[0.65rem] sm:text-xs text-gray-400 font-mono tracking-wider">{label}</span>
			</div>
			<div class="flex items-center">
				<div class="text-gray-400 transition-transform duration-300 ease-out {isCollapsed ? '' : 'rotate-180'}">
					▼
				</div>
			</div>
		</div>
	</button>
	
	<div 
		bind:this={collapsibleContentRef} 
		class="transition-all duration-300 ease-out {isCollapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-[2000px] opacity-100 overflow-visible'}"
	>
		<div class="p-3 sm:p-4 relative">
			<slot>
				<StationSearch 
					{stationName}
				/>
			</slot>
		</div>
	</div>
</div>
