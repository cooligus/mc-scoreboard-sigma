<script lang="ts">
    import { setMode } from 'mode-watcher';
	import { Sun, Moon, Monitor } from 'lucide-svelte';
	import { Root as CollapsibleRoot, Trigger as CollapsibleTrigger, Content as CollapsibleContent } from '$lib/components/ui/collapsible';

	let isOpen = false;

	const themeOptions = [
		{ value: 'light', label: 'Light', icon: Sun },
		{ value: 'dark', label: 'Dark', icon: Moon },
		{ value: 'system', label: 'System', icon: Monitor }
	];

	let selectedTheme = 'system';

	function handleThemeChange(themeValue: string) {
		setMode(themeValue as 'light' | 'dark' | 'system');
		isOpen = false;
	}

	function getCurrentIcon() {
		return themeOptions.find(option => option.value === selectedTheme)?.icon || Monitor;
	}
</script>

<div class="relative">
	<CollapsibleRoot bind:open={isOpen}>
		<CollapsibleTrigger class="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors">
			<svelte:component this={getCurrentIcon()} class="w-4 h-4" />
			<span class="hidden sm:inline">Theme</span>
		</CollapsibleTrigger>
		
		<CollapsibleContent class="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg border z-50 bg-gray-800 dark:bg-gray-900 text-white">
			<div class="py-1">
				{#each themeOptions as themeOption}
					<button
						class="w-full flex items-center space-x-3 px-4 py-2 text-left"
						onclick={() => handleThemeChange(themeOption.value)}
					>
						<svelte:component this={themeOption.icon} class="w-4 h-4" />
						<span>{themeOption.label}</span>
					</button>
				{/each}
			</div>
		</CollapsibleContent>
	</CollapsibleRoot>
</div> 