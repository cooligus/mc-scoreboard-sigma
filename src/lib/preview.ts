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
	scriptData: { initialSpan: number },
	callbacks: {
		setPreviewVisible: (visible: boolean) => void;
		setPreviewIndex: (index: number) => void;
		setCurrentPreviewCommand: (command: string) => void;
	}
) => {
	const filteredCommands = commands.filter(cmd => !cmd.isCustom);
	if (filteredCommands.length === 0) return;

	const spanMultiplier = 50;
	callbacks.setPreviewVisible(true);
	callbacks.setPreviewIndex(-1);
	callbacks.setCurrentPreviewCommand('');

	let currentSpan = scriptData.initialSpan;

	const showNextCommand = (index: number) => {
		if (index >= filteredCommands.length) {
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
		showNextCommand(0);
	}, currentSpan * spanMultiplier);
	previewTimeouts.push(initialTimeoutId);
};
