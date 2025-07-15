import type { Command, UserFunction } from '$lib/interfaces';
import { v4 as uuid } from 'uuid';
import type { ScriptSettings } from '$lib/stores/settings';

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
		scriptName: match[1]
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
	let scriptNameToUse = scriptName;
	try {
		validateScriptName(scriptName, currentScriptName, 'command');
	} catch (e) {
		if (!scriptName) {
			scriptNameToUse = currentScriptName;
		} else {
			throw e;
		}
	}

	const currentIncrementer = parseInt(incrementerStr, 10);
	const span = currentIncrementer - previousIncrementer;

	return {
		span,
		content: commandContent,
		nextIncrementer: currentIncrementer,
		scriptName: scriptNameToUse
	};
};

const processFinalLine = (line: string, scriptName: string) => {
	const match = line.match(MCFUNCTION_PATTERNS.finalLine);
	if (!match) return false;

	const [, , currentScriptName] = match;
	validateScriptName(scriptName, currentScriptName, 'final');
	return true;
};

export const createCommand = (content?: string, isCustom?: boolean, span?: number, user?: UserFunction): Command => ({
	id: uuid(),
	span: span || 0,
	content: content || '',
	isCustom: isCustom || false,
	user,
	userName: user?.name || ''
});

export function isValidEnd(line: string, scriptName: string, previousIncrementer: number) {
	try {
		processFinalLine(line, scriptName);
		return true;
	} catch {
		try {
			processCommandLine(line, scriptName, previousIncrementer);
			return true;
		} catch {
			return false;
		}
	}
}

export const parseMcfunctionScript = (script: string) => {
	const lines = script.split('\n')
	validateScriptLines(lines);

	let scriptName = '';
	try {
		({ scriptName } = parseInitialLine(lines[0]));
	} catch {}

	const commands: Command[] = [];
	let previousIncrementer = 0;
	let initialSpan: number | null = null;
	let prevCommand: Command | null = null;

	let i = 0;
	if (scriptName) {
		i++;
	}

	const lastLineIndex = lines.length - 1;
	for (; i < lastLineIndex; i++) {
		const line = lines[i];

		const commandData = processCommandLine(line, scriptName, previousIncrementer);
		if (commandData) {
			if (prevCommand) {
				prevCommand.span = commandData.span;
			} else {
				initialSpan = commandData.span;
			}

			if (!scriptName) {
				scriptName = commandData.scriptName;
			}

			const command = createCommand(commandData.content);
			commands.push(command);
			prevCommand = command;
			previousIncrementer = commandData.nextIncrementer;
			continue;
		}

		commands.push(createCommand(line, true));
	}

	const finalLine = lines[lastLineIndex];
	const finalMatch = finalLine.match(MCFUNCTION_PATTERNS.finalLine);
	if (finalMatch && prevCommand) {
		const finalIncrementer = parseInt(finalMatch[3], 10);
		prevCommand.span = finalIncrementer - previousIncrementer;
	} else if (prevCommand) {
		prevCommand.span = 0;
	}

	return {
		scriptName,
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

export const parseCommands = (
	commandString: string,
	users: UserFunction[],
	characterMultiplier: number,
	minimalSpan: number
) => {
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
				commands.push(createCommand(content, false, span, user));
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

export const getScriptIncrementer = (scriptName: string) =>
	`scoreboard players add @s ${scriptName} 1\n`;

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
	scriptData: ScriptSettings
) => {
	const initialScriptContent = getScriptIncrementer(scriptData.name);
	let realScriptContent = '';
	let conversationSpan = scriptData.initialSpan;
	for (let i = 0; i < commands.length; i++) {
		if (commands[i].isCustom) {
			realScriptContent += commands[i].content + '\n';
			continue
		} 
		realScriptContent += getSingleCommand(conversationSpan, commands[i], scriptData.name);
		conversationSpan += commands[i].span;
	}
	const endingScriptContent = getScriptFinalStatement(conversationSpan, scriptData.name);
	return initialScriptContent + realScriptContent + endingScriptContent;
};
