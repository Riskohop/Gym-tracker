<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { derived } from 'svelte/store';
	import GlassCard from '$lib/components/GlassCard.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import { workoutRepo } from '$lib/db/repositories';
	import type { Workout } from '$lib/domain/types';
	import { settings } from '$lib/stores/settings';
	import { showToast } from '$lib/stores/app';
	import { t } from '$lib/utils/i18n';
	import { formatDate, haptic } from '$lib/utils/calc';

	const locale = derived(settings, ($s) => $s.locale);

	let workouts = $state<Workout[]>([]);
	let loading = $state(true);
	let showNewModal = $state(false);
	let newName = $state('');
	let newDate = $state(new Date().toISOString().split('T')[0]);

	async function loadWorkouts() {
		workouts = await workoutRepo.getAll();
		loading = false;
	}

	onMount(async () => {
		await loadWorkouts();
		if ($page.url.searchParams.get('new') === '1') {
			showNewModal = true;
		}
	});

	async function createWorkout() {
		if (!newName.trim()) return;
		haptic('medium');
		const [y, m, d] = newDate.split('-').map(Number);
		const id = await workoutRepo.create({
			name: newName.trim(),
			date: new Date(y, m - 1, d),
			completed: false
		} as any);
		showNewModal = false;
		newName = '';
		goto(`/workouts/${id}`);
	}

	async function deleteWorkout(id: string) {
		haptic('medium');
		await workoutRepo.remove(id);
		workouts = workouts.filter((w) => w.id !== id);
		showToast($locale === 'ru' ? 'Тренировка удалена' : 'Workout deleted');
	}

	async function repeatWorkout(workout: Workout) {
		haptic('medium');
		const full = await workoutRepo.getWithExercises(workout.id);
		if (!full) return;
		const { workoutExerciseRepo, workoutSetRepo } = await import('$lib/db/repositories');
		const newId = await workoutRepo.create({
			name: workout.name,
			date: new Date(),
			completed: false
		} as any);
		for (const we of full.exercises) {
			const weId = await workoutExerciseRepo.create({
				workoutId: newId,
				exerciseId: we.exerciseId,
				order: we.order
			} as any);
			for (const s of we.sets) {
				await workoutSetRepo.create({
					workoutExerciseId: weId,
					setNumber: s.setNumber,
					weight: s.weight,
					reps: s.reps,
					completed: false
				} as any);
			}
		}
		goto(`/workouts/${newId}`);
	}
</script>

<svelte:head>
	<title>Gym Tracker - {t('workouts.title', $locale)}</title>
</svelte:head>

<div class="px-4 pt-14 space-y-4" style="padding-top: calc(3.5rem + var(--safe-top, 0px));">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">{t('workouts.title', $locale)}</h1>
		<button
			class="px-4 py-2 bg-primary rounded-xl font-medium text-white text-sm active:scale-95 transition-transform"
			onclick={() => { showNewModal = true; haptic('light'); }}
		>
			+ {t('workouts.new', $locale)}
		</button>
	</div>

	{#if loading}
		<div class="space-y-3">
			{#each Array(3) as _}
				<Skeleton class="h-24 w-full" />
			{/each}
		</div>
	{:else if workouts.length === 0}
		<div class="text-center py-16">
			<div class="text-5xl mb-4">📋</div>
			<div class="text-lg text-slate-500">{t('workouts.empty', $locale)}</div>
		</div>
	{:else}
		<div class="space-y-3">
			{#each workouts as workout (workout.id)}
					<GlassCard onclick={() => goto(`/workouts/${workout.id}`)}>
						<div class="flex items-center justify-between">
							<div>
								<div class="font-semibold">{workout.name}</div>
								<div class="text-sm text-slate-500">
									{formatDate(new Date(workout.date), $locale)}
								</div>
							</div>
							<div class="flex items-center gap-2">
								<button
									class="p-2 rounded-lg bg-surface active:scale-90 transition-transform"
									onclick={(e) => { e.stopPropagation(); repeatWorkout(workout); }}
									aria-label={t('workouts.repeat', $locale)}
								>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-slate-400">
										<path d="M17 1l4 4-4 4"/>
										<path d="M3 11V9a4 4 0 014-4h14"/>
										<path d="M7 23l-4-4 4-4"/>
										<path d="M21 13v2a4 4 0 01-4 4H3"/>
									</svg>
								</button>
								<button
									class="p-2 rounded-lg bg-surface active:scale-90 transition-transform"
									onclick={(e) => { e.stopPropagation(); deleteWorkout(workout.id); }}
									aria-label="Delete workout"
								>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-slate-400">
										<path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
									</svg>
								</button>
								{#if workout.completed}
									<span class="w-2 h-2 rounded-full bg-success"></span>
								{:else}
									<span class="w-2 h-2 rounded-full bg-warning"></span>
								{/if}
							</div>
						</div>
					</GlassCard>
			{/each}
		</div>
	{/if}
</div>

<!-- New Workout Modal -->
<Modal open={showNewModal} onclose={() => showNewModal = false} title={t('workouts.new', $locale)}>
	<form onsubmit={(e) => { e.preventDefault(); createWorkout(); }} class="space-y-4">
		<div>
			<label for="workout-name" class="text-sm text-slate-400 mb-1 block">
				{t('workouts.name', $locale)}
			</label>
			<input
				id="workout-name"
				type="text"
				bind:value={newName}
				class="w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-on-surface placeholder-slate-500 focus:border-primary focus:outline-none"
				placeholder={$locale === 'ru' ? 'Например: Грудь + Трицепс' : 'e.g.: Chest + Triceps'}
			/>
		</div>
		<div>
			<label for="workout-date" class="text-sm text-slate-400 mb-1 block">
				{t('workouts.date', $locale)}
			</label>
			<input
				id="workout-date"
				type="date"
				bind:value={newDate}
				class="w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-on-surface focus:border-primary focus:outline-none"
			/>
		</div>
		<button
			type="submit"
			class="w-full py-3.5 bg-primary rounded-xl font-semibold text-white active:scale-[0.98] transition-transform"
		>
			{t('common.save', $locale)}
		</button>
	</form>
</Modal>
