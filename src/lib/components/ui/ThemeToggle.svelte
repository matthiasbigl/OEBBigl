<script lang="ts">
	import { theme } from '$lib/stores/themeStore';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	let currentTheme = $state<'light' | 'dark' | 'system'>('system');
	let isOpen = $state(false);
	let buttonRef: HTMLButtonElement;
	
	$effect(() => {
		if (browser) {
			currentTheme = $theme;
		}
	});
	
	function toggleTheme() {
		theme.toggle();
	}
	
	function setTheme(newTheme: 'light' | 'dark' | 'system') {
		if (newTheme === 'system') {
			theme.useSystem();
		} else {
			theme.set(newTheme);
		}
		isOpen = false;
	}
	
	function handleClickOutside(event: MouseEvent) {
		if (buttonRef && !buttonRef.contains(event.target as Node)) {
			isOpen = false;
		}
	}
	
	onMount(() => {
		if (browser) {
			document.addEventListener('click', handleClickOutside);
			return () => {
				document.removeEventListener('click', handleClickOutside);
			};
		}
	});
	
	const getIcon = (themeType: typeof currentTheme) => {
		switch (themeType) {
			case 'light':
				return '☀';
			case 'dark':
				return '☾';
			case 'system':
				return '⚙';
			default:
				return '☾';
		}
	};
</script>

<div class="relative">
	<button
		bind:this={buttonRef}
		onclick={() => isOpen = !isOpen}
		class="flex items-center justify-center w-10 h-10 rounded-sm border border-gray-600 dark:border-gray-600 bg-gray-100 dark:bg-black/50 hover:bg-gray-200 dark:hover:bg-gray-900/50 transition-colors duration-200"
		title="Toggle theme"
		aria-label="Toggle theme"
		aria-expanded={isOpen}
	>
		<span class="text-xl" aria-hidden="true">
			{getIcon(currentTheme)}
		</span>
	</button>
	
	{#if isOpen}
		<div 
			class="absolute right-0 mt-2 w-48 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/90 backdrop-blur-sm shadow-lg z-50"
			role="menu"
		>
			<div class="py-1">
				<button
					onclick={() => setTheme('light')}
					class="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors duration-200 {currentTheme === 'light' ? 'text-cyan-600 dark:text-cyan-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}"
					role="menuitem"
				>
					<span class="text-lg">☀</span>
					<span class="font-mono tracking-wider">LIGHT</span>
				</button>
				
				<button
					onclick={() => setTheme('dark')}
					class="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors duration-200 {currentTheme === 'dark' ? 'text-cyan-600 dark:text-cyan-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}"
					role="menuitem"
				>
					<span class="text-lg">☾</span>
					<span class="font-mono tracking-wider">DARK</span>
				</button>
				
				<button
					onclick={() => setTheme('system')}
					class="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors duration-200 {currentTheme === 'system' ? 'text-cyan-600 dark:text-cyan-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}"
					role="menuitem"
				>
					<span class="text-lg">⚙</span>
					<span class="font-mono tracking-wider">SYSTEM</span>
				</button>
			</div>
		</div>
	{/if}
</div>
