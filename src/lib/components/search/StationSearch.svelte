<script lang="ts">
	import Button from '../ui/Button.svelte';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { browser } from '$app/environment';
	
	export let stationName: string;
	export let onSearch: (station: string) => void;

	let inputValue = stationName;
	let inputRef: HTMLInputElement;
	let formRef: HTMLFormElement;

	const handleSubmit = () => {
		onSearch(inputValue);
	};
	
	onMount(() => {
		// Only run animations in browser
		if (!browser || !inputRef) return;
		
		// Add focus animations
		const handleFocus = () => {
			if (browser && inputRef) {
				gsap.to(inputRef, {
					scale: 1.02,
					duration: 0.3,
					ease: "power2.out"
				});
			}
		};
		
		const handleBlur = () => {
			if (browser && inputRef) {
				gsap.to(inputRef, {
					scale: 1,
					duration: 0.3,
					ease: "power2.out"
				});
			}
		};
		
		inputRef.addEventListener('focus', handleFocus);
		inputRef.addEventListener('blur', handleBlur);
		
		return () => {
			if (inputRef) {
				inputRef.removeEventListener('focus', handleFocus);
				inputRef.removeEventListener('blur', handleBlur);
			}
		};
	});
</script>


<div class="w-full">
	<form bind:this={formRef} on:submit|preventDefault={handleSubmit} class="space-y-4">
		<!-- Input Field with Terminal Styling -->
		<div class="relative">
			<!-- Terminal Prompt -->
			<div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-mono text-sm pointer-events-none">
				$&gt;
			</div>
			
			<input 
				bind:this={inputRef}
				type="text" 
				bind:value={inputValue}
				placeholder="ENTER STATION NAME..."
				class="w-full pl-12 pr-4 py-3 bg-black/60 border border-gray-600 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-all duration-200 font-mono text-sm sm:text-base"
			>
			
			<!-- Input Border Effect -->
			<div class="absolute inset-0 border border-gray-600 pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100"></div>
		</div>
		
		<!-- Submit Button -->
		<div class="flex justify-center">
			<Button variant="primary" onClick={handleSubmit}>
				EXECUTE.SEARCH
			</Button>
		</div>
	</form>
	
	<!-- Help Text -->
	<div class="mt-3 text-center">
		<span class="text-xs text-gray-500 font-mono">
			// Type station name and press EXECUTE.SEARCH
		</span>
	</div>
</div>
