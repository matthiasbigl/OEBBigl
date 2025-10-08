<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
	import {
		createFadeInAnimation,
		createSlideAnimation,
		createMorphingBackground
	} from '$lib/utils/pageAnimations';

	type CleanupFn = () => void;

	let heroSection: HTMLElement;
	let statsContainer: HTMLElement;
	let featureGrid: HTMLElement;
	let systemStream: HTMLElement;
	let morphBackground: HTMLElement;

	let cleanupFns: CleanupFn[] = [];

	const docsUrl = 'https://github.com/matthiasbigl/OEBBigl/blob/main/docs/trip-planner-page-spec.md';

	// SEO metadata
	const siteTitle = 'Cyber Station Control Hub - ÖBB Transit Grid';
	const siteDescription = 'Command Austria\'s rail system with real-time departures, journey planning, and live HAFAS integration. Monitor platforms, plot routes, and navigate the ÖBB network with precision.';
	const siteUrl = $page.url.origin;
	const ogImage = `${siteUrl}/og-image.png`; // You'll need to create this
	
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'Cyber Station Control Hub',
		applicationCategory: 'Travel & Transportation',
		operatingSystem: 'Web Browser',
		description: siteDescription,
		url: siteUrl,
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'EUR'
		},
		featureList: [
			'Real-time departure monitoring',
			'Journey planning and route optimization',
			'Platform and product filtering',
			'Auto-refresh every 60 seconds',
			'Mobile and desktop responsive design'
		],
		audience: {
			'@type': 'Audience',
			geographicArea: {
				'@type': 'Country',
				name: 'Austria'
			}
		}
	};

	const stats = [
		{
			label: 'Live data source',
			value: 'ÖBB HAFAS',
			subtitle: 'Official realtime timetable feed'
		},
		{
			label: 'Auto refresh',
			value: 'Every 60s',
			subtitle: 'Sync cadence tuned for live ops'
		},
		{
			label: 'Adaptive layouts',
			value: 'Mobile + Desktop',
			subtitle: 'Navigation flexes with your device'
		},
		{
			label: 'Visual language',
			value: 'Retro cyber',
			subtitle: 'Consistent styling across pages'
		}
	] as const;

	interface FeatureCard {
		title: string;
		description: string;
		highlights: string[];
		primaryHref: string;
		primaryLabel: string;
		primaryTitle: string;
		secondaryHref?: string;
		secondaryLabel?: string;
		secondaryTitle?: string;
		isExternal?: boolean;
	}

	const features: FeatureCard[] = [
		{
			title: 'Realtime Departures Matrix',
			description:
				'Monitor live stops, filter platforms, and catch every signal flicker as soon as it appears in the network.',
			highlights: [
				'Granular platform + product filters',
				'Auto-refresh with telemetry pulses',
				'Collapsible info panels built for focus'
			],
			primaryHref: '/departures',
			primaryLabel: 'Launch Departures',
			primaryTitle: 'Open the realtime departures control board'
		},
		{
			title: 'Journey Planning Console',
			description:
				'Plot complete itineraries, tweak transport products, and inspect every transfer in a cyber-grade timeline.',
			highlights: [
				'Dual-station smart search fields',
				'Timeline view for each journey leg',
				'Pagination-ready HAFAS integration'
			],
			primaryHref: '/journeys',
			primaryLabel: 'Open Trip Planner',
			primaryTitle: 'Navigate to the journey planning interface',
			secondaryHref: docsUrl,
			secondaryLabel: 'View Docs',
			secondaryTitle: 'Read the journey planner design brief',
			isExternal: true
		}
	];

	const timelineSteps = [
		{
			code: '01',
			title: 'Scan the grid',
			detail: 'Zero-latency inputs probe stations, validating availability before data leaves the terminal.'
		},
		{
			code: '02',
			title: 'Stabilise telemetry',
			detail: 'Auto-refresh daemons sync every 60 seconds, smoothing jitter with adaptive throttling.'
		},
		{
			code: '03',
			title: 'Visualise the route',
			detail: 'Journeys render in layered timelines, highlighting transfers, platforms, and dwell windows.'
		}
	] as const;

	onMount(() => {
		const localCleanups: CleanupFn[] = [];

		if (heroSection) {
			const heroTimeline = createFadeInAnimation(heroSection, { duration: 0.8, delay: 0.1 });
			localCleanups.push(() => heroTimeline.kill());
		}

		if (statsContainer) {
			const cards = Array.from(statsContainer.querySelectorAll('[data-stat-card]')) as HTMLElement[];
			if (cards.length > 0) {
				const statsTimeline = createSlideAnimation(cards, 'up', { duration: 0.7, delay: 0.1 });
				localCleanups.push(() => statsTimeline.kill());
			}
		}

		if (featureGrid) {
			const featureCards = Array.from(featureGrid.querySelectorAll('[data-feature-card]')) as HTMLElement[];
			if (featureCards.length > 0) {
				const featureTimeline = createSlideAnimation(featureCards, 'up', { duration: 0.85, delay: 0.15 });
				localCleanups.push(() => featureTimeline.kill());
			}
		}

		if (systemStream) {
			const streamTimeline = createFadeInAnimation(systemStream, { duration: 0.75, delay: 0.2 });
			localCleanups.push(() => streamTimeline.kill());
		}

		if (morphBackground) {
			const morphTimeline = createMorphingBackground(morphBackground);
			localCleanups.push(() => morphTimeline.kill());
		}

		cleanupFns = localCleanups;

		return () => {
			localCleanups.forEach((cleanup) => cleanup());
			cleanupFns = [];
		};
	});

	onDestroy(() => {
		cleanupFns.forEach((cleanup) => cleanup());
		cleanupFns = [];
	});
