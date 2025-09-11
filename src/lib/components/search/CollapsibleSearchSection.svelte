<script lang="ts">
	import StationSearch from './StationSearch.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { browser } from '$app/environment';
	
	export let stationName: string;
	export let onSearch: (station: string) => void;
	export let isCollapsed: boolean = false;
	
	let containerRef: HTMLElement;
	let contentRef: HTMLElement;
	let isMobile = false;
	
	// Mobile detection and default collapse state
	onMount(() => {
		// Check if mobile on mount
		isMobile = window.innerWidth < 768;
		
		// Collapse by default on mobile
		if (isMobile) {
			isCollapsed = true;
		}
		
		// Add resize listener
		const handleResize = () => {
			const wasMobile = isMobile;
			isMobile = window.innerWidth < 768;
			
			// If switching from desktop to mobile, collapse
			if (!wasMobile && isMobile) {
				isCollapsed = true;
			}
			// If switching from mobile to desktop, expand
			else if (wasMobile && !isMobile) {
				isCollapsed = false;
			}
		};
		
		window.addEventListener('resize', handleResize);
		
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
	
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
				{#if isMobile}
					<span class="text-xs text-gray-500 font-mono">MOBILE</span>
				{/if}
				<div class="text-gray-400 transition-transform duration-200 {isCollapsed ? '' : 'rotate-180'}">
					▼
				</div>
			</div>
		</div>
	</button>
	
	<!-- Collapsible Content -->
	<div bind:this={contentRef} class="collapsible-content overflow-hidden {isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'}">
		<div class="p-4">
			<StationSearch 
				{stationName} 
				{onSearch} 
			/>
		</div>
	</div>
</div>
