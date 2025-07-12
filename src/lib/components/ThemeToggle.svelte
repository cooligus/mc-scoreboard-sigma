<script lang="ts">
    import { userPrefersMode, setMode } from 'mode-watcher';
	import Fa from 'svelte-fa';
	import { faSun, faMoon, faDesktop } from '@fortawesome/free-solid-svg-icons';
	import { Root as CollapsibleRoot, Trigger as CollapsibleTrigger, Content as CollapsibleContent } from '$lib/components/ui/collapsible';

	let isOpen = false;

	const themes = [
		{ value: 'light', label: 'Light', icon: faSun },
		{ value: 'dark', label: 'Dark', icon: faMoon },
		{ value: 'system', label: 'System', icon: faDesktop }
	];

	function handleThemeChange(themeValue: string) {
		setMode(themeValue as 'light' | 'dark' | 'system');
		isOpen = false;
	}

	function getCurrentIcon() {
		const currentTheme = userPrefersMode.current;
		const themeConfig = themes.find(t => t.value === currentTheme);
		return themeConfig?.icon || faDesktop;
	}
</script>

<div class="relative">
	<CollapsibleRoot bind:open={isOpen}>
		<CollapsibleTrigger class="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors">
			<Fa icon={getCurrentIcon()} />
			<span class="hidden sm:inline">Theme</span>
		</CollapsibleTrigger>
		
		<CollapsibleContent class="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg border z-50 bg-gray-800 dark:bg-gray-900 text-white">
			<div class="py-1">
				{#each themes as themeOption}
					<button
						class="w-full flex items-center space-x-3 px-4 py-2 text-left"
						onclick={() => handleThemeChange(themeOption.value)}
					>
						<Fa icon={themeOption.icon} />
						<span>{themeOption.label}</span>
					</button>
				{/each}
			</div>
		</CollapsibleContent>
	</CollapsibleRoot>
</div> 