<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { Collapsible } from 'bits-ui';
	import { writable } from 'svelte/store';

	interface Character {
		name: string;
		scriptPrefix: string;
		contentPrefix: string;
	}

	interface Dialog {
		user: Character;
		span: number;
		content: string;
	}

	interface ScriptData {
		name: string;
		initialCounter: number;
		initialSpan: number;
	}

	const users = writable<Character[]>([
		{ name: 'Wieseik', scriptPrefix: 'W', contentPrefix: 'Wiesiek: ' }
	]);

	const dialogues = writable<Dialog[]>([]);
	const finalScript = writable<string>('');
	const rawScript = writable<string>('');

	// get number of alphanumerical characters and multiply by 2
	const getSpanFromLine = (line: string) => {
		const trimmedLine = line.trim();
		const characterMultiplier = 4;
		const occurences = trimmedLine.match(/[A-Za-z]+/g);
		return occurences ? occurences.length * characterMultiplier : 0;
	};

	const parseDialogueOnClick = () => {
		const parsedDialogues = parseDialogue($rawScript);
		dialogues.set(parsedDialogues);
	};

	const parseDialogue = (dialogueString: string) => {
		const dialogueLines = dialogueString.split('\n');
		const dialogues: Dialog[] = [];

		for (const line of dialogueLines) {
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
					dialogues.push({ user, span, content });
				} else {
					console.error(`Unknown speaker: ${caseInsesitiveSpeaker}`);
				}
			} else {
				if (dialogues.length > 0) {
					dialogues[dialogues.length - 1].content += '\n' + line;
				} else {
					console.error(`Invalid dialogue line: ${line}`);
				}
			}
		}

		return dialogues;
	};

	const getUserFromUsername = (username: string) => $users.find((user) => user.name === username);
	const getScriptIncrementer = () =>
		`scoreboard players add @s ${$scriptData.name} ${$scriptData.initialCounter}\n`;
	const getSingleDialog = (incrementer: number, dialog: Dialog) => {
		const contentPrefix = dialog.user.contentPrefix;
		return `execute if score @s ${$scriptData.name} matches ${incrementer} run tellraw @a [${contentPrefix}, {"text":"${dialog.content}", "italic": true, "color":"gray", "bold": "false"}]\n`;
	};
	const getScriptFinalStatement = (incrementer: number) =>
		`execute if score @s ${$scriptData.name} matches ${incrementer}.. run scoreboard players set @s ${$scriptData.name} -1\n`;

	const scriptData = writable<ScriptData>({ name: '', initialCounter: 1, initialSpan: 10 });

	const addDialogue = (userName: string) => {
		const user = getUserFromUsername(userName);
		if (!user) {
			console.error(`User ${userName} not found`);
			return;
		}
		dialogues.update((dialogues) => [...dialogues, { user, span: 0, content: '' }]);
	};

	const generateDialogues = () => {
		const initialScriptContent = getScriptIncrementer();
		let realScriptContent = '';
		let conversationSpan = $scriptData.initialSpan;
		for (let i = 0; i < $dialogues.length; i++) {
			realScriptContent += getSingleDialog(conversationSpan, $dialogues[i]);
			conversationSpan += $dialogues[i].span;
		}
		const endingScriptContent = getScriptFinalStatement(conversationSpan);
		const wholeScriptContent = initialScriptContent + realScriptContent + endingScriptContent;
		finalScript.set(wholeScriptContent);
	};
</script>

