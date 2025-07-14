<script lang="ts">
	import Button from './ui/button/button.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import { FileDown, Play, Users, Settings, FileUp } from 'lucide-svelte';
	import { base } from '$app/paths';

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
				<img src="{base}/favicon.svg" alt="Logo" class="w-24" />
			</div>

			<div class="flex items-center space-x-2">
				<Button onclick={onImport} class="flex items-center space-x-2">
					<FileUp class="w-4 h-4" />
					<span>Import</span>
				</Button>
				<Button onclick={onSettings} class="flex items-center space-x-2">
					<Settings class="w-4 h-4" />
					<span>Settings</span>
				</Button>
				<Button onclick={onUsers} class="flex items-center space-x-2">
					<Users class="w-4 h-4" />
					<span>Users</span>
				</Button>
				<Button onclick={onPreview} class="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700">
					<Play class="w-4 h-4" />
					<span>Preview</span>
				</Button>
				<Button onclick={onExport} class="flex items-center space-x-2 bg-green-600 text-white hover:bg-green-700">
					<FileDown class="w-4 h-4" />
					<span>Export</span>
				</Button>
				<ThemeToggle />
			</div>
		</div>
	</div>
</nav> 
