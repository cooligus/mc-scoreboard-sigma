import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import type { Command } from '$lib/command.interface';
import { v4 as uuid } from 'uuid';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

export function escapeRegexSpecialChars(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const parseMcfunctionScript = (script: string) => {
	const lines = script.split('\n').filter(line => line.trim() !== '');

	if (lines.length < 2) {
		throw new Error('Invalid script format: Not enough lines.');
	}

	const initialLineRegex = /^scoreboard players add @s (\S+) (\d+)$/;
	const commandLineRegex = /^execute if score (\S+) (\S+) matches (\d+) run (.+)$/;
	const finalLineRegex = /^execute if score (\S+) (\S+) matches (\d+)\.\. run scoreboard players set (\S+) (\S+) -1$/;

	const initialMatch = lines[0].match(initialLineRegex);
	if (!initialMatch) {
		throw new Error('Invalid script format: Could not parse initial line.');
	}

	const scriptName = initialMatch[1];
	const initialCounter = parseInt(initialMatch[2], 10);

	const commands: Command[] = [];
	let previousAbsoluteIncrementer = initialCounter;
	let initialSpan: number | null = null;
	let prevCommand: Command | null = null;

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		const commandMatch = line.match(commandLineRegex);
		const finalMatch = line.match(finalLineRegex);

		if (commandMatch) {
			const currentScriptName = commandMatch[2];
			if (currentScriptName !== scriptName) {
				throw new Error('Inconsistent script name found in command line.');
			}
			const currentAbsoluteIncrementer = parseInt(commandMatch[3], 10);
			const span = currentAbsoluteIncrementer - previousAbsoluteIncrementer;

			if (prevCommand) {
				prevCommand.span = span;
			} else {
				initialSpan = span;
			}

			const command: Command = {
				id: uuid(),
				span: 0,
				content: commandMatch[4]
			};
			commands.push(command);
			prevCommand = command;
			previousAbsoluteIncrementer = currentAbsoluteIncrementer;
		} else if (finalMatch) {
			const currentScriptName = finalMatch[2];
			if (currentScriptName !== scriptName) {
				throw new Error('Inconsistent script name found in final line.');
			}
			if (prevCommand) {
				prevCommand.span = 0;
			}
		} else {
			throw new Error(`Invalid script format: Unrecognized line type: ${line}`);
		}
	}

	return {
		scriptName,
		initialCounter,
		commands,
		initialSpan,
	};
};