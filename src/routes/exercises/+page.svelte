<script lang="ts">
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';
	import GlassCard from '$lib/components/GlassCard.svelte';
	import SwipeToDelete from '$lib/components/SwipeToDelete.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import PullToRefresh from '$lib/components/PullToRefresh.svelte';
	import { exerciseRepo } from '$lib/db/repositories';
	import type { Exercise, ExerciseCategory, MuscleGroup } from '$lib/domain/types';
	import { settings } from '$lib/stores/settings';
	import { showToast } from '$lib/stores/app';
	import { t } from '$lib/utils/i18n';
	import { haptic } from '$lib/utils/calc';

	const locale = derived(settings, ($s) => $s.locale);

	let exercises = $state<Exercise[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let showModal = $state(false);
	let editingExercise = $state<Exercise | null>(null);

	let formName = $state('');
	let formCategory = $state<ExerciseCategory>('barbell');
	let formMuscle = $state<MuscleGroup>('chest');

	let showDeleteConfirm = $state(false);
	let deletingExerciseId = $state<string | null>(null);

	const categories: ExerciseCategory[] = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'other'];
	const muscleGroups: MuscleGroup[] = [
		'chest', 'back', 'shoulders', 'biceps', 'triceps',
		'legs', 'glutes', 'core', 'forearms', 'calves', 'full_body'
	];

	const filtered = $derived(
		searchQuery
			? exercises.filter((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
			: exercises
	);

	async function loadExercises() {
		exercises = await exerciseRepo.getAll();
		loading = false;
	}

	onMount(loadExercises);

	function openAdd() {
		editingExercise = null;
		formName = '';
		formCategory = 'barbell';
		formMuscle = 'chest';
		showModal = true;
	}

	function openEdit(ex: Exercise) {
		editingExercise = ex;
		formName = ex.name;
		formCategory = ex.category;
		formMuscle = ex.muscleGroup;
		showModal = true;
	}

	async function saveExercise() {
		if (!formName.trim()) return;
		haptic('medium');

		if (editingExercise) {
			await exerciseRepo.update(editingExercise.id, {
				name: formName.trim(),
				category: formCategory,
				muscleGroup: formMuscle
			});
			showToast($locale === 'ru' ? 'Упражнение обновлено' : 'Exercise updated');
		} else {
			await exerciseRepo.create({
				name: formName.trim(),
				category: formCategory,
				muscleGroup: formMuscle,
				isCustom: true
			});
			showToast($locale === 'ru' ? 'Упражнение добавлено' : 'Exercise added');
		}

		showModal = false;
		await loadExercises();
	}

	function confirmDeleteExercise(id: string) {
		deletingExerciseId = id;
		showDeleteConfirm = true;
	}

	async function deleteExercise() {
		if (!deletingExerciseId) return;
		haptic('medium');
		await exerciseRepo.remove(deletingExerciseId);
		exercises = exercises.filter((e) => e.id !== deletingExerciseId);
		showToast($locale === 'ru' ? 'Упражнение удалено' : 'Exercise deleted');
		showDeleteConfirm = false;
		deletingExerciseId = null;
	}
</script>

<svelte:head>
	<title>Gym Tracker - {t('exercises.title', $locale)}</title>
</svelte:head>

<PullToRefresh onrefresh={loadExercises}>
	<div class="px-4 pt-14 space-y-4" style="padding-top: calc(3.5rem + var(--safe-top, 0px));">
		<div class="flex items-center justify-between">
			<h1 class="text-2xl font-bold">{t('exercises.title', $locale)}</h1>
			<button
				class="px-4 py-2 bg-primary rounded-xl font-medium text-white text-sm active:scale-95 transition-transform"
				onclick={openAdd}
			>
				+ {t('exercises.add', $locale)}
			</button>
		</div>

		<!-- Search -->
		<div class="relative">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2">
				<circle cx="11" cy="11" r="8"/>
				<path d="M21 21l-4.35-4.35"/>
			</svg>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder={t('exercises.search', $locale)}
				class="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-surface-border text-on-surface placeholder-slate-500 focus:border-primary focus:outline-none"
			/>
		</div>

		{#if loading}
			<div class="space-y-3">
				{#each Array(5) as _}
					<Skeleton class="h-16 w-full" />
				{/each}
			</div>
		{:else if filtered.length === 0}
			<div class="text-center py-12">
				<div class="text-4xl mb-3">🔍</div>
				<p class="text-slate-500">{t('exercises.empty', $locale)}</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each filtered as ex (ex.id)}
					<SwipeToDelete ondelete={() => confirmDeleteExercise(ex.id)}>
						<GlassCard onclick={() => openEdit(ex)}>
							<div class="flex items-center justify-between">
								<div>
									<div class="font-medium">{ex.name}</div>
									<div class="flex gap-2 mt-1">
										<span class="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary-light">
											{t(`category.${ex.category}`, $locale)}
										</span>
										<span class="text-xs px-2 py-0.5 rounded bg-surface text-slate-400">
											{t(`muscle.${ex.muscleGroup}`, $locale)}
										</span>
									</div>
								</div>
								{#if ex.isCustom}
									<span class="text-xs text-slate-600">✎</span>
								{/if}
							</div>
						</GlassCard>
					</SwipeToDelete>
				{/each}
			</div>
		{/if}
	</div>
</PullToRefresh>

<!-- Add/Edit Modal -->
<Modal
	open={showModal}
	onclose={() => showModal = false}
	title={editingExercise ? t('exercises.edit', $locale) : t('exercises.add', $locale)}
>
	<form onsubmit={(e) => { e.preventDefault(); saveExercise(); }} class="space-y-4">
		<div>
			<label for="ex-name" class="text-sm text-slate-400 mb-1 block">
				{t('exercises.name', $locale)}
			</label>
			<input
				id="ex-name"
				type="text"
				bind:value={formName}
				class="w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-on-surface placeholder-slate-500 focus:border-primary focus:outline-none"
			/>
		</div>

		<div>
			<label for="ex-cat" class="text-sm text-slate-400 mb-1 block">
				{t('exercises.category', $locale)}
			</label>
			<select
				id="ex-cat"
				bind:value={formCategory}
				class="w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-on-surface focus:border-primary focus:outline-none"
			>
				{#each categories as cat}
					<option value={cat}>{t(`category.${cat}`, $locale)}</option>
				{/each}
			</select>
		</div>

		<div>
			<label for="ex-muscle" class="text-sm text-slate-400 mb-1 block">
				{t('exercises.muscle', $locale)}
			</label>
			<select
				id="ex-muscle"
				bind:value={formMuscle}
				class="w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-on-surface focus:border-primary focus:outline-none"
			>
				{#each muscleGroups as mg}
					<option value={mg}>{t(`muscle.${mg}`, $locale)}</option>
				{/each}
			</select>
		</div>

		<button
			type="submit"
			class="w-full py-3.5 bg-primary rounded-xl font-semibold text-white active:scale-[0.98] transition-transform"
		>
			{t('common.save', $locale)}
		</button>
	</form>
</Modal>

<!-- Delete Confirmation Modal -->
<Modal
	open={showDeleteConfirm}
	onclose={() => { showDeleteConfirm = false; deletingExerciseId = null; }}
	title={$locale === 'ru' ? 'Удалить упражнение' : 'Delete exercise'}
>
	<p class="text-slate-400 mb-6">
		{$locale === 'ru' ? 'Вы уверены, что хотите удалить это упражнение?' : 'Are you sure you want to delete this exercise?'}
	</p>
	<div class="flex gap-3">
		<button
			class="flex-1 py-3 rounded-xl font-medium bg-surface border border-surface-border text-on-surface active:scale-[0.98] transition-transform"
			onclick={() => { showDeleteConfirm = false; deletingExerciseId = null; }}
		>
			{$locale === 'ru' ? 'Отмена' : 'Cancel'}
		</button>
		<button
			class="flex-1 py-3 rounded-xl font-medium bg-slate-700 text-white active:scale-[0.98] transition-transform"
			onclick={deleteExercise}
		>
			{$locale === 'ru' ? 'Удалить' : 'Delete'}
		</button>
	</div>
</Modal>
