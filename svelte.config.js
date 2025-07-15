import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	base: process.env.BASE_PATH || '/',
	kit: {
		adapter: adapter({
			pages: 'dist',
			assets: 'dist',
			precompress: false,
			strict: true
		})
	}
};

export default config;
