import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				'title': ['Orbitron', ...fontFamily.mono],
				'mono': ['Rajdhani', ...fontFamily.mono],
				'body': ['Rajdhani', ...fontFamily.sans],
			},
			colors: {
				'cyber': {
					50: '#f8fafc',
					100: '#f1f5f9',
					200: '#e2e8f0',
					300: '#cbd5e1',
					400: '#94a3b8',
					500: '#64748b',
					600: '#475569',
					700: '#334155',
					800: '#1e293b',
					900: '#0f172a',
					950: '#020617'
				}
			},
			animation: {
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'flicker': 'flicker 0.15s infinite linear',
				'terminal-cursor': 'blink 1s infinite',
			},
			keyframes: {
				flicker: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' },
					'25%, 75%': { opacity: '0.9' }
				},
				blink: {
					'0%, 50%': { opacity: '1' },
					'51%, 100%': { opacity: '0' }
				}
			}
		}
	},
	plugins: []
};
