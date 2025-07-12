<script lang="ts">
	import Button from './ui/button/button.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import Fa from 'svelte-fa';
	import { faCog, faUsers, faFileImport, faPlay, faDownload } from '@fortawesome/free-solid-svg-icons';

	export let onImport: () => void;
	export let onSettings: () => void;
	export let onUsers: () => void;
	export let onPreview: () => void;
	export let onExport: () => void;
</script>

<nav class="bg-gray-800 dark:bg-gray-900 text-white shadow-lg">
	<div class="container mx-auto px-4">
		<div class="flex items-center justify-between h-16">
			<div class="flex items-center space-x-3">
				<img src="/favicon.png" alt="Logo" class="w-8 h-8" />
				<span class="text-xl font-bold">Scoreboard Sigma</span>
			</div>

			<div class="flex items-center space-x-2">
				<Button onclick={onImport} class="flex items-center space-x-2">
					<Fa icon={faFileImport} />
					<span>Import</span>
				</Button>
				<Button onclick={onSettings} class="flex items-center space-x-2">
					<Fa icon={faCog} />
					<span>Settings</span>
				</Button>
				<Button onclick={onUsers} class="flex items-center space-x-2">
					<Fa icon={faUsers} />
					<span>Users</span>
				</Button>
				<Button onclick={onPreview} class="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700">
					<Fa icon={faPlay} />
					<span>Preview</span>
				</Button>
				<Button onclick={onExport} class="flex items-center space-x-2 bg-green-600 text-white hover:bg-green-700">
					<Fa icon={faDownload} />
					<span>Export</span>
				</Button>
				<ThemeToggle />
			</div>
		</div>
	</div>
</nav> 