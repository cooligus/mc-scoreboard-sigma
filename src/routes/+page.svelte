<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Collapsible } from 'bits-ui';
	import { writable } from 'svelte/store';
	import { dndzone } from 'svelte-dnd-action';
	import { v4 as uuid } from 'uuid';
	import {
		parseMcfunctionScript,
		parseCommands,
		getUserFromUsername,
		generateCommands as generateCommandsUtil,
		escapeRegexSpecialChars
	} from '$lib/parsers';
	import { runPreview as runPreviewUtil } from '$lib/preview';
	import type { Command, UserFunction } from '$lib/interfaces';
	import { scriptSettings } from '$lib/stores/settings';
	import Fa from 'svelte-fa'
	import { faGripLines, faTrash } from '@fortawesome/free-solid-svg-icons'

	const users = writable<UserFunction[]>([
		{ name: 'Wiesiek', scriptPrefix: 'W', format: 'function characters:wiesiek {Line: "%s"}' }
	]);

	const commands = writable<Command[]>([]);
	const finalScript = writable<string>('');
	const rawScript = writable<string>('');
	const rawMcfunction = writable<string>('');

	const importDialogOpen = writable(false);
	const settingsDialogOpen = writable(false);
	const usersDialogOpen = writable(false);
	const generateDialogOpen = writable(false);

	const parseCommandsOnClick = () => {
		const parsedCommands = parseCommands($rawScript, $users, $scriptSettings.characterMultiplier, $scriptSettings.minimalSpan);
		commands.set(parsedCommands);
		importDialogOpen.set(false);
	};

	const parseMcfunctionScriptOnClick = () => {
		const {
			scriptName,
			initialCounter,
			commands: parsedCommands,
			initialSpan
		} = parseMcfunctionScript($rawMcfunction);

		const updatedCommands = parsedCommands.map((command) => {
			let matchedUser: UserFunction | undefined = undefined;
			let matchedContent = command.content;
			for (const user of $users as UserFunction[]) {
				const formatRegex = escapeRegexSpecialChars(user.format).replace(/%s/, '(.+)');
				const match = matchedContent.match(new RegExp(`^${formatRegex}$`));
				if (match) {
					matchedUser = user;
					matchedContent = match[1];
					break;
				}
			}
			return { ...command, user: matchedUser, content: matchedContent };
		});

		commands.set(updatedCommands);
		scriptSettings.set({ 
			name: scriptName, 
			initialCounter, 
			initialSpan: initialSpan ?? 10,
			characterMultiplier: $scriptSettings.characterMultiplier,
			minimalSpan: $scriptSettings.minimalSpan
		});
		importDialogOpen.set(false);
	};

	const addCommand = (userName: string) => {
		const user = getUserFromUsername(userName, $users);
		if (!user) {
			console.error(`User ${userName} not found`);
			return;
		}
		commands.update((commands) => [...commands, { id: uuid(), user, span: 0, content: '' }]);
	};

	const removeCommand = (commandId: string) => {
		commands.update((commands) => commands.filter((cmd) => cmd.id !== commandId));
	};

	const changeCommandUser = (commandId: string, userName: string) => {
		const user = getUserFromUsername(userName, $users);
		if (!user) {
			console.error(`User ${userName} not found`);
			return;
		}
		commands.update((commands) =>
			commands.map((cmd) => (cmd.id === commandId ? { ...cmd, user } : cmd))
		);
	};

	const increaseAllSpans = (amount: number = 20) => {
		commands.update((commands) =>
			commands.map((cmd) => ({ ...cmd, span: cmd.span + amount }))
		);
	};

	const decreaseAllSpans = (amount: number = 20) => {
		commands.update((commands) =>
			commands.map((cmd) => ({ ...cmd, span: Math.max(0, cmd.span - amount) }))
		);
	};

	const generateCommands = () => {
		const wholeScriptContent = generateCommandsUtil($commands, $scriptSettings);
		finalScript.set(wholeScriptContent);
	};

	const previewVisible = writable<boolean>(false);
	const currentPreviewCommand = writable<string>('');
	const previewIndex = writable<number>(-1);

	const runPreview = () => {
		runPreviewUtil($commands, $scriptSettings, {
			setPreviewVisible: (visible) => {
				previewVisible.set(visible);
			},
			setPreviewIndex: (index) => {
				previewIndex.set(index);
			},
			setCurrentPreviewCommand: (command) => {
				currentPreviewCommand.set(command);
			}
		});
	};

	const handleImport = () => importDialogOpen.set(true);
	const handleSettings = () => settingsDialogOpen.set(true);
	const handleUsers = () => usersDialogOpen.set(true);
	const handlePreview = () => {
		runPreview();
	};
	const handleExport = () => {
		generateCommands();
		generateDialogOpen.set(true);
	};
