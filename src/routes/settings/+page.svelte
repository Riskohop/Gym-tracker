<script lang="ts">
	import { derived } from 'svelte/store';
	import GlassCard from '$lib/components/GlassCard.svelte';
	import { settings, locale, weightUnit, theme } from '$lib/stores/settings';
	import { showToast } from '$lib/stores/app';
	import { t } from '$lib/utils/i18n';
	import { haptic } from '$lib/utils/calc';
	import { exportToCSV, exportBackup, importBackup } from '$lib/services/stats';
	import type { WeightUnit, AppLocale, AppTheme } from '$lib/domain/types';

	const loc = derived(settings, ($s) => $s.locale);

	function setUnit(unit: WeightUnit) {
		haptic('light');
		settings.setUnit(unit);
	}

	function setLocale(locale: AppLocale) {
		haptic('light');
		settings.setLocale(locale);
	}

	function setTheme(theme: AppTheme) {
		haptic('light');
		settings.setTheme(theme);
	}

	async function handleExportCSV() {
		haptic('medium');
		const csv = await exportToCSV();
		downloadFile(csv, 'gym-tracker-export.csv', 'text/csv');
		showToast($loc === 'ru' ? 'CSV экспортирован' : 'CSV exported');
	}

	async function handleBackup() {
		haptic('medium');
		const json = await exportBackup();
		downloadFile(json, 'gym-tracker-backup.json', 'application/json');
		showToast($loc === 'ru' ? 'Бэкап создан' : 'Backup created');
	}

	async function handleRestore() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = async () => {
			const file = input.files?.[0];
			if (!file) return;
			try {
				const json = await file.text();
				await importBackup(json);
				haptic('heavy');
				showToast($loc === 'ru' ? 'Данные восстановлены!' : 'Data restored!');
				window.location.reload();
			} catch (e) {
				showToast($loc === 'ru' ? 'Ошибка импорта' : 'Import error', 'error');
			}
		};
		input.click();
	}

	function downloadFile(content: string, filename: string, type: string) {
		const blob = new Blob([content], { type });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Gym Tracker - {t('settings.title', $loc)}</title>
</svelte:head>

<div class="px-4 pt-14 space-y-4" style="padding-top: calc(3.5rem + var(--safe-top, 0px));">
	<h1 class="text-2xl font-bold">{t('settings.title', $loc)}</h1>

	<!-- Weight units -->
	<GlassCard>
		<div class="text-sm text-slate-400 mb-3">{t('settings.units', $loc)}</div>
		<div class="grid grid-cols-2 gap-2">
			<button
				class="py-3 rounded-xl font-medium text-sm transition-all
					{$weightUnit === 'kg' ? 'bg-primary text-white' : 'bg-surface text-slate-400'}"
				onclick={() => setUnit('kg')}
			>
				{t('common.kg', $loc)}
			</button>
			<button
				class="py-3 rounded-xl font-medium text-sm transition-all
					{$weightUnit === 'lbs' ? 'bg-primary text-white' : 'bg-surface text-slate-400'}"
				onclick={() => setUnit('lbs')}
			>
				{t('common.lbs', $loc)}
			</button>
		</div>
	</GlassCard>

	<!-- Language -->
	<GlassCard>
		<div class="text-sm text-slate-400 mb-3">{t('settings.language', $loc)}</div>
		<div class="grid grid-cols-2 gap-2">
			<button
				class="py-3 rounded-xl font-medium text-sm transition-all
					{$locale === 'ru' ? 'bg-primary text-white' : 'bg-surface text-slate-400'}"
				onclick={() => setLocale('ru')}
			>
				Русский
			</button>
			<button
				class="py-3 rounded-xl font-medium text-sm transition-all
					{$locale === 'en' ? 'bg-primary text-white' : 'bg-surface text-slate-400'}"
				onclick={() => setLocale('en')}
			>
				English
			</button>
		</div>
	</GlassCard>

	<!-- Theme -->
	<GlassCard>
		<div class="text-sm text-slate-400 mb-3">{t('settings.theme', $loc)}</div>
		<div class="grid grid-cols-2 gap-2">
			<button
				class="py-3 rounded-xl font-medium text-sm transition-all
					{$theme === 'dark' ? 'bg-primary text-white' : 'bg-surface text-slate-400'}"
				onclick={() => setTheme('dark')}
			>
				{t('settings.dark', $loc)}
			</button>
			<button
				class="py-3 rounded-xl font-medium text-sm transition-all
					{$theme === 'light' ? 'bg-primary text-white' : 'bg-surface text-slate-400'}"
				onclick={() => setTheme('light')}
			>
				{t('settings.light', $loc)}
			</button>
		</div>
	</GlassCard>

	<!-- Data management -->
	<GlassCard>
		<div class="text-sm text-slate-400 mb-3">
			{$loc === 'ru' ? 'Управление данными' : 'Data Management'}
		</div>
		<div class="space-y-2">
			<button
				class="w-full py-3 rounded-xl bg-surface text-sm font-medium active:scale-[0.98] transition-transform"
				onclick={handleExportCSV}
			>
				{t('settings.export', $loc)}
			</button>
			<button
				class="w-full py-3 rounded-xl bg-surface text-sm font-medium active:scale-[0.98] transition-transform"
				onclick={handleBackup}
			>
				{t('settings.backup', $loc)}
			</button>
			<button
				class="w-full py-3 rounded-xl bg-surface text-sm font-medium active:scale-[0.98] transition-transform"
				onclick={handleRestore}
			>
				{t('settings.restore', $loc)}
			</button>
		</div>
	</GlassCard>

	<!-- Privacy -->
	<a href="/privacy" class="block">
		<GlassCard>
			<div class="flex items-center justify-between">
				<span class="text-sm">{t('settings.privacy', $loc)}</span>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-slate-500">
					<path d="M9 18l6-6-6-6"/>
				</svg>
			</div>
		</GlassCard>
	</a>

	<!-- Footer -->
	<div class="text-center py-4 text-xs text-slate-600 space-y-1">
		<p>{t('settings.version', $loc)}: 1.0.0</p>
		<p>{t('settings.allDataLocal', $loc)}</p>
	</div>
</div>
