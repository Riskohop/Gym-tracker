<script lang="ts">
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';
	import GlassCard from '$lib/components/GlassCard.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import PullToRefresh from '$lib/components/PullToRefresh.svelte';
	import { getDashboardData } from '$lib/services/stats';
	import type { DashboardData } from '$lib/domain/types';
	import { settings } from '$lib/stores/settings';
	import { t } from '$lib/utils/i18n';
	import { formatDate } from '$lib/utils/calc';
	import { goto } from '$app/navigation';

	const locale = derived(settings, ($s) => $s.locale);
	const unit = derived(settings, ($s) => $s.weightUnit);

	let data = $state<DashboardData | null>(null);
	let loading = $state(true);

	async function loadData() {
		data = await getDashboardData();
		loading = false;
	}

	onMount(loadData);

	function formatTonnage(val: number): string {
		if (val >= 1000) return `${(val / 1000).toFixed(1)}т`;
		return `${val}`;
	}
</script>

<svelte:head>
	<title>Gym Tracker - {t('dashboard.title', $locale)}</title>
</svelte:head>

<PullToRefresh onrefresh={loadData}>
	<div class="px-4 pt-14 space-y-4" style="padding-top: calc(3.5rem + var(--safe-top, 0px));">
		<h1 class="text-2xl font-bold">{t('dashboard.title', $locale)}</h1>

		{#if loading}
			<div class="space-y-4">
				<Skeleton class="h-32 w-full" />
				<div class="grid grid-cols-2 gap-3">
					<Skeleton class="h-24" />
					<Skeleton class="h-24" />
				</div>
				<Skeleton class="h-40 w-full" />
			</div>
		{:else if data}
			<!-- Stats cards -->
			<div class="grid grid-cols-2 gap-3">
				<GlassCard>
					<div class="text-slate-500 text-xs font-medium uppercase tracking-wider">
						{t('dashboard.workoutsMonth', $locale)}
					</div>
					<div class="text-3xl font-bold mt-1 text-primary">
						{data.workoutsThisMonth}
					</div>
				</GlassCard>

				<GlassCard>
					<div class="text-slate-500 text-xs font-medium uppercase tracking-wider">
						{t('dashboard.tonnageMonth', $locale)}
					</div>
					<div class="text-3xl font-bold mt-1 text-primary">
						{formatTonnage(data.totalTonnageThisMonth)}
						<span class="text-sm text-slate-500">{$unit === 'kg' ? 'кг' : 'lbs'}</span>
					</div>
				</GlassCard>
			</div>

			<!-- Last workout -->
			{#if data.lastWorkout}
				<GlassCard onclick={() => goto(`/workouts/${data!.lastWorkout!.id}`)}>
					<div class="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
						{t('dashboard.lastWorkout', $locale)}
					</div>
					<div class="flex items-center justify-between">
						<div>
							<div class="font-semibold text-lg">{data.lastWorkout.name}</div>
							<div class="text-slate-500 text-sm">
								{formatDate(new Date(data.lastWorkout.date), $locale)}
							</div>
						</div>
						<div class="text-right">
							<div class="text-primary font-semibold">
								{data.lastWorkout.exercises.length}
							</div>
							<div class="text-slate-500 text-xs">
								{$locale === 'ru' ? 'упражн.' : 'exercises'}
							</div>
						</div>
					</div>
					<div class="mt-3 flex flex-wrap gap-2">
						{#each data.lastWorkout.exercises.slice(0, 4) as we}
							<span class="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary-light">
								{we.exercise.name}
							</span>
						{/each}
						{#if data.lastWorkout.exercises.length > 4}
							<span class="text-xs px-2 py-1 rounded-lg bg-surface text-slate-400">
								+{data.lastWorkout.exercises.length - 4}
							</span>
						{/if}
					</div>
				</GlassCard>
			{:else}
				<GlassCard>
					<div class="text-center py-6">
						<div class="text-4xl mb-3">🏋️</div>
						<div class="text-lg font-semibold">{t('dashboard.noWorkouts', $locale)}</div>
						<div class="text-slate-500 text-sm mt-1">{t('dashboard.startFirst', $locale)}</div>
						<button
							class="mt-4 px-6 py-3 bg-primary rounded-xl font-semibold text-white active:scale-95 transition-transform"
							onclick={() => goto('/workouts')}
						>
							{t('workouts.new', $locale)}
						</button>
					</div>
				</GlassCard>
			{/if}

			<!-- Compound lifts -->
			{#if data.compoundLifts.length > 0}
				<GlassCard>
					<div class="text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">
						{t('dashboard.compoundLifts', $locale)}
					</div>
					<div class="space-y-3">
						{#each data.compoundLifts as lift}
							<div class="flex items-center justify-between">
								<span class="font-medium">{lift.name}</span>
								<div class="flex items-center gap-3">
									<span class="text-sm text-slate-500">
										{lift.currentMax} {$unit}
									</span>
									<span class="text-primary font-bold">
										PR: {lift.pr} {$unit}
									</span>
								</div>
							</div>
						{/each}
					</div>
				</GlassCard>
			{/if}

			<!-- Quick action -->
			<button
				class="w-full py-4 bg-primary rounded-2xl font-semibold text-white text-lg active:scale-[0.98] transition-transform shadow-lg shadow-primary/20"
				onclick={() => goto('/workouts?new=1')}
			>
				+ {t('workouts.new', $locale)}
			</button>
		{/if}
	</div>
</PullToRefresh>
