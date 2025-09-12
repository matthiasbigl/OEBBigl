<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import FontLoader from '$lib/components/FontLoader.svelte';
	// Import critical self-hosted fonts immediately
	import '$lib/utils/selfHostedFonts';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Use self-hosted fonts for better performance -->
<FontLoader useSelfHosted={true} />

{@render children?.()}
