<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import FontLoader from '$lib/components/FontLoader.svelte';
	// Import critical self-hosted fonts immediately
	import '$lib/utils/selfHostedFonts';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import { onDestroy } from 'svelte';

	let { children } = $props();
	let isMenuOpen = false;

	const navLinks = [
		{ href: '/', label: 'Overview' },
		{ href: '/departures', label: 'Realtime Departures' },
		{ href: '/journeys', label: 'Trip Planner' }
	];

	const currentYear = new Date().getFullYear();
	let currentPath = '';

	const unsubscribe = page.subscribe(($page) => {
		currentPath = $page.url.pathname;
	});

	onDestroy(() => {
		unsubscribe();
	});

	function isActive(href: string): boolean {
		if (href === '/') {
			return currentPath === '/';
		}
		return currentPath.startsWith(href) && href !== '/';
	}

	function desktopLinkClasses(href: string): string {
		const base =
			'relative inline-flex items-center gap-2 px-3 py-2 border-b-2 border-transparent uppercase tracking-[0.3em] text-[11px] font-mono transition-colors duration-200';
		const active = 'text-cyan-300 border-cyan-400';
		const inactive = 'text-gray-400 hover:text-gray-100 hover:border-gray-600';
		return `${base} ${isActive(href) ? active : inactive}`;
	}

	function mobileLinkClasses(href: string): string {
		const base =
			'block rounded-sm border px-3 py-2 text-xs uppercase tracking-[0.25em] font-mono transition-colors duration-200';
		const active = 'border-cyan-400/60 bg-cyan-500/15 text-cyan-200';
		const inactive = 'border-gray-800 text-gray-300 hover:border-gray-600 hover:text-gray-100';
		return `${base} ${isActive(href) ? active : inactive}`;
	}

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			isMenuOpen = false;
		}
	};

	afterNavigate(() => {
		isMenuOpen = false;
	});
</script>

<svelte:window on:keydown={handleKeyDown} />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Use self-hosted fonts for better performance -->
<FontLoader useSelfHosted={true} />

<div class="relative min-h-screen bg-black text-gray-100 font-mono overflow-hidden">
	<div class="pointer-events-none absolute inset-0 opacity-40">
		<div class="absolute inset-0 bg-gradient-to-br from-cyber-900 via-black to-black"></div>
		<div class="absolute inset-0 bg-grid"></div>
	</div>
	<div class="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-cyan-500/30 via-transparent to-transparent blur-3xl opacity-60"></div>

	<div class="relative z-10 flex min-h-screen flex-col">
		<a
			href="#main-content"
			class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-cyan-400 focus:px-4 focus:py-2 focus:text-black"
		>
			Skip to main content
		</a>

		<header class="border-b border-gray-800/80 bg-black/70 backdrop-blur">
			<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<a href="/" class="flex items-center gap-3" data-sveltekit-prefetch>
					<span class="grid h-10 w-10 place-items-center rounded-full border border-cyan-400/40 bg-cyan-500/10 font-title text-lg text-cyan-200">
						ÖBB
					</span>
					<div class="hidden sm:flex flex-col leading-tight">
						<span class="text-[10px] uppercase tracking-[0.5em] text-gray-500">Cyber Station</span>
						<span class="text-xs font-semibold tracking-[0.35em] text-white">Control Hub</span>
					</div>
				</a>

				<nav class="hidden md:flex items-center gap-2" aria-label="Primary">
					{#each navLinks as link}
						<a
							href={link.href}
							class={desktopLinkClasses(link.href)}
							data-sveltekit-prefetch
							aria-current={isActive(link.href) ? 'page' : undefined}
						>
							<span>{link.label}</span>
						</a>
					{/each}
				</nav>

				<button
					type="button"
					class="md:hidden inline-flex items-center justify-center rounded-sm border border-cyan-500/40 bg-black/60 px-3 py-2 text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
					on:click={() => (isMenuOpen = !isMenuOpen)}
					aria-expanded={isMenuOpen}
					aria-controls="mobile-navigation"
					title="Toggle navigation"
				>
					<span class="sr-only">Toggle navigation</span>
					<span class="flex flex-col gap-1">
						<span
							class={`block h-0.5 w-6 bg-current transition-transform duration-200 ${isMenuOpen ? 'translate-y-1.5 rotate-45' : ''}`}
						></span>
						<span class={`block h-0.5 w-6 bg-current transition-opacity duration-200 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
						<span
							class={`block h-0.5 w-6 bg-current transition-transform duration-200 ${isMenuOpen ? '-translate-y-1.5 -rotate-45' : ''}`}
						></span>
					</span>
				</button>
			</div>

			{#if isMenuOpen}
				<nav
					id="mobile-navigation"
					class="md:hidden border-t border-gray-800/70 bg-black/90 backdrop-blur"
					aria-label="Primary"
				>
					<ul class="space-y-2 px-4 py-4">
						{#each navLinks as link}
							<li>
								<a
									href={link.href}
									class={mobileLinkClasses(link.href)}
									data-sveltekit-prefetch
									aria-current={isActive(link.href) ? 'page' : undefined}
									on:click={() => (isMenuOpen = false)}
								>
									{link.label}
								</a>
							</li>
						{/each}
					</ul>
				</nav>
			{/if}
		</header>

		<main id="main-content" class="relative flex-1">
			<div class="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
				{@render children?.()}
			</div>
		</main>

		<footer class="border-t border-gray-800/80 bg-black/80 backdrop-blur">
			<div class="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-xs tracking-[0.35em] text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
				<p>© {currentYear} CYBER STATION NETWORK</p>
				<div class="flex flex-wrap items-center gap-4 uppercase">
					<span class="text-gray-600">Status: <span class="text-cyan-300">System Online</span></span>
					<a
						href="https://github.com/matthiasbigl/OEBBigl"
						class="text-gray-500 transition-colors hover:text-gray-200"
						rel="noreferrer noopener"
						target="_blank"
					>
						View Source
					</a>
				</div>
			</div>
		</footer>
	</div>
</div>
