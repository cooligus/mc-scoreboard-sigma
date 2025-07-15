import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface ScriptSettings {
	name: string;
	initialSpan: number;
	characterMultiplier: number;
	minimalSpan: number;
}

const defaultSettings: ScriptSettings = {
	name: '',
	initialSpan: 10,
	characterMultiplier: 4,
	minimalSpan: 20
};

function createScriptSettingsStore() {
	const stored = browser ? localStorage.getItem('dpdg-script-settings') : null;
	const initial = stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;

	const { subscribe, set, update } = writable<ScriptSettings>(initial);

	return {
		subscribe,
		set: (settings: ScriptSettings) => {
			if (browser) localStorage.setItem('dpdg-script-settings', JSON.stringify(settings));
			set(settings);
		},
		update: (fn: (settings: ScriptSettings) => ScriptSettings) => {
			update((settings) => {
				const newSettings = fn(settings);
				if (browser) localStorage.setItem('dpdg-script-settings', JSON.stringify(newSettings));
				return newSettings;
			});
		},
		reset: () => {
			if (browser) localStorage.removeItem('dpdg-script-settings');
			set(defaultSettings);
		}
	};
}

export const scriptSettings = createScriptSettingsStore();
