import type { Command } from '$lib/interfaces';

let previewTimeouts: ReturnType<typeof setTimeout>[] = [];

export const cancelPreview = () => {
	for (const id of previewTimeouts) {
		clearTimeout(id);
	}
	previewTimeouts = [];
};

export const runPreview = (
	commands: Command[],
	initialSpan: number,
	callbacks: {
		setPreviewVisible: (visible: boolean) => void;
		setPreviewIndex: (index: number) => void;
		setCurrentPreviewCommand: (command: string) => void;
	},
	previewBeggining: string | null = null,
	previewEnd: string | null = null
) => {
	const filteredCommands = commands.filter((cmd) => !cmd.isCustom);
	if (filteredCommands.length === 0) return;

	let start = 0;
	let end = filteredCommands.length - 1;
	if (previewBeggining) {
		const idx = filteredCommands.findIndex(cmd => cmd.id === previewBeggining);
		if (idx !== -1) start = idx;
	}
	if (previewEnd) {
		const idx = filteredCommands.findIndex(cmd => cmd.id === previewEnd);
		if (idx !== -1) end = idx;
	}
	if (start > end) [start, end] = [end, start];

	const spanMultiplier = 50;
	callbacks.setPreviewVisible(true);
	callbacks.setPreviewIndex(-1);
	callbacks.setCurrentPreviewCommand('');

	let currentSpan = initialSpan;
	if (previewBeggining) {
		currentSpan = 0;
	}

	const showNextCommand = (index: number) => {
		if (index > end) {
			const timeoutId = setTimeout(() => {
				callbacks.setPreviewVisible(false);
				callbacks.setPreviewIndex(-1);
				callbacks.setCurrentPreviewCommand('');
			}, currentSpan);
			previewTimeouts.push(timeoutId);
			return;
		}

		const command = filteredCommands[index];
		callbacks.setPreviewIndex(index);
		callbacks.setCurrentPreviewCommand(command.content);

		const timeoutId = setTimeout(() => {
			showNextCommand(index + 1);
		}, command.span * spanMultiplier);
		previewTimeouts.push(timeoutId);
	};

	const initialTimeoutId = setTimeout(() => {
		showNextCommand(start);
	}, currentSpan * spanMultiplier);
	previewTimeouts.push(initialTimeoutId);
};
