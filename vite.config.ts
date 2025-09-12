import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	
	// Optimize dependencies and font loading
	optimizeDeps: {
		include: ['@fontsource/orbitron', '@fontsource/rajdhani']
	},
	
	// Enable font preloading in build
	build: {
		rollupOptions: {
			output: {
				// Separate font assets for better caching
				assetFileNames: (assetInfo) => {
					if (assetInfo.name && /\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.name)) {
						return 'fonts/[name]-[hash][extname]';
					}
					return 'assets/[name]-[hash][extname]';
				}
			}
		}
	}
});
