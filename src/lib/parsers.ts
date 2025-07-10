import type { Command, UserFunction } from '$lib/interfaces';
import { v4 as uuid } from 'uuid';

export function escapeRegexSpecialChars(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const MCFUNCTION_PATTERNS = {
	initialLine: /^scoreboard players add @s (\S+) (\d+)$/,
	commandLine: /^execute if score (\S+) (\S+) matches (\d+) run (.+)$/,
	finalLine:
		/^execute if score (\S+) (\S+) matches (\d+)\.\. run scoreboard players set (\S+) (\S+) -1$/
} as const;

const validateScriptLines = (lines: string[]) => {
	if (lines.length < 2) {
		throw new Error('Invalid script format: Not enough lines.');
	}
};

const parseInitialLine = (line: string) => {
	const match = line.match(MCFUNCTION_PATTERNS.initialLine);
	if (!match) {
		throw new Error('Invalid script format: Could not parse initial line.');
	}

	return {
		scriptName: match[1],
		initialCounter: parseInt(match[2], 10)
	};
};

const validateScriptName = (expectedName: string, actualName: string, lineType: string) => {
	if (actualName !== expectedName) {
		throw new Error(`Inconsistent script name found in ${lineType} line.`);
	}
};

const processCommandLine = (line: string, scriptName: string, previousIncrementer: number) => {
	const match = line.match(MCFUNCTION_PATTERNS.commandLine);
	if (!match) return null;

	const [, , currentScriptName, incrementerStr, commandContent] = match;
	validateScriptName(scriptName, currentScriptName, 'command');

	const currentIncrementer = parseInt(incrementerStr, 10);
	const span = currentIncrementer - previousIncrementer;

	return {
		span,
		content: commandContent,
		nextIncrementer: currentIncrementer
	};
};

const processFinalLine = (line: string, scriptName: string) => {
	const match = line.match(MCFUNCTION_PATTERNS.finalLine);
	if (!match) return false;

	const [, , currentScriptName] = match;
	validateScriptName(scriptName, currentScriptName, 'final');
	return true;
};

const createCommand = (content: string): Command => ({
	id: uuid(),
	span: 0,
	content
});

export const parseMcfunctionScript = (script: string) => {
	const lines = script.split('\n').filter((line) => line.trim() !== '');
	validateScriptLines(lines);

	const { scriptName, initialCounter } = parseInitialLine(lines[0]);

	const commands: Command[] = [];
	let previousIncrementer = initialCounter;
	let initialSpan: number | null = null;
	let prevCommand: Command | null = null;

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];

		const commandData = processCommandLine(line, scriptName, previousIncrementer);
		if (commandData) {
			if (prevCommand) {
				prevCommand.span = commandData.span;
			} else {
				initialSpan = commandData.span;
			}

			const command = createCommand(commandData.content);
			commands.push(command);
			prevCommand = command;
			previousIncrementer = commandData.nextIncrementer;
			continue;
		}

		if (processFinalLine(line, scriptName)) {
			if (prevCommand) {
				prevCommand.span = 0;
			}
			continue;
		}

		throw new Error(`Invalid script format: Unrecognized line type: ${line}`);
	}

	return {
		scriptName,
		initialCounter,
		commands,
		initialSpan
	};
};

export const getSpanFromLine = (line: string, characterMultiplier: number, minimalSpan: number) => {
	const trimmedLine = line.trim();
	const occurences = trimmedLine.match(/[A-Za-z]+/g);
	const finalSpan = minimalSpan + (occurences ? occurences.length * characterMultiplier : 0);
	return finalSpan;
};

export const parseCommands = (commandString: string, users: UserFunction[], characterMultiplier: number, minimalSpan: number) => {
	const commandLines = commandString.split('\n');
	const commands: Command[] = [];

	for (const line of commandLines) {
		const match = line.match(/^([A-Za-z]+): (.*)$/);
		if (match) {
			const speaker = match[1];
			const content = match[2];
			const span = getSpanFromLine(line, characterMultiplier, minimalSpan);

			const caseInsesitiveSpeaker = speaker.toLowerCase();

			const user = users.find(
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

export const getUserFromUsername = (username: string, users: UserFunction[]) =>
	users.find((user: UserFunction) => user.name === username);

export const getScriptIncrementer = (scriptName: string, initialCounter: number) =>
	`scoreboard players add @s ${scriptName} ${initialCounter}\n`;

export const getSingleCommand = (incrementer: number, command: Command, scriptName: string) => {
	let renderedCommand = command.content;
	if (command.user) {
		const format = command.user.format;
		renderedCommand = format.replace('%s', command.content);
	}
	return `execute if score @s ${scriptName} matches ${incrementer} run ${renderedCommand}\n`;
};

export const getScriptFinalStatement = (incrementer: number, scriptName: string) =>
	`execute if score @s ${scriptName} matches ${incrementer}.. run scoreboard players set @s ${scriptName} -1\n`;

export const generateCommands = (
	commands: Command[],
	scriptData: { name: string; initialCounter: number; initialSpan: number }
) => {
	const initialScriptContent = getScriptIncrementer(scriptData.name, scriptData.initialCounter);
	let realScriptContent = '';
	let conversationSpan = scriptData.initialSpan;
	for (let i = 0; i < commands.length; i++) {
		realScriptContent += getSingleCommand(conversationSpan, commands[i], scriptData.name);
		conversationSpan += commands[i].span;
	}
	const endingScriptContent = getScriptFinalStatement(conversationSpan, scriptData.name);
	return initialScriptContent + realScriptContent + endingScriptContent;
};
