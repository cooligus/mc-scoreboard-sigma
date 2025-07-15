<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { writable, get } from 'svelte/store';
	import { dndzone } from 'svelte-dnd-action';
	import { FileDown, Play, Users, Settings, FileUp, CirclePause } from 'lucide-svelte';
	import {
		parseMcfunctionScript,
		parseCommands,
		getUserFromUsername,
		generateCommands as generateCommandsUtil,
		escapeRegexSpecialChars,
		createCommand
	} from '$lib/parsers';
	import { runPreview as runPreviewUtil, cancelPreview } from '$lib/preview';
	import type { Command, UserFunction } from '$lib/interfaces';
	import { scriptSettings } from '$lib/stores/settings';
	import { GripVertical, Trash2, Wine, X } from 'lucide-svelte';
	import * as Select from '$lib/components/ui/select';
	import * as Card from '$lib/components/ui/card';
	import Switch from '$lib/components/ui/switch/switch.svelte';

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
	const confirmDeleteDialogOpen = writable(false);

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
		{
			label: 'Settings',
			onclick: handleSettings,
			title: 'Settings',
			icon: Settings,
			variant: 'ghost'
		},
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
		commands.update((commands) => [...commands, createCommand(undefined, isCustom, 0, user)]);
	};

	const removeCommand = (commandId: string) => {
		commands.update((commands) => commands.filter((cmd) => cmd.id !== commandId));
		editCommandData.set(null);
		editCommandDialogOpen.set(false);
		confirmDeleteDialogOpen.set(false);
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
	const previewBeggining = writable<string | null>(null);
	const previewEnd = writable<string | null>(null);

	const runPreview = () => {
		runPreviewUtil($commands, $scriptSettings.initialSpan, {
			setPreviewVisible: (visible) => previewVisible.set(visible),
			setPreviewIndex: (index) => previewIndex.set(index),
			setCurrentPreviewCommand: (command) => currentPreviewCommand.set(command)
		}, $previewBeggining, $previewEnd);
	};

	const removeUser = (index: number) => {
		users.update((us) => us.filter((_, i) => i !== index));
	};

	const editCommandDialogOpen = writable(false);
	const editCommandData = writable<Command | null>(null);
	const spanDisplayMode = writable<'seconds' | 'ticks'>('seconds');

	function spanDisplayModeValue(command: Command, mode: 'seconds' | 'ticks' = 'seconds') {
		return mode === 'seconds' ? command.span / 20 : command.span;
	}

	const editedSpanValue = writable<number>(0);

	const openEditCommandDialog = (command: Command) => {
		editedSpanValue.set(spanDisplayModeValue(command, get(spanDisplayMode)));
		editCommandData.set({ ...command });
		editUserName.set(command.user?.name || '');
		editCommandDialogOpen.set(true);
	};

	const updateEditCommandField = (field: keyof Command, value: any) => {
		const edited = get(editCommandData);
		if (!edited) return;
		const updated = { ...edited, [field]: value };
		editCommandData.set(updated);
		commands.update((cmds) =>
			cmds.map((cmd) => (cmd.id === updated.id ? { ...cmd, ...updated } : cmd))
		);
	};

	const editUserName = writable('');

	$: if ($editCommandData && $editUserName !== ($editCommandData.user?.name || '')) {
		const user = $users.find((u) => u.name === $editUserName);
		if ($editCommandData && user !== $editCommandData.user) {
			updateEditCommandField('user', user);
		}
	}
</script>

<Navbar buttons={navbarButtons} />

<div class="container mx-auto p-4">
	<section class="mb-8 p-6 shadow-md">
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
				<div class="flex items-center rounded-md p-4">
					<span class="handle mr-4 cursor-grab">
						<GripVertical class="h-4 w-4" />
					</span>
					<div class="flex-1">
						<div class="flex items-center gap-2">
							{#if !command.isCustom}
								<div class="flex items-center justify-between gap-3">
									<p class="min-w-[5em] text-sm">{command.user?.name || 'No user'}</p>
									{#if $spanDisplayMode === 'seconds'}
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
									{:else if $spanDisplayMode === 'ticks'}
										<Input
											id="commandSpan-{index}"
											type="number"
											class="w-20"
											bind:value={command.span}
										/>
									{/if}
								</div>
							{/if}
							<Textarea
								id="commandContent-{index}"
								bind:value={command.content}
								class="min-h-[3em]"
							/>
							<div class="group flex min-w-[5em]">
								<Button
									variant="ghost"
									onclick={() => openEditCommandDialog(command)}
									title="Edit command"
									aria-label="Edit command"
								>
									<Settings />
								</Button>

								{#if command.id === $previewBeggining}
									<Button
										variant="success"
										title="Unset the beggining of the preview"
										aria-label="Unset the beggining of the preview"
										onclick={() => previewBeggining.set(null)}
									>
										<Play />
									</Button>
								{:else}
									<Button
										variant="hidden"
										title="Set the beggining of the preview"
										aria-label="Set the beggining of the preview"
										onclick={() => previewBeggining.set(command.id)}
									>
										<Play />
									</Button>
								{/if}
								{#if command.id === $previewEnd}
									<Button
										variant="destructive"
										title="Unset the end of the preview"
										aria-label="Unset the end of the preview"
										onclick={() => previewEnd.set(null)}
									>
										<CirclePause />
									</Button>
								{:else}
									<Button
										variant="hidden"
										title="Set the end of the preview"
										aria-label="Set the end of the preview"
										onclick={() => previewEnd.set(command.id)}
									>
										<CirclePause />
									</Button>
								{/if}
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
				<div>
					<label class="block text-sm font-medium" for="custom-command-dialog-switch"
						>Display Span as</label
					>
					<Select.Root type="single" bind:value={$spanDisplayMode}>
						<Select.Trigger id="custom-command-dialog-switch"
							>{$spanDisplayMode === 'seconds' ? 'Seconds' : 'Ticks'}</Select.Trigger
						>
						<Select.Content>
							<Select.Item value="seconds">Seconds</Select.Item>
							<Select.Item value="ticks">Ticks</Select.Item>
						</Select.Content>
					</Select.Root>
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
					<div class="flex flex-col items-center gap-4 rounded-md border p-4 md:flex-row">
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

	<Dialog.Root bind:open={$editCommandDialogOpen}>
		<Dialog.Content class="max-w-lg">
			<Dialog.Header>
				<Dialog.Title>Edit Command</Dialog.Title>
			</Dialog.Header>
			{#if $editCommandData}
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium">User</label>
						<Select.Root type="single" bind:value={$editUserName}>
							<Select.Trigger>{$editCommandData?.user?.name || 'No user'}</Select.Trigger>
							<Select.Content>
								<Select.Item value="">No user</Select.Item>
								{#each $users as user}
									<Select.Item value={user.name}>{user.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
					<div class="flex items-center gap-2">
						<label class="block text-sm font-medium">Custom Command</label>
						<Switch
							bind:checked={
								() => $editCommandData.isCustom, (v) => updateEditCommandField('isCustom', v)
							}
						/>
					</div>
					<div class="mt-4 flex gap-2">
						<Button
							variant="destructive"
							onclick={() => confirmDeleteDialogOpen.set(true)}
							title="Remove command"
							aria-label="Remove command"
						>
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
				</div>
			{/if}
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root bind:open={$confirmDeleteDialogOpen}>
		<Dialog.Content class="max-w-lg">
			<Dialog.Header>
				<Dialog.Title>Confirm Delete</Dialog.Title>
			</Dialog.Header>
			<Dialog.Footer>
				<Button onclick={() => confirmDeleteDialogOpen.set(false)}>No</Button>
				<Button variant="destructive" onclick={() => removeCommand($editCommandData?.id!)}
					>Yes</Button
				>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	{#if $previewVisible}
		<Card.Root class="fixed bottom-4 right-4 z-50 max-w-md shadow-lg">
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-lg font-semibold">Preview</Card.Title>
				<Button
					onclick={() => {
						previewVisible.set(false);
						cancelPreview();
					}}
				>
					<X class="h-4 w-4" />
				</Button>
			</Card.Header>
			<Card.Content>
				<div class="mb-2 text-sm">
					Command {$previewIndex + 1} of {$commands.length}
				</div>
				<div class="rounded border p-3 font-mono text-sm">
					{$currentPreviewCommand || 'Waiting...'}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
