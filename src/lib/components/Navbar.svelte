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

<nav class="bg-gray-800 text-white shadow-lg dark:bg-gray-900">
	<div class="container mx-auto px-4">
		<div class="flex h-16 items-center justify-between">
			<div class="flex items-center space-x-3">
				<img src="{base}/favicon.svg" alt="Logo" class="w-24" />
			</div>

			<div class="flex items-center space-x-2">
				<Button onclick={onImport}>
					<FileUp />
					<span>Import</span>
				</Button>
				<Button onclick={onSettings}>
					<Settings />
					<span>Settings</span>
				</Button>
				<Button onclick={onUsers}>
					<Users />
					<span>Users</span>
				</Button>
				<Button onclick={onPreview} class="bg-blue-600 text-white hover:bg-blue-700">
					<Play />
					<span>Preview</span>
				</Button>
				<Button onclick={onExport} class="bg-green-600 text-white hover:bg-green-700">
					<FileDown />
					<span>Export</span>
				</Button>
				<ThemeToggle />
			</div>
		</div>
	</div>
</nav>
