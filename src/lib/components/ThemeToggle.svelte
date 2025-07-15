<script lang="ts">
	import { setMode } from 'mode-watcher';
	import { Sun, Moon, Monitor } from 'lucide-svelte';
	import * as Select from '$lib/components/ui/select';

	const themeOptions = [
		{ value: 'light', label: 'Light', icon: Sun },
		{ value: 'dark', label: 'Dark', icon: Moon },
		{ value: 'system', label: 'System', icon: Monitor }
	];

	let selectedTheme = 'system';

	const getTheme = () => selectedTheme;

	const setTheme = (themeValue: string) => {
		setMode(themeValue as 'light' | 'dark' | 'system');
		selectedTheme = themeValue;
	};
</script>

<div class="w-36">
	<Select.Root type="single" bind:value={getTheme, setTheme}>
		<Select.Trigger>
			<div class="flex items-center gap-2">
				<svelte:component
					this={themeOptions.find((o) => o.value === selectedTheme)?.icon || Monitor}
					class="h-4 w-4"
				/>
				<span class="hidden sm:inline"
					>{themeOptions.find((o) => o.value === selectedTheme)?.label || 'Theme'}</span
				>
			</div>
		</Select.Trigger>
		<Select.Content>
			{#each themeOptions as themeOption}
				<Select.Item value={themeOption.value}>
					<div class="flex items-center gap-2">
						<svelte:component this={themeOption.icon} class="h-4 w-4" />
						<span>{themeOption.label}</span>
					</div>
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
