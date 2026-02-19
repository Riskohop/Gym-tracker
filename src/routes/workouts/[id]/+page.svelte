<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { derived } from 'svelte/store';
	import GlassCard from '$lib/components/GlassCard.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import { workoutRepo, workoutExerciseRepo, workoutSetRepo, exerciseRepo } from '$lib/db/repositories';
	import type { WorkoutWithExercises, Exercise } from '$lib/domain/types';
	import { settings } from '$lib/stores/settings';
	import { showToast } from '$lib/stores/app';
	import { t } from '$lib/utils/i18n';
	import { haptic, calculate1RM } from '$lib/utils/calc';

	const locale = derived(settings, ($s) => $s.locale);
	const unit = derived(settings, ($s) => $s.weightUnit);

	let workout = $state<WorkoutWithExercises | null>(null);
	let loading = $state(true);
	let showExercisePicker = $state(false);
	let exercises = $state<Exercise[]>([]);
	let searchQuery = $state('');
	let saving = $state(false);

	const filteredExercises = $derived(
		searchQuery
			? exercises.filter((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
			: exercises
	);

	const workoutId = $derived($page.params.id);

	async function loadWorkout() {
		workout = await workoutRepo.getWithExercises(workoutId);
		loading = false;
	}

	onMount(loadWorkout);

	async function openExercisePicker() {
		exercises = await exerciseRepo.getAll();
		showExercisePicker = true;
	}

	async function addExercise(exerciseId: string) {
		if (!workout) return;
		haptic('medium');
		const order = workout.exercises.length;
		const weId = await workoutExerciseRepo.create({
			workoutId: workout.id,
			exerciseId,
			order
		} as any);
		// Auto-add first set
		await workoutSetRepo.create({
			workoutExerciseId: weId,
			setNumber: 1,
			weight: 0,
			reps: 0,
			completed: false
		} as any);
		showExercisePicker = false;
		searchQuery = '';
		await loadWorkout();
	}

	async function addSet(workoutExerciseId: string) {
		if (!workout) return;
		haptic('light');
		const we = workout.exercises.find((e) => e.id === workoutExerciseId);
		if (!we) return;

		const lastSet = we.sets[we.sets.length - 1];
		await workoutSetRepo.create({
			workoutExerciseId,
			setNumber: we.sets.length + 1,
			weight: lastSet?.weight ?? 0,
			reps: lastSet?.reps ?? 0,
			completed: false
		} as any);
		await loadWorkout();
	}

	async function updateSet(setId: string, field: 'weight' | 'reps', value: number) {
		saving = true;
		await workoutSetRepo.update(setId, { [field]: value });
		// Update local state
		if (workout) {
			for (const we of workout.exercises) {
				const s = we.sets.find((s) => s.id === setId);
				if (s) {
					if (field === 'weight') s.weight = value;
					else s.reps = value;
					break;
				}
			}
		}
		saving = false;
	}

	async function deleteSet(setId: string) {
		haptic('medium');
		await workoutSetRepo.remove(setId);
		await loadWorkout();
	}

	async function removeExercise(weId: string) {
		haptic('medium');
		await workoutExerciseRepo.remove(weId);
		await loadWorkout();
		showToast($locale === 'ru' ? 'Упражнение удалено' : 'Exercise removed');
	}

	async function finishWorkout() {
		if (!workout) return;
		haptic('heavy');
		await workoutRepo.update(workout.id, { completed: true });
		showToast($locale === 'ru' ? 'Тренировка завершена!' : 'Workout completed!');
		goto('/workouts');
	}

	function handleWeightInput(setId: string, e: Event) {
		const val = parseFloat((e.target as HTMLInputElement).value) || 0;
		updateSet(setId, 'weight', val);
	}

	function handleRepsInput(setId: string, e: Event) {
		const val = parseInt((e.target as HTMLInputElement).value) || 0;
		updateSet(setId, 'reps', val);
	}
</script>

<svelte:head>
	<title>{workout?.name ?? 'Workout'} - Gym Tracker</title>
</svelte:head>

<div class="px-4 pt-14 pb-8 space-y-4" style="padding-top: calc(3.5rem + var(--safe-top, 0px));">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<button
			class="p-2 rounded-xl bg-surface active:scale-90 transition-transform"
			onclick={() => goto('/workouts')}
			aria-label="Back"
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
				<path d="M19 12H5M12 19l-7-7 7-7"/>
			</svg>
		</button>
		<div class="flex-1">
			{#if loading}
				<Skeleton class="h-7 w-40" />
			{:else if workout}
				<h1 class="text-xl font-bold truncate">{workout.name}</h1>
			{/if}
		</div>
		{#if saving}
			<div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
		{/if}
	</div>

	{#if loading}
		<div class="space-y-4">
			{#each Array(2) as _}
				<Skeleton class="h-48 w-full" />
			{/each}
		</div>
	{:else if workout}
		<!-- Exercises -->
		{#if workout.exercises.length === 0}
			<div class="text-center py-12">
				<div class="text-4xl mb-3">💪</div>
				<p class="text-slate-500">{t('workouts.noExercises', $locale)}</p>
			</div>
		{/if}

		{#each workout.exercises as we (we.id)}
				<GlassCard>
					<div class="flex items-center justify-between mb-3">
						<h3 class="font-semibold text-primary-light">{we.exercise.name}</h3>
						<div class="flex items-center gap-2">
							<span class="text-xs text-slate-500 px-2 py-0.5 rounded-lg bg-surface">
								{we.sets.length} {t('common.sets', $locale)}
							</span>
							<button
								class="p-1.5 rounded-lg text-slate-500 active:text-slate-300 transition-colors"
								onclick={() => removeExercise(we.id)}
								aria-label="Delete exercise"
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
									<path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
								</svg>
							</button>
						</div>
					</div>

					<!-- Sets table header -->
					<div class="grid grid-cols-[40px_1fr_1fr_40px] gap-2 mb-2 text-xs text-slate-500 font-medium px-1">
						<span>#</span>
						<span>{t('workouts.weight', $locale)} ({$unit})</span>
						<span>{t('workouts.reps', $locale)}</span>
						<span></span>
					</div>

					<!-- Sets -->
					{#each we.sets as s (s.id)}
						<div class="grid grid-cols-[40px_1fr_1fr_40px] gap-2 mb-2 items-center">
							<span class="text-sm text-slate-500 text-center font-medium">{s.setNumber}</span>
							<input
								type="number"
								inputmode="decimal"
								value={s.weight}
								oninput={(e) => handleWeightInput(s.id, e)}
								class="w-full px-3 py-2.5 rounded-lg bg-surface-alt border border-surface-border text-on-surface text-center text-sm focus:border-primary focus:outline-none"
							/>
							<input
								type="number"
								inputmode="numeric"
								value={s.reps}
								oninput={(e) => handleRepsInput(s.id, e)}
								class="w-full px-3 py-2.5 rounded-lg bg-surface-alt border border-surface-border text-on-surface text-center text-sm focus:border-primary focus:outline-none"
							/>
							<button
								class="p-1.5 text-slate-600 active:text-danger transition-colors"
								onclick={() => deleteSet(s.id)}
								aria-label="Delete set"
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
									<path d="M6 18L18 6M6 6l12 12"/>
								</svg>
							</button>
						</div>
					{/each}

					<!-- Add set button -->
					<button
						class="w-full mt-2 py-2.5 rounded-xl bg-surface text-sm text-slate-500 active:opacity-70 transition-colors"
						onclick={() => addSet(we.id)}
					>
						+ {t('workouts.addSet', $locale)}
					</button>
				</GlassCard>
		{/each}

		<!-- Add exercise button -->
		<button
			class="w-full py-4 rounded-2xl bg-primary/10 text-primary font-medium active:scale-[0.98] transition-transform"
			onclick={openExercisePicker}
		>
			+ {t('workouts.addExercise', $locale)}
		</button>

		<!-- Finish button -->
		{#if workout.exercises.length > 0 && !workout.completed}
			<button
				class="w-full py-4 bg-success rounded-2xl font-semibold text-white text-lg active:scale-[0.98] transition-transform shadow-lg shadow-success/20"
				onclick={finishWorkout}
			>
				{t('workouts.finish', $locale)}
			</button>
		{/if}
	{/if}
</div>

<!-- Exercise Picker Modal -->
<Modal open={showExercisePicker} onclose={() => showExercisePicker = false} title={t('workouts.addExercise', $locale)}>
	<div class="space-y-3">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder={t('exercises.search', $locale)}
			class="w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-on-surface placeholder-slate-500 focus:border-primary focus:outline-none"
		/>
		<div class="max-h-64 overflow-y-auto space-y-1 no-scrollbar">
			{#each filteredExercises as ex (ex.id)}
				<button
					class="w-full text-left px-4 py-3 rounded-xl active:bg-primary/10 transition-colors"
					onclick={() => addExercise(ex.id)}
				>
					<div class="font-medium">{ex.name}</div>
					<div class="text-xs text-slate-500">
						{t(`category.${ex.category}`, $locale)} · {t(`muscle.${ex.muscleGroup}`, $locale)}
					</div>
				</button>
			{/each}
			{#if filteredExercises.length === 0}
				<div class="text-center py-4 text-slate-500 text-sm">
					{t('exercises.empty', $locale)}
				</div>
			{/if}
		</div>
	</div>
</Modal>