</script>

<svelte:head>
	<title>{siteTitle}</title>
	<meta name="description" content={siteDescription} />
	<meta name="keywords" content="ÖBB, Austria rail, train departures, journey planner, HAFAS, real-time transit, rail network, Austria transport" />
	<meta name="author" content="Cyber Station Network" />
	<html lang="en" />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={siteUrl} />
	<meta property="og:title" content={siteTitle} />
	<meta property="og:description" content={siteDescription} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:site_name" content="Cyber Station Control Hub" />
	
	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={siteUrl} />
	<meta name="twitter:title" content={siteTitle} />
	<meta name="twitter:description" content={siteDescription} />
	<meta name="twitter:image" content={ogImage} />
	
	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
</svelte:head>

<div class="flex flex-col gap-24 pb-12">
	<section
		bind:this={heroSection}
		class="relative overflow-hidden border border-cyan-500/30 bg-black/60 px-6 py-20 sm:rounded-none sm:px-10 sm:py-24"
	>
		<div class="pointer-events-none absolute inset-0 opacity-60">
			<div
				bind:this={morphBackground}
				class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.45)_0%,_transparent_65%)]"
			></div>
			<div class="absolute inset-0 bg-grid"></div>
		</div>

		<div class="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
			<span class="text-xs uppercase tracking-[0.6em] text-cyan-200/80">Cyber Station Network</span>
			<h1 class="text-4xl font-title uppercase tracking-[0.3em] text-white sm:text-5xl">
				Command the ÖBB Transit Grid
			</h1>
			<p class="max-w-2xl text-sm text-gray-300 sm:text-base">
				Tap into a retro-futuristic control surface for Austria's rail system. Monitor departures in real time, plot journeys with precision, and keep the network locked in your periphery vision.
			</p>
			<div class="flex flex-wrap items-center justify-center gap-4">
				<a href="/departures" data-sveltekit-preload-data="hover">
					<Button variant="primary" size="lg" title="Open realtime departures">
						Launch Departures Grid
					</Button>
				</a>
				<a href="/journeys" data-sveltekit-preload-data="hover">
					<Button variant="secondary" size="lg" title="Open journey planner">
						Plan a Journey
					</Button>
				</a>
			</div>
		</div>

		<div
			bind:this={statsContainer}
			class="relative z-10 mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
		>
			{#each stats as stat}
				<div
					data-stat-card
					class="border border-gray-800/60 bg-black/75 px-4 py-5 text-left shadow-[0_0_20px_rgba(13,148,136,0.15)]"
				>
					<div class="text-[11px] uppercase tracking-[0.35em] text-cyan-200/70">{stat.label}</div>
					<div class="mt-2 font-title text-2xl text-white">{stat.value}</div>
					<p class="mt-2 text-xs text-gray-400">{stat.subtitle}</p>
				</div>
			{/each}
		</div>
	</section>

	<section bind:this={featureGrid} class="space-y-10">
		<div class="flex flex-col items-center gap-3 text-center">
			<h2 class="text-2xl font-title uppercase tracking-[0.35em] text-white sm:text-3xl">
				Choose Your Console
			</h2>
			<p class="max-w-2xl text-sm text-gray-400">
				Pick the view that matches your task: monitor departures for situational awareness or switch to the journey planner when you need a door-to-door route.
			</p>
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			{#each features as feature}
				<article
					data-feature-card
					class="relative overflow-hidden border border-gray-800/70 bg-black/70 p-6"
				>
					<div class="pointer-events-none absolute inset-0 border border-cyan-500/15"></div>
					<div class="relative z-10 flex h-full flex-col gap-6">
						<header class="space-y-2">
							<h3 class="text-xl font-title uppercase tracking-[0.25em] text-white">
								{feature.title}
							</h3>
							<p class="text-sm text-gray-300">{feature.description}</p>
						</header>
						<ul class="space-y-2 text-xs text-gray-400">
							{#each feature.highlights as highlight}
								<li class="flex items-center gap-3">
									<span class="h-px w-10 bg-cyan-400/70"></span>
									<span class="tracking-[0.2em] uppercase">{highlight}</span>
								</li>
							{/each}
						</ul>
						<div class="mt-auto flex flex-wrap gap-3">
							<a 
								href={feature.primaryHref} 
								data-sveltekit-preload-data="hover"
							>
								<Button
									variant="primary"
									size="md"
									title={feature.primaryTitle}
								>
									{feature.primaryLabel}
								</Button>
							</a>
							{#if feature.secondaryHref}
								<a 
									href={feature.secondaryHref}
									{...(feature.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : { 'data-sveltekit-preload-data': 'hover' })}
								>
									<Button
										variant="secondary"
										size="md"
										title={feature.secondaryTitle}
									>
										{feature.secondaryLabel}
									</Button>
								</a>
							{/if}
						</div>
					</div>
				</article>
			{/each}
		</div>
	</section>

	<section
		bind:this={systemStream}
		class="relative overflow-hidden border border-gray-800/70 bg-black/60 p-6 sm:p-8"
	>
		<div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-cyan-500/10 to-transparent"></div>
		<div class="relative z-10 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
			<div class="max-w-xl space-y-3">
				<h2 class="text-xl font-title uppercase tracking-[0.3em] text-white">
					System Flow Diagnostics
				</h2>
				<p class="text-sm text-gray-400">
					Peek under the hood. The control hub synchronises live feeds, orchestrates auto-refresh daemons, and renders journeys with cinematic clarity.
				</p>
			</div>
			<ol class="grid gap-4 text-sm text-gray-300 md:w-1/2">
				{#each timelineSteps as step}
					<li class="border border-gray-800/70 bg-black/70 px-4 py-5">
						<div class="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-cyan-300/80">
							<span>{step.code}</span>
							<span>Protocol</span>
						</div>
						<h3 class="mt-3 font-title text-lg text-white">{step.title}</h3>
						<p class="mt-2 text-xs text-gray-400">{step.detail}</p>
					</li>
				{/each}
			</ol>
		</div>
	</section>
</div>
