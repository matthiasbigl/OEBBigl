<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { loadingAnimations, cleanupElementAnimations } from '$lib/utils/animations';
	
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let color: 'gray' | 'green' | 'orange' | 'white' = 'gray';
	export let text: string = '';
	
	let spinnerContainer: HTMLElement;
	let outerSquare: HTMLElement;
	let innerSquare: HTMLElement;
	let centerDot: HTMLElement;
	
	const sizeClasses = {
		sm: 'w-3 h-3',
		md: 'w-6 h-6', 
		lg: 'w-8 h-8'
	};
	
	const colorClasses = {
		gray: 'border-gray-400',
		green: 'border-green-400',
		orange: 'border-orange-400',
		white: 'border-white'
	};
	
	const textColorClasses = {
		gray: 'text-gray-400',
		green: 'text-green-400',
		orange: 'text-orange-400',
		white: 'text-white'
	};
	
	onMount(() => {
		if (browser && outerSquare && innerSquare && centerDot) {
			// Use our animation system for spinner animations
			loadingAnimations.spin(outerSquare);
			loadingAnimations.spin(innerSquare);
			loadingAnimations.pulse(centerDot);
		}
	});
	
	onDestroy(() => {
		cleanupElementAnimations([spinnerContainer, outerSquare, innerSquare, centerDot]);
	});
</script>

<div bind:this={spinnerContainer} class="flex items-center justify-center gap-3">
	<!-- Retro-futuristic loading animation -->
	<div class="relative {sizeClasses[size]}">
		<!-- Outer rotating square -->
		<div bind:this={outerSquare} class="absolute inset-0 border border-{colorClasses[color]}"></div>
		<!-- Inner rotating square -->
		<div bind:this={innerSquare} class="absolute inset-1 border border-{colorClasses[color]} opacity-60"></div>
		<!-- Center dot -->
		<div class="absolute inset-0 flex items-center justify-center">
			<div bind:this={centerDot} class="w-1 h-1 bg-{colorClasses[color]}"></div>
		</div>
	</div>
	
	{#if text}
		<span class="font-mono text-xs tracking-wider {textColorClasses[color]}">
			{text}
		</span>
	{/if}
</div>
