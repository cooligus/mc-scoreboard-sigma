import type { Command } from '$lib/interfaces';

export const runPreview = (
	commands: Command[],
	scriptData: { initialSpan: number },
	callbacks: {
		setPreviewVisible: (visible: boolean) => void;
		setPreviewIndex: (index: number) => void;
		setCurrentPreviewCommand: (command: string) => void;
	}
) => {
	if (commands.length === 0) return;

	const spanMultiplier = 50;
	callbacks.setPreviewVisible(true);
	callbacks.setPreviewIndex(-1);
	callbacks.setCurrentPreviewCommand('');

	let currentSpan = scriptData.initialSpan;

	const showNextCommand = (index: number) => {
		if (index >= commands.length) {
			setTimeout(() => {
				callbacks.setPreviewVisible(false);
				callbacks.setPreviewIndex(-1);
				callbacks.setCurrentPreviewCommand('');
			}, currentSpan);
			return;
		}

		const command = commands[index];
		callbacks.setPreviewIndex(index);

		callbacks.setCurrentPreviewCommand(command.content);

		setTimeout(() => {
			showNextCommand(index + 1);
		}, command.span * spanMultiplier);
	};

	setTimeout(() => {
		showNextCommand(0);
	}, currentSpan * spanMultiplier);
};
