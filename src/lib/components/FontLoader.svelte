<script lang="ts">
	import { onMount } from 'svelte';
	import { loadFontsWithFallback, areFontsLoaded } from '$lib/utils/fontLoader';
	import { loadAdditionalFonts } from '$lib/utils/selfHostedFonts';

	interface Props {
		useSelfHosted?: boolean;
	}

	let { useSelfHosted = true }: Props = $props();
	let fontsLoaded = $state(false);
	let fallbackActive = $state(true);

	onMount(async () => {
		// Check if fonts are already loaded
		const alreadyLoaded = await areFontsLoaded();
		
		if (alreadyLoaded) {
			fontsLoaded = true;
			fallbackActive = false;
			
			// Load additional font weights in background
			if (useSelfHosted) {
				loadAdditionalFonts();
			}
			return;
		}

		if (useSelfHosted) {
			// For self-hosted fonts, they should load faster
			setTimeout(() => {
				fontsLoaded = true;
				// Load additional weights
				loadAdditionalFonts();
				// Shorter fallback time for self-hosted
				setTimeout(() => {
					fallbackActive = false;
				}, 50);
			}, 100);
		} else {
			// Load fonts with timeout fallback for Google Fonts
			const fontLoadPromise = loadFontsWithFallback();
			const timeoutPromise = new Promise(resolve => setTimeout(resolve, 3000));

			Promise.race([fontLoadPromise, timeoutPromise]).then(() => {
				fontsLoaded = true;
				// Keep fallback active for a bit longer to prevent FOUT
				setTimeout(() => {
					fallbackActive = false;
				}, 100);
			});
		}
	});
</script>

<!-- 
This component helps manage font loading states.
Set useSelfHosted={true} for self-hosted fonts or {false} for Google Fonts.
Add to your layout to enable font optimization throughout the app.
-->

{#if fallbackActive}
	<style>
		/* Temporary fallback styles to prevent FOUT */
		:global(body) {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
		}
	</style>
{/if}

{#if fontsLoaded}
	<style>
		/* Apply custom fonts once loaded */
		:global(body) {
			font-family: 'Rajdhani', 'Orbitron', 'JetBrains Mono', 'Courier New', monospace !important;
		}
	</style>
{/if}
