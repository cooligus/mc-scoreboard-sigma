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
		`execute if score @s ${$scriptData.name} matches ${incrementer} run scoreboard players set @s ${$scriptData.name} -1\n`;

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

<Textarea bind:value={$rawScript} class="min-h-[3em]" />
<Button on:click={parseDialogueOnClick}>Import dialogues</Button>

<Input bind:value={$scriptData.name} />

<Collapsible.Root open={true}>
	<Collapsible.Trigger>Users</Collapsible.Trigger>
	<Collapsible.Content>
		{#each $users as user}
			<div class="flex flex-row">
				<Input bind:value={user.name} />
				<Input bind:value={user.scriptPrefix} />
				<Input bind:value={user.contentPrefix} />
			</div>
		{/each}
		<Button
			on:click={() =>
				users.update((users) => [...users, { name: '', scriptPrefix: '', contentPrefix: '' }])}
			>New user</Button
		>
	</Collapsible.Content>
</Collapsible.Root>

{#each $dialogues as dialogue}
	<Input bind:value={dialogue.content} />
	<div class="flex flex-row">
		{dialogue.user.name}
		<Input type="number" class="w-[7em]" value={dialogue.span / 20} />
		<Input type="number" class="w-[7em]" bind:value={dialogue.span} />
	</div>
{/each}

{#each $users as user}
	<Button on:click={() => addDialogue(user.name)}>+ {user.name}</Button>
{/each}
<Button on:click={generateDialogues}>Generate dialogues</Button>
<Textarea value={$finalScript} class="min-h-[30em]" />
