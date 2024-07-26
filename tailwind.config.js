import containerPlugin from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				surface: {
					1: 'var(--surface-1)',
					2: 'var(--surface-2)',
					3: 'var(--surface-3)',
					4: 'var(--surface-4)',
					5: 'var(--surface-5)',
					6: 'var(--surface-6)',
					7: 'var(--surface-7)',
					8: 'var(--surface-8)',
					9: 'var(--surface-9)',
					10: 'var(--surface-10)'
				},
				primary: 'var(--primary)',
				on: {
					surface: {
						1: 'var(--text-1)',
						2: 'var(--text-2)',
						3: 'var(--text-3)',
						4: 'var(--text-4)',
						5: 'var(--text-5)',
						6: 'var(--text-6)',
						7: 'var(--text-7)',
						8: 'var(--text-8)',
						9: 'var(--text-9)',
						10: 'var(--text-10)'
					},
					primary: 'var(--on-primary)'
				}
			}
		}
	},
	plugins: [containerPlugin]
};
