<script lang="ts">
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';
	import GlassCard from '$lib/components/GlassCard.svelte';
	import Chart from '$lib/components/Chart.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import { exerciseRepo } from '$lib/db/repositories';
	import { getExerciseStats } from '$lib/services/stats';
	import type { Exercise, ExerciseStats } from '$lib/domain/types';
	import { settings } from '$lib/stores/settings';
	import { t } from '$lib/utils/i18n';
	import { formatDateShort } from '$lib/utils/calc';

	const locale = derived(settings, ($s) => $s.locale);
	const unit = derived(settings, ($s) => $s.weightUnit);

	let exercises = $state<Exercise[]>([]);
	let selectedId = $state('');
	let stats = $state<ExerciseStats | null>(null);
	let loading = $state(true);
	let statsLoading = $state(false);

	const chartData = $derived(
		stats && stats.history.length > 0
			? {
					labels: stats.history.map((h) => formatDateShort(new Date(h.date), $locale)),
					values: stats.history.map((h) => h.maxWeight)
				}
			: null
	);

	const volumeChartData = $derived(
		stats && stats.history.length > 0
			? {
					labels: stats.history.map((h) => formatDateShort(new Date(h.date), $locale)),
					values: stats.history.map((h) => h.totalVolume)
				}
			: null
	);

	onMount(async () => {
		exercises = await exerciseRepo.getAll();
		loading = false;
		if (exercises.length > 0) {
			selectedId = exercises[0].id;
			await loadStats(selectedId);
		}
	});

	async function loadStats(exerciseId: string) {
		statsLoading = true;
		stats = await getExerciseStats(exerciseId);
		statsLoading = false;
	}

	async function handleSelect(e: Event) {
		const id = (e.target as HTMLSelectElement).value;
		selectedId = id;
		await loadStats(id);
	}
</script>

<svelte:head>
	<title>Gym Tracker - {t('stats.title', $locale)}</title>
</svelte:head>

<div class="px-4 pt-14 space-y-4" style="padding-top: calc(3.5rem + var(--safe-top, 0px));">
	<h1 class="text-2xl font-bold">{t('stats.title', $locale)}</h1>

	{#if loading}
		<Skeleton class="h-12 w-full" />
		<div class="space-y-4">
			<Skeleton class="h-48 w-full" />
			<div class="grid grid-cols-2 gap-3">
				<Skeleton class="h-24" />
				<Skeleton class="h-24" />
			</div>
		</div>
	{:else}
		<!-- Exercise selector -->
		<select
			value={selectedId}
			onchange={handleSelect}
			class="w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-on-surface focus:border-primary focus:outline-none"
		>
			<option value="" disabled>{t('stats.selectExercise', $locale)}</option>
			{#each exercises as ex}
				<option value={ex.id}>{ex.name}</option>
			{/each}
		</select>

		{#if statsLoading}
			<div class="space-y-4">
				<Skeleton class="h-48 w-full" />
				<div class="grid grid-cols-2 gap-3">
					<Skeleton class="h-24" />
					<Skeleton class="h-24" />
				</div>
			</div>
		{:else if stats}
			{#if stats.frequency === 0}
				<div class="text-center py-12">
					<div class="text-4xl mb-3">📊</div>
					<p class="text-slate-500">{t('stats.noData', $locale)}</p>
				</div>
			{:else}
				<!-- Stats cards -->
				<div class="grid grid-cols-2 gap-3">
					<GlassCard>
						<div class="text-xs text-slate-500 uppercase tracking-wider">
							{t('stats.pr', $locale)}
						</div>
						<div class="text-2xl font-bold text-warning mt-1">
							{stats.personalRecord}
							<span class="text-sm text-slate-500">{$unit}</span>
						</div>
					</GlassCard>

					<GlassCard>
						<div class="text-xs text-slate-500 uppercase tracking-wider">
							{t('stats.estimated1rm', $locale)}
						</div>
						<div class="text-2xl font-bold text-primary mt-1">
							{stats.pr1RM}
							<span class="text-sm text-slate-500">{$unit}</span>
						</div>
					</GlassCard>

					<GlassCard>
						<div class="text-xs text-slate-500 uppercase tracking-wider">
							{t('stats.avgWeight', $locale)}
						</div>
						<div class="text-2xl font-bold mt-1">
							{stats.avgWeight}
							<span class="text-sm text-slate-500">{$unit}</span>
						</div>
					</GlassCard>

					<GlassCard>
						<div class="text-xs text-slate-500 uppercase tracking-wider">
							{t('stats.frequency', $locale)}
						</div>
						<div class="text-2xl font-bold mt-1">
							{stats.frequency}
							<span class="text-sm text-slate-500">{t('stats.times', $locale)}</span>
						</div>
					</GlassCard>
				</div>

				<!-- Total Volume -->
				<GlassCard>
					<div class="text-xs text-slate-500 uppercase tracking-wider">
						{t('stats.totalVolume', $locale)}
					</div>
					<div class="text-2xl font-bold text-success mt-1">
						{stats.totalVolume >= 1000
							? `${(stats.totalVolume / 1000).toFixed(1)}т`
							: stats.totalVolume}
						<span class="text-sm text-slate-500">{$unit}</span>
					</div>
					<div class="text-xs text-slate-500 mt-1">
						{stats.totalSets} {t('common.sets', $locale)} · {stats.totalReps} {$locale === 'ru' ? 'повт.' : 'reps'}
					</div>
				</GlassCard>

				<!-- Max Weight Chart -->
				{#if chartData}
					<GlassCard>
						<div class="text-xs text-slate-500 uppercase tracking-wider mb-3">
							{t('stats.maxWeight', $locale)} ({t('stats.progress', $locale)})
						</div>
						<Chart data={chartData} label={t('stats.maxWeight', $locale)} color="#f97316" type="line" />
					</GlassCard>
				{/if}

				<!-- Volume Chart -->
				{#if volumeChartData}
					<GlassCard>
						<div class="text-xs text-slate-500 uppercase tracking-wider mb-3">
							{t('stats.totalVolume', $locale)} ({t('stats.progress', $locale)})
						</div>
						<Chart data={volumeChartData} label={t('stats.totalVolume', $locale)} color="#22c55e" type="bar" />
					</GlassCard>
				{/if}
			{/if}
		{/if}
	{/if}
</div>
