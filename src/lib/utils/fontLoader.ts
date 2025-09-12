/**
 * Font loading utilities for optimal performance in SvelteKit
 */

export interface FontConfig {
	family: string;
	weights: number[];
	display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}

export const fontConfigs: FontConfig[] = [
	{
		family: 'Orbitron',
		weights: [400, 500, 700, 900],
		display: 'swap'
	},
	{
		family: 'Rajdhani',
		weights: [300, 400, 500, 600, 700],
		display: 'swap'
	}
];

/**
 * Preload critical fonts for better performance
 * This can be called in the layout or specific routes
 */
export function preloadCriticalFonts() {
	if (typeof document === 'undefined') return; // SSR guard
	
	fontConfigs.forEach(config => {
		// Only preload the most critical weights
		const criticalWeights = config.family === 'Rajdhani' ? [400, 500] : [400, 700];
		
		criticalWeights.forEach(weight => {
			const link = document.createElement('link');
			link.rel = 'preload';
			link.as = 'font';
			link.type = 'font/woff2';
			link.crossOrigin = 'anonymous';
			link.href = `https://fonts.gstatic.com/s/${config.family.toLowerCase()}/v20/${config.family}-${weight}.woff2`;
			
			document.head.appendChild(link);
		});
	});
}

/**
 * Check if fonts are loaded
 */
export function areFontsLoaded(): Promise<boolean> {
	if (typeof document === 'undefined') return Promise.resolve(false);
	
	if ('fonts' in document) {
		return Promise.all(
			fontConfigs.map(config => 
				document.fonts.check(`1em ${config.family}`)
			)
		).then(results => results.every(Boolean));
	}
	
	return Promise.resolve(false);
}

/**
 * Load fonts with fallback
 */
export function loadFontsWithFallback() {
	if (typeof document === 'undefined') return Promise.resolve();
	
	return new Promise<void>((resolve) => {
		if ('fonts' in document) {
			document.fonts.ready.then(() => {
				resolve();
			});
		} else {
			// Fallback for browsers without Font Loading API
			setTimeout(resolve, 100);
		}
	});
}

/**
 * Create optimized Google Fonts URL
 */
export function createGoogleFontsUrl(configs: FontConfig[] = fontConfigs): string {
	const families = configs.map(config => {
		const weights = config.weights.join(';');
		return `family=${config.family}:wght@${weights}`;
	}).join('&');
	
	return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
