
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { createButtonAnimations, cleanupElementAnimations } from '$lib/utils/animations';
	
	export let variant: 'primary' | 'secondary' | 'danger' | 'filter' | 'filter-active' | 'platform' | 'platform-active' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let onClick: (() => void) | undefined = undefined;
	export let disabled = false;
	export let title = '';

	let buttonRef: HTMLButtonElement;
	let buttonAnimations: ReturnType<typeof createButtonAnimations>;

	const variants = {
		primary: 'bg-gray-100 dark:bg-gray-900 border border-gray-400 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-gray-500 dark:hover:border-gray-400 hover:text-black dark:hover:text-white w-full sm:w-auto',
		secondary: 'bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-100 w-full sm:w-auto',
		danger: 'bg-red-100/50 dark:bg-red-900/50 border border-red-500 dark:border-red-600 text-red-800 dark:text-red-200 hover:bg-red-200/70 dark:hover:bg-red-800/70 hover:border-red-600 dark:hover:border-red-400 w-full sm:w-auto',
		filter: 'bg-white/30 dark:bg-black/30 border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-500 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/30 dark:hover:bg-gray-900/30 w-full',
		'filter-active': 'bg-gray-200 dark:bg-gray-800 border border-gray-500 dark:border-gray-400 text-gray-900 dark:text-white w-full',
		platform: 'bg-white/30 dark:bg-black/30 border border-blue-500/50 dark:border-cyan-600/50 text-blue-600 dark:text-cyan-400 hover:border-blue-600 dark:hover:border-cyan-400 hover:text-blue-800 dark:hover:text-cyan-200 hover:bg-blue-100/20 dark:hover:bg-cyan-900/20 w-full',
		'platform-active': 'bg-blue-100/50 dark:bg-cyan-900/50 border border-blue-500 dark:border-cyan-400 text-blue-900 dark:text-cyan-100 shadow-sm shadow-blue-500/20 dark:shadow-cyan-500/20 w-full'
	};

	const sizes = {
		sm: 'px-3 py-1 text-xs',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-3 text-base'
	};

	$: baseClasses = 'font-bold transition-all duration-200 font-mono cursor-pointer tracking-wider touch-manipulation active:scale-95';
	$: variantClasses = variants[variant];
	$: sizeClasses = sizes[size];
	$: disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
	
	onMount(() => {
		if (!browser || !buttonRef) return;
		
		// Create button animation controller using our animation system
		buttonAnimations = createButtonAnimations(buttonRef);
		
		const handleMouseEnter = () => {
			if (!disabled && browser && buttonRef) {
				buttonAnimations.hover();
			}
		};
		
		const handleMouseLeave = () => {
			if (browser && buttonRef) {
				buttonAnimations.release();
			}
		};
		
		const handleMouseDown = () => {
			if (!disabled && browser && buttonRef) {
				buttonAnimations.press();
			}
		};
		
		const handleMouseUp = () => {
			if (!disabled && browser && buttonRef) {
				buttonAnimations.hover();
			}
		};
		
		buttonRef.addEventListener('mouseenter', handleMouseEnter);
		buttonRef.addEventListener('mouseleave', handleMouseLeave);
		buttonRef.addEventListener('mousedown', handleMouseDown);
		buttonRef.addEventListener('mouseup', handleMouseUp);
		
		return () => {
			if (buttonRef) {
				buttonRef.removeEventListener('mouseenter', handleMouseEnter);
				buttonRef.removeEventListener('mouseleave', handleMouseLeave);
				buttonRef.removeEventListener('mousedown', handleMouseDown);
				buttonRef.removeEventListener('mouseup', handleMouseUp);
			}
		};
	});
	
	onDestroy(() => {
		cleanupElementAnimations([buttonRef]);
	});
</script>


<button
	bind:this={buttonRef}
	class="{baseClasses} {variantClasses} {sizeClasses} {disabledClasses}"
	on:click={onClick}
	{disabled}
	{title}
>
	<slot />
</button>
