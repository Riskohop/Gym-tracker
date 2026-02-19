import type { WeightUnit } from '$lib/domain/types';

/** Epley formula: 1RM = weight × (1 + reps / 30) */
export function calculate1RM(weight: number, reps: number): number {
	if (reps <= 0 || weight <= 0) return 0;
	if (reps === 1) return weight;
	return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
	if (from === to) return value;
	if (from === 'kg' && to === 'lbs') return Math.round(value * 2.20462 * 10) / 10;
	return Math.round(value / 2.20462 * 10) / 10;
}

export function formatWeight(value: number, unit: WeightUnit): string {
	return `${value} ${unit === 'kg' ? 'кг' : 'lbs'}`;
}

export function formatDate(date: Date, locale: string = 'ru'): string {
	return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	}).format(date);
}

export function formatDateShort(date: Date, locale: string = 'ru'): string {
	return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
		day: 'numeric',
		month: 'short'
	}).format(date);
}

export function getMonthRange(): { start: Date; end: Date } {
	const now = new Date();
	const start = new Date(now.getFullYear(), now.getMonth(), 1);
	const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
	return { start, end };
}

export function generateId(): string {
	return crypto.randomUUID();
}

export function haptic(style: 'light' | 'medium' | 'heavy' = 'light'): void {
	if ('vibrate' in navigator) {
		const durations = { light: 10, medium: 20, heavy: 40 };
		navigator.vibrate(durations[style]);
	}
}