<div class="container mx-auto p-4">
	<h1 class="text-3xl font-bold mb-6">Dialogue Generator</h1>

	<section class="mb-8 p-6 border rounded-lg shadow-md">
		<h2 class="text-2xl font-semibold mb-4">Import Dialogues</h2>
		<Textarea bind:value={$rawScript} class="min-h-[10em] mb-4" placeholder="Paste your raw script here..." />
		<Button on:click={parseDialogueOnClick} class="w-full">Import Dialogues</Button>
	</section>

	<section class="mb-8 p-6 border rounded-lg shadow-md">
		<h2 class="text-2xl font-semibold mb-4">Script Settings</h2>
		<div class="mb-4">
			<label for="scriptName" class="block text-sm font-medium text-gray-700">Script Name</label>
			<Input id="scriptName" bind:value={$scriptData.name} placeholder="e.g., my_dialogue_script" />
		</div>
		<div class="mb-4">
			<label for="initialCounter" class="block text-sm font-medium text-gray-700">Initial Counter</label>
			<Input id="initialCounter" type="number" bind:value={$scriptData.initialCounter} />
		</div>
		<div class="mb-4">
			<label for="initialSpan" class="block text-sm font-medium text-gray-700">Initial Span</label>
			<Input id="initialSpan" type="number" bind:value={$scriptData.initialSpan} />
		</div>
	</section>

	<Collapsible.Root open={true} class="mb-8 p-6 border rounded-lg shadow-md">
		<Collapsible.Trigger class="text-2xl font-semibold mb-4 w-full text-left">Users</Collapsible.Trigger>
		<Collapsible.Content>
			{#each $users as user, index}
				<div class="flex flex-col md:flex-row gap-4 mb-4 p-4 border rounded-md bg-gray-50">
					<div class="flex-1">
						<label for="userName-{index}" class="block text-sm font-medium text-gray-700">Name</label>
						<Input id="userName-{index}" bind:value={user.name} placeholder="Character Name" />
					</div>
					<div class="flex-1">
						<label for="scriptPrefix-{index}" class="block text-sm font-medium text-gray-700">Script Prefix</label>
						<Input id="scriptPrefix-{index}" bind:value={user.scriptPrefix} placeholder="e.g., W" />
					</div>
					<div class="flex-1">
						<label for="contentPrefix-{index}" class="block text-sm font-medium text-gray-700">Content Prefix</label>
						<Input id="contentPrefix-{index}" bind:value={user.contentPrefix} placeholder="e.g., Wiesiek: " />
					</div>
				</div>
			{/each}
			<Button
				on:click={() =>
					users.update((users) => [...users, { name: '', scriptPrefix: '', contentPrefix: '' }])}
				class="w-full"
				>Add New User</Button
			>
		</Collapsible.Content>
	</Collapsible.Root>

	<section class="mb-8 p-6 border rounded-lg shadow-md">
		<h2 class="text-2xl font-semibold mb-4">Dialogues</h2>
		{#each $dialogues as dialogue, index}
			<div class="mb-4 p-4 border rounded-md bg-blue-50">
				<label for="dialogueContent-{index}" class="block text-sm font-medium text-gray-700">
					{dialogue.user.name} Dialogue
				</label>
				<Textarea id="dialogueContent-{index}" bind:value={dialogue.content} class="min-h-[3em] mb-2" />
				<div class="flex flex-row gap-4">
					<div class="flex-1">
						<label for="dialogueSpanMultiplier-{index}" class="block text-sm font-medium text-gray-700">Span Multiplier (x20)</label>
						<Input id="dialogueSpanMultiplier-{index}" type="number" class="w-full" value={dialogue.span / 20} on:input={(e) => dialogue.span = Number(e.target.value) * 20} />
					</div>
					<div class="flex-1">
						<label for="dialogueSpan-{index}" class="block text-sm font-medium text-gray-700">Raw Span</label>
						<Input id="dialogueSpan-{index}" type="number" class="w-full" bind:value={dialogue.span} />
					</div>
				</div>
			</div>
		{/each}

		<div class="flex flex-wrap gap-2 mt-4">
			{#each $users as user}
				<Button on:click={() => addDialogue(user.name)}>+ {user.name}</Button>
			{/each}
		</div>
	</section>

	<section class="mb-8 p-6 border rounded-lg shadow-md">
		<h2 class="text-2xl font-semibold mb-4">Generated Script</h2>
		<Button on:click={generateDialogues} class="w-full mb-4">Generate Dialogues</Button>
		<Textarea value={$finalScript} class="min-h-[30em]" readonly />
	</section>
</div>