</script>

<Navbar 
	onImport={handleImport}
	onSettings={handleSettings}
	onUsers={handleUsers}
	onPreview={handlePreview}
	onExport={handleExport}
/>

<div class="container mx-auto p-4">
	<div class="text-center mb-8">
		<h1 class="text-4xl font-bold text-gray-800 mb-2">Scoreboard Sigma</h1>
		<p class="text-gray-600">Minecraft Java Edition Command Generator</p>
	</div>

	<section class="mb-8 rounded-lg border p-6 shadow-md">
		<h2 class="mb-4 text-2xl font-semibold">Commands</h2>
		<div class="mb-4 flex gap-2">
			<Button onclick={() => increaseAllSpans(5)} class="flex-1">+5 All Spans</Button>
			<Button onclick={() => decreaseAllSpans(5)} class="flex-1">-5 All Spans</Button>
		</div>
		<div
			use:dndzone={{ items: $commands, flipDurationMs: 50 }}
			on:consider={(e) => {
				commands.set(e.detail.items);
			}}
			on:finalize={(e) => {
				commands.set(e.detail.items);
			}}
		>
			{#each $commands as command, index (command.id)}
				<div class="mb-4 flex items-center rounded-md border p-4">
					<span class="handle mr-4 cursor-grab">
						<Fa icon={faGripLines} />
					</span>
					<div class="flex-1">
						<div class="mb-2 flex gap-3 items-center justify-between">
							<select
								id="commandUser-{index}"
								class="w-full h-full rounded border px-3 py-1 text-sm bg-black text-white"
								value={command.user?.name || ''}
								on:change={(e) => {
									const target = e.target as HTMLSelectElement | null;
									if (target) changeCommandUser(command.id, target.value);
								}}
							>
								<option value="">No user</option>
								{#each $users as user}
									<option value={user.name}>{user.name}</option>
								{/each}
							</select>
							<label for="commandSpanMultiplier-{index}" class="block text-xs">seconds:</label>
							<Input
								id="commandSpanMultiplier-{index}"
								type="number"
								class="w-20"
								value={command.span / 20}
								on:input={(e) => {
									const target = e.target as HTMLInputElement | null;
									if (target) command.span = Number(target.value) * 20;
								}}
							/>
							<label for="commandSpan-{index}" class="block text-xs">ticks:</label>
							<Input
								id="commandSpan-{index}"
								type="number"
								class="w-20"
								bind:value={command.span}
							/>
							<button
								class="text-red-500 hover:text-red-700 w-6 h-6 flex items-center justify-center"
								on:click={() => removeCommand(command.id)}
								title="Remove command"
								aria-label="Remove command"
							>
								<Fa icon={faTrash} />
							</button>
						</div>
						<Textarea
							id="commandContent-{index}"
							bind:value={command.content}
							class="mb-2 min-h-[3em]"
						/>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-4 flex flex-wrap gap-2">
			{#each $users as user}
				<Button onclick={() => addCommand(user.name)}>+ {user.name}</Button>
			{/each}
		</div>
	</section>

	<Dialog.Root bind:open={$importDialogOpen}>
		<Dialog.Content class="max-w-4xl">
			<Dialog.Header>
				<Dialog.Title>Import Scripts</Dialog.Title>
			</Dialog.Header>
			<div class="space-y-6">
				<section class="rounded-lg border p-4">
					<h3 class="mb-4 text-xl font-semibold">Import dialogues script</h3>
					<Textarea
						bind:value={$rawScript}
						class="mb-4 min-h-[10em]"
						placeholder="Paste your raw script here..."
					/>
					<Button onclick={parseCommandsOnClick} class="w-full">Import Commands</Button>
				</section>

				<section class="rounded-lg border p-4">
					<h3 class="mb-4 text-xl font-semibold">Import mcfunction script</h3>
					<Textarea
						bind:value={$rawMcfunction}
						class="mb-4 min-h-[10em]"
						placeholder="Paste your raw script here..."
					/>
					<Button onclick={parseMcfunctionScriptOnClick} class="w-full">Import Commands</Button>
				</section>
			</div>
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root bind:open={$settingsDialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Script Settings</Dialog.Title>
			</Dialog.Header>
			<div class="space-y-4">
				<div>
					<label for="scriptName" class="block text-sm font-medium">Script Name</label>
					<Input id="scriptName" bind:value={$scriptSettings.name} placeholder="e.g., my_command_script" />
				</div>
				<div>
					<label for="initialCounter" class="block text-sm font-medium">Initial Counter</label>
					<Input id="initialCounter" type="number" bind:value={$scriptSettings.initialCounter} />
				</div>
				<div>
					<label for="initialSpan" class="block text-sm font-medium">Initial Span</label>
					<Input id="initialSpan" type="number" bind:value={$scriptSettings.initialSpan} />
				</div>
				<div>
					<label for="characterMultiplier" class="block text-sm font-medium">Character Multiplier</label>
					<Input id="characterMultiplier" type="number" bind:value={$scriptSettings.characterMultiplier} />
				</div>
				<div>
					<label for="minimalSpan" class="block text-sm font-medium">Minimal Span</label>
					<Input id="minimalSpan" type="number" bind:value={$scriptSettings.minimalSpan} />
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root bind:open={$usersDialogOpen}>
		<Dialog.Content class="max-w-4xl">
			<Dialog.Header>
				<Dialog.Title>Manage Users</Dialog.Title>
			</Dialog.Header>
			<div class="space-y-4">
				{#each $users as user, index}
					<div class="flex flex-col gap-4 rounded-md border p-4 md:flex-row">
						<div class="flex-1">
							<label for="userName-{index}" class="block text-sm font-medium">Name</label>
							<Input id="userName-{index}" bind:value={user.name} placeholder="Function Name" />
						</div>
						<div class="flex-1">
							<label for="scriptPrefix-{index}" class="block text-sm font-medium">Script Prefix</label>
							<Input id="scriptPrefix-{index}" bind:value={user.scriptPrefix} placeholder="e.g., W" />
						</div>
						<div class="flex-1">
							<label for="format-{index}" class="block text-sm font-medium">Format</label>
							<Input id="format-{index}" bind:value={user.format} placeholder="e.g., Wiesiek: " />
						</div>
					</div>
				{/each}
				<Button
					onclick={() =>
						users.update((users) => [...users, { name: '', scriptPrefix: '', format: '' }])}
					class="w-full">Add New User</Button>
			</div>
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root bind:open={$generateDialogOpen}>
		<Dialog.Content class="max-w-4xl">
			<Dialog.Header>
				<Dialog.Title>Generated Script</Dialog.Title>
			</Dialog.Header>
			<div class="space-y-4">
				<Textarea bind:value={$finalScript} class="min-h-[20em]" readonly />
				<div class="flex gap-2">
					<Button onclick={() => navigator.clipboard.writeText($finalScript)} class="flex-1">Copy to Clipboard</Button>
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Root>

	{#if $previewVisible}
		<div class="fixed bottom-4 right-4 z-50 max-w-md rounded-lg border bg-white p-4 shadow-lg text-black">
			<div class="mb-2 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-gray-900">Preview</h3>
				<Button
					class="text-gray-500 hover:text-gray-700"
					onclick={() => previewVisible.set(false)}
				>
					✕
				</Button>
			</div>
			<div class="text-gray-600 mb-2 text-sm">
				Command {$previewIndex + 1} of {$commands.length}
			</div>
			<div class="bg-gray-100 rounded border p-3 font-mono text-sm text-gray-900">
				{$currentPreviewCommand || 'Waiting...'}
			</div>
		</div>
	{/if}
</div>
