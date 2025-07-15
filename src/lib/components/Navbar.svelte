<script lang="ts">
	export let buttons: any[] = [];
	import ThemeToggle from './ThemeToggle.svelte';
	import { base } from '$app/paths';
	import Button from './ui/button/button.svelte';
</script>

<nav
	class="sticky top-0 z-40 border-b border-green-100 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
>
	<div class="container mx-auto px-4 py-4">
		<div class="flex items-center justify-between">
			<img src="{base}/favicon.svg" alt="Logo" class="w-24" />
			<div class="flex items-center space-x-2">
				{#if buttons && buttons.length}
					{#each buttons as button}
						<Button variant={button.variant} onclick={button.onclick} title={button.title} href={button.href}>
							{#if button.icon}
								<button.icon />
							{/if}
							<span>{button.label}</span>
						</Button>
					{/each}
					<ThemeToggle />
				{/if}
			</div>
		</div>
	</div>
</nav>