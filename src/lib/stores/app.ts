import { writable } from 'svelte/store';

export const isLoading = writable(true);
export const currentRoute = writable('/dashboard');
export const toastMessage = writable<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

let toastTimeout: ReturnType<typeof setTimeout>;

export function showToast(text: string, type: 'success' | 'error' | 'info' = 'success') {
	clearTimeout(toastTimeout);
	toastMessage.set({ text, type });
	toastTimeout = setTimeout(() => toastMessage.set(null), 2500);
}
