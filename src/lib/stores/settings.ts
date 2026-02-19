import { writable, derived } from 'svelte/store';
import type { AppSettings, AppLocale, WeightUnit, AppTheme } from '$lib/domain/types';
import { t as translate } from '$lib/utils/i18n';

const SETTINGS_KEY = 'gym-tracker-settings';

function loadSettings(): AppSettings {
	if (typeof localStorage === 'undefined') {
		return { weightUnit: 'kg', locale: 'ru', theme: 'dark' };
	}
	try {
		const stored = localStorage.getItem(SETTINGS_KEY);
		if (stored) return JSON.parse(stored);
	} catch { /* ignore */ }
	return { weightUnit: 'kg', locale: 'ru', theme: 'dark' };
}

function createSettingsStore() {
	const { subscribe, set, update } = writable<AppSettings>(loadSettings());

	return {
		subscribe,
		setUnit(unit: WeightUnit) {
			update((s) => {
				const next = { ...s, weightUnit: unit };
				persist(next);
				return next;
			});
		},
		setLocale(locale: AppLocale) {
			update((s) => {
				const next = { ...s, locale };
				persist(next);
				return next;
			});
		},
		setTheme(theme: AppTheme) {
			update((s) => {
				const next = { ...s, theme };
				persist(next);
				applyTheme(theme);
				return next;
			});
		},
		init() {
			const settings = loadSettings();
			set(settings);
			applyTheme(settings.theme);
		}
	};
}

function persist(settings: AppSettings) {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
	}
}

function applyTheme(theme: AppTheme) {
	if (typeof document !== 'undefined') {
		document.documentElement.classList.remove('dark', 'light');
		document.documentElement.classList.add(theme);
	}
}

export const settings = createSettingsStore();

export const locale = derived(settings, ($s) => $s.locale);
export const weightUnit = derived(settings, ($s) => $s.weightUnit);
export const theme = derived(settings, ($s) => $s.theme);

export function t(key: string): string {
	let currentLocale: AppLocale = 'ru';
	const unsub = locale.subscribe((v) => (currentLocale = v));
	unsub();
	return translate(key, currentLocale);
}
