<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { writable } from 'svelte/store';
	import { dndzone } from 'svelte-dnd-action';
	import { FileDown, Play, Users, Settings, FileUp } from 'lucide-svelte';
	import {
		parseMcfunctionScript,
		parseCommands,
		getUserFromUsername,
		generateCommands as generateCommandsUtil,
		escapeRegexSpecialChars,
		createCommand
	} from '$lib/parsers';
	import { runPreview as runPreviewUtil } from '$lib/preview';
	import type { Command, UserFunction } from '$lib/interfaces';
	import { scriptSettings } from '$lib/stores/settings';
	import { GripVertical, Trash2, Wine, X } from 'lucide-svelte';
	import * as Select from '$lib/components/ui/select';

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

	const navbarButtons = [
		{ label: 'Import', onclick: handleImport, title: 'Import', icon: FileUp, variant: 'ghost' },
		{ label: 'Settings', onclick: handleSettings, title: 'Settings', icon: Settings, variant: 'ghost' },
		{ label: 'Users', onclick: handleUsers, title: 'Users', icon: Users },
		{ label: 'Preview', onclick: handlePreview, title: 'Preview', icon: Play, variant: 'blue' },
		{ label: 'Export', onclick: handleExport, title: 'Export', icon: FileDown, variant: 'success' }
	];

	const parseCommandsOnClick = () => {
		const parsedCommands = parseCommands(
			$rawScript,
			$users,
			$scriptSettings.characterMultiplier,
			$scriptSettings.minimalSpan
		);
		commands.set(parsedCommands);
		importDialogOpen.set(false);
	};

	const parseMcfunctionScriptOnClick = () => {
		const {
			scriptName,
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
			return {
				...command,
				user: matchedUser,
				userName: matchedUser?.name || '',
				content: matchedContent,
				isCustom: command.isCustom
			};
		});

		commands.set(updatedCommands);
		scriptSettings.set({
			name: scriptName,
			initialSpan: initialSpan ?? 10,
			characterMultiplier: $scriptSettings.characterMultiplier,
			minimalSpan: $scriptSettings.minimalSpan
		});
		importDialogOpen.set(false);
	};

	const addCommand = (userName: string, isCustom?: boolean) => {
		const user = getUserFromUsername(userName, $users);
		commands.update((commands) => [
			...commands,
			createCommand(undefined, isCustom, 0, user)
		]);
	};

	const removeCommand = (commandId: string) => {
		commands.update((commands) => commands.filter((cmd) => cmd.id !== commandId));
	};


	const increaseAllSpans = (amount: number = 20) => {
		commands.update((commands) => commands.map((cmd) => ({ ...cmd, span: cmd.span + amount })));
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

	const toggleCommandCustom = (commandId: string) => {
		commands.update((cmds) =>
			cmds.map((cmd) =>
				cmd.id === commandId ? { ...cmd, isCustom: !cmd.isCustom } : cmd
			)
		);
	};

	const removeUser = (index: number) => {
		users.update((us) => us.filter((_, i) => i !== index));
	};

	$: {
		$commands.forEach((cmd) => {
			if (cmd.userName !== (cmd.user?.name || '')) {
				cmd.user = getUserFromUsername(cmd.userName || '', $users) || undefined;
			}
		});
	}
</script>

<Navbar buttons={navbarButtons} />

<div class="container mx-auto p-4">
	<div class="mb-8 text-center">
		<h1 class="mb-2 text-4xl font-bold">MCJ Wyniki</h1>
		<p class="">Minecraft Java Edition Dialogue Generator</p>
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
						<GripVertical class="h-4 w-4" />
					</span>
					<div class="flex-1">
						{#if !command.isCustom}
						<div class="mb-2 flex items-center justify-between gap-3">
							<Select.Root type="single" bind:value={command.userName}>
								<Select.Trigger>{command.userName || 'No user'}</Select.Trigger>
								<Select.Content>
									<Select.Item value="">No user</Select.Item>
									{#each $users as user}
										<Select.Item value={user.name}>{user.name}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
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
						</div>
						{/if}
						<div class="flex items-center gap-2">
						<Textarea
							id="commandContent-{index}"
							bind:value={command.content}
							class="mb-2 min-h-[3em]"
						/>
						<div class="flex flex-col space-between gap-2">
							<Button
								variant="ghost"
								onclick={() => removeCommand(command.id)}
								title="Remove command"
								aria-label="Remove command"
							>
								<Trash2 class="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								onclick={() => toggleCommandCustom(command.id)}
								title="Toggle custom mode"
								aria-label="Toggle custom mode"
							>
								<Wine class="h-4 w-4" />
							</Button>
						</div>
							
						</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-4 flex flex-wrap gap-2">
			{#each $users as user}
				<Button onclick={() => addCommand(user.name)}>+ {user.name}</Button>
			{/each}
			<Button onclick={() => addCommand('', true)}>+ Custom</Button>
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
					<Input
						id="scriptName"
						bind:value={$scriptSettings.name}
						placeholder="e.g., my_command_script"
					/>
				</div>
				<div>
					<label for="initialSpan" class="block text-sm font-medium">Initial Span</label>
					<Input id="initialSpan" type="number" bind:value={$scriptSettings.initialSpan} />
				</div>
				<div>
					<label for="characterMultiplier" class="block text-sm font-medium"
						>Character Multiplier</label
					>
					<Input
						id="characterMultiplier"
						type="number"
						bind:value={$scriptSettings.characterMultiplier}
					/>
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
					<div class="flex flex-col gap-4 rounded-md border p-4 md:flex-row items-center">
						<div class="flex-1">
							<label for="userName-{index}" class="block text-sm font-medium">Name</label>
							<Input id="userName-{index}" bind:value={user.name} placeholder="Function Name" />
						</div>
						<div class="flex-1">
							<label for="scriptPrefix-{index}" class="block text-sm font-medium"
								>Script Prefix</label
							>
							<Input
								id="scriptPrefix-{index}"
								bind:value={user.scriptPrefix}
								placeholder="e.g., W"
							/>
						</div>
						<div class="flex-1">
							<label for="format-{index}" class="block text-sm font-medium">Format</label>
							<Input id="format-{index}" bind:value={user.format} placeholder="e.g., Wiesiek: " />
						</div>
						<Button
							variant="ghost"
							onclick={() => removeUser(index)}
							title="Delete user"
							aria-label="Delete user"
						>
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
				{/each}
				<Button
					onclick={() =>
						users.update((users) => [...users, { name: '', scriptPrefix: '', format: '' }])}
					class="w-full">Add New User</Button
				>
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
					<Button onclick={() => navigator.clipboard.writeText($finalScript)} class="flex-1"
						>Copy to Clipboard</Button
					>
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Root>

	{#if $previewVisible}
		<div
			class="fixed bottom-4 right-4 z-50 max-w-md rounded-lg border bg-gray-800 p-4 text-white shadow-lg shadow-lg dark:bg-gray-900"
		>
			<div class="mb-2 flex items-center justify-between">
				<h3 class="text-lg font-semibold">Preview</h3>
				<Button onclick={() => previewVisible.set(false)}>
					<X class="h-4 w-4" />
				</Button>
			</div>
			<div class="mb-2 text-sm">
				Command {$previewIndex + 1} of {$commands.length}
			</div>
			<div class="rounded border p-3 font-mono text-sm">
				{$currentPreviewCommand || 'Waiting...'}
			</div>
		</div>
	{/if}
</div>
