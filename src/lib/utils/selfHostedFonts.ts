/**
 * Self-hosted font loading utilities for optimal performance
 * Uses @fontsource packages for local font files
 */

// Import critical font weights for immediate loading
import '@fontsource/rajdhani/400.css';
import '@fontsource/rajdhani/500.css';
import '@fontsource/orbitron/400.css';
import '@fontsource/orbitron/700.css';

// Lazy load additional weights
export async function loadAdditionalFonts() {
	if (typeof window === 'undefined') return;
	
	// Load additional Rajdhani weights
	await Promise.all([
		import('@fontsource/rajdhani/300.css'),
		import('@fontsource/rajdhani/600.css'),
		import('@fontsource/rajdhani/700.css')
	]);
	
	// Load additional Orbitron weights
	await Promise.all([
		import('@fontsource/orbitron/500.css'),
		import('@fontsource/orbitron/900.css')
	]);
}

/**
 * Preload critical font files for better performance
 */
export function preloadSelfHostedFonts() {
	if (typeof document === 'undefined') return;
	
	const criticalFonts = [
		'/node_modules/@fontsource/rajdhani/files/rajdhani-latin-400-normal.woff2',
		'/node_modules/@fontsource/rajdhani/files/rajdhani-latin-500-normal.woff2',
		'/node_modules/@fontsource/orbitron/files/orbitron-latin-400-normal.woff2',
		'/node_modules/@fontsource/orbitron/files/orbitron-latin-700-normal.woff2'
	];
	
	criticalFonts.forEach(fontPath => {
		const link = document.createElement('link');
		link.rel = 'preload';
		link.as = 'font';
		link.type = 'font/woff2';
		link.crossOrigin = 'anonymous';
		link.href = fontPath;
		document.head.appendChild(link);
	});
}
