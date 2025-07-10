<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { Collapsible } from 'bits-ui';
	import { writable } from 'svelte/store';
	import { dndzone } from 'svelte-dnd-action';
	import { v4 as uuid } from 'uuid';
	import { escapeRegexSpecialChars, parseMcfunctionScript } from '$lib/utils';
	import type { Command, UserFunction } from '$lib/command.interface';

	interface ScriptData {
		name: string;
		initialCounter: number;
		initialSpan: number;
	}

	const users = writable<UserFunction[]>([{ name: 'Wiesiek', scriptPrefix: 'W', format: 'function characters:wiesiek {Line: "%s"}' }]);

	const commands = writable<Command[]>([]);
	const finalScript = writable<string>('');
	const rawScript = writable<string>('');
	const rawMcfunction = writable<string>('');

	// get number of alphanumerical characters and multiply by 2
	const getSpanFromLine = (line: string) => {
		const trimmedLine = line.trim();
		const characterMultiplier = 4;
		const occurences = trimmedLine.match(/[A-Za-z]+/g);
		return occurences ? occurences.length * characterMultiplier : 0;
	};

	const parseCommandsOnClick = () => {
		const parsedCommands = parseCommands($rawScript);
		commands.set(parsedCommands);
	};

	const parseCommands = (commandString: string) => {
		const commandLines = commandString.split('\n');
		const commands: Command[] = [];

		for (const line of commandLines) {
			const match = line.match(/^([A-Za-z]+): (.*)$/);
			if (match) {
				const speaker = match[1];
				const content = match[2];
				const span = getSpanFromLine(line);

				const caseInsesitiveSpeaker = speaker.toLowerCase();

				const user = $users.find(
					(user) => user.scriptPrefix.toLocaleLowerCase() === caseInsesitiveSpeaker
				);
				if (user) {
					commands.push({ id: uuid(), user, span, content });
				} else {
					console.error(`Unknown speaker: ${caseInsesitiveSpeaker}`);
				}
			} else {
				if (commands.length > 0) {
					commands[commands.length - 1].content += '\n' + line;
				} else {
					console.error(`Invalid command line: ${line}`);
				}
			}
		}

		return commands;
	};

	const parseMcfunctionScriptOnClick = () => {
		const {scriptName, initialCounter, commands: parsedCommands, initialSpan} = parseMcfunctionScript($rawMcfunction);

		const updatedCommands = parsedCommands.map((command) => {
			let matchedUser: UserFunction | undefined = undefined;
			let matchedContent = command.content;
			for (const user of $users as UserFunction[]) {
				const formatRegex = escapeRegexSpecialChars(user.format).replace(/%s/, "(.+)");
				const match = matchedContent.match(new RegExp(`^${formatRegex}$`));
				if (match) {
					matchedUser = user;
					matchedContent = match[1];
					break;
				}
			}
			return { ...command, user: matchedUser, content: matchedContent };
		});

		console.log(updatedCommands);

		commands.set(updatedCommands);
		scriptData.set({ name: scriptName, initialCounter, initialSpan: initialSpan ?? 10 });
	}

	const getUserFromUsername = (username: string) => $users.find((user: UserFunction) => user.name === username);
	const getScriptIncrementer = () =>
		`scoreboard players add @s ${$scriptData.name} ${$scriptData.initialCounter}\n`;
	const getSingleCommand = (incrementer: number, command: Command) => {
		let renderedCommand = command.content;
		if(command.user) {
			const format = command.user.format;
			renderedCommand = format.replace('%s', command.content);
		}
		return `execute if score @s ${$scriptData.name} matches ${incrementer} run ${renderedCommand}\n`;
	};
	const getScriptFinalStatement = (incrementer: number) =>
		`execute if score @s ${$scriptData.name} matches ${incrementer}.. run scoreboard players set @s ${$scriptData.name} -1\n`;
	
	const scriptData = writable<ScriptData>({ name: '', initialCounter: 1, initialSpan: 10 });

	const addCommand = (userName: string) => {
		const user = getUserFromUsername(userName);
		if (!user) {
			console.error(`User ${userName} not found`);
			return;
		}
		commands.update((commands) => [...commands, { id: uuid(), user, span: 0, content: '' }]);
	};

	const generateCommands = () => {
		const initialScriptContent = getScriptIncrementer();
		let realScriptContent = '';
		let conversationSpan = $scriptData.initialSpan;
		for (let i = 0; i < $commands.length; i++) {
			realScriptContent += getSingleCommand(conversationSpan, $commands[i]);
			conversationSpan += $commands[i].span;
		}
		const endingScriptContent = getScriptFinalStatement(conversationSpan);
		const wholeScriptContent = initialScriptContent + realScriptContent + endingScriptContent;
		finalScript.set(wholeScriptContent);
	};

	const previewVisible = writable<boolean>(false);
	const currentPreviewCommand = writable<string>('');
	const previewIndex = writable<number>(-1);

	const runPreview = () => {
		if ($commands.length === 0) return;
		
		previewVisible.set(true);
		previewIndex.set(-1);
		currentPreviewCommand.set('');
		
		let currentSpan = $scriptData.initialSpan;
		
		const showNextCommand = (index: number) => {
			if (index >= $commands.length) {
				setTimeout(() => {
					previewVisible.set(false);
					previewIndex.set(-1);
					currentPreviewCommand.set('');
				}, currentSpan);
				return;
			}
			
			const command = $commands[index];
			previewIndex.set(index);
			
			currentPreviewCommand.set(command.content);
			
			setTimeout(() => {
				showNextCommand(index + 1);
			}, command.span * 50);
		};
		
		setTimeout(() => {
			showNextCommand(0);
		}, currentSpan);
	};
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-6 text-3xl font-bold">Command Generator</h1>

	<section class="mb-8 rounded-lg border p-6 shadow-md">
		<h2 class="mb-4 text-2xl font-semibold">Import dialogues script</h2>
		<Textarea
			bind:value={$rawScript}
			class="mb-4 min-h-[10em]"
			placeholder="Paste your raw script here..."
		/>
		<Button onclick={parseCommandsOnClick} class="w-full">Import Commands</Button>
	</section>

	<section class="mb-8 rounded-lg border p-6 shadow-md">
		<h2 class="mb-4 text-2xl font-semibold">Import mcfunction script</h2>
		<Textarea
			bind:value={$rawMcfunction}
			class="mb-4 min-h-[10em]"
			placeholder="Paste your raw script here..."
		/>
		<Button onclick={parseMcfunctionScriptOnClick} class="w-full">Import Commands</Button>
	</section>

	<section class="mb-8 rounded-lg border p-6 shadow-md">
		<h2 class="mb-4 text-2xl font-semibold">Script Settings</h2>
		<div class="mb-4">
			<label for="scriptName" class="block text-sm font-medium">Script Name</label>
			<Input id="scriptName" bind:value={$scriptData.name} placeholder="e.g., my_command_script" />
		</div>
		<div class="mb-4">
			<label for="initialCounter" class="block text-sm font-medium">Initial Counter</label>
			<Input id="initialCounter" type="number" bind:value={$scriptData.initialCounter} />
		</div>
		<div class="mb-4">
			<label for="initialSpan" class="block text-sm font-medium">Initial Span</label>
			<Input id="initialSpan" type="number" bind:value={$scriptData.initialSpan} />
		</div>
	</section>

	<Collapsible.Root open={true} class="mb-8 rounded-lg border p-6 shadow-md">
		<Collapsible.Trigger class="mb-4 w-full text-left text-2xl font-semibold"
			>Users</Collapsible.Trigger
		>
		<Collapsible.Content>
			{#each $users as user, index}
				<div class="mb-4 flex flex-col gap-4 rounded-md border p-4 md:flex-row">
					<div class="flex-1">
						<label for="userName-{index}" class="block text-sm font-medium">Name</label>
						<Input id="userName-{index}" bind:value={user.name} placeholder="Function Name" />
					</div>
					<div class="flex-1">
						<label for="scriptPrefix-{index}" class="block text-sm font-medium">Script Prefix</label
						>
						<Input id="scriptPrefix-{index}" bind:value={user.scriptPrefix} placeholder="e.g., W" />
					</div>
					<div class="flex-1">
						<label for="format-{index}" class="block text-sm font-medium">Format</label>
						<Input id="format-{index}" bind:value={user.format} placeholder="e.g., Wiesiek: " />
					</div>
				</div>
			{/each}
			<Button
				onclick={() => users.update((users) => [...users, { name: '', scriptPrefix: '', format: '' }])}
				class="w-full">Add New User</Button
			>
		</Collapsible.Content>
	</Collapsible.Root>

	<section class="mb-8 rounded-lg border p-6 shadow-md">
		<h2 class="mb-4 text-2xl font-semibold">Commands</h2>
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
					<span class="handle mr-4 cursor-grab">&#9776;</span>
					<div class="flex-1">
						<label for="commandContent-{index}" class="block text-sm font-medium">
							{(command.user ? command.user.name : 'Unknown')} Command
						</label>
						<Textarea
							id="commandContent-{index}"
							bind:value={command.content}
							class="mb-2 min-h-[3em]"
						/>
						<div class="flex flex-row gap-4">
							<div class="flex-1">
								<label for="commandSpanMultiplier-{index}" class="block text-sm font-medium"
									>Span Multiplier (x20)</label
								>
								<Input
									id="commandSpanMultiplier-{index}"
									type="number"
									class="w-full"
									value={command.span / 20}
									on:input={(e) => (command.span = Number(e.currentTarget.value) * 20)}
								/>
							</div>
							<div class="flex-1">
								<label for="commandSpan-{index}" class="block text-sm font-medium">Raw Span</label>
								<Input
									id="commandSpan-{index}"
									type="number"
									class="w-full"
									bind:value={command.span}
								/>
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
		</div>
	</section>

	<section class="mb-8 rounded-lg border p-6 shadow-md">
		<h2 class="mb-4 text-2xl font-semibold">Generated Script</h2>
		<Textarea bind:value={$finalScript} class="mb-4 min-h-[10em]" readonly />
		<div class="flex gap-2">
			<Button onclick={generateCommands} class="flex-1">Generate Script</Button>
			<Button onclick={runPreview} class="flex-1">Run Preview</Button>
		</div>
	</section>

	{#if $previewVisible}
		<div class="fixed bottom-4 right-4 z-50 max-w-md rounded-lg border bg-black p-4 shadow-lg">
			<div class="mb-2 flex items-center justify-between">
				<h3 class="text-lg font-semibold">Preview</h3>
				<button 
					class="text-white-700 hover:text-gray-700" 
					on:click={() => previewVisible.set(false)}
				>
					✕
				</button>
			</div>
			<div class="mb-2 text-sm text-white-600">
				Command {$previewIndex + 1} of {$commands.length}
			</div>
			<div class="rounded border bg-black-50 p-3 font-mono text-sm">
				{$currentPreviewCommand || 'Waiting...'}
			</div>
		</div>
	{/if}
</div>
