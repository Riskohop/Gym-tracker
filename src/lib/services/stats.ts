import { db } from '$lib/db/database';
import type { ExerciseStats, DashboardData, WorkoutWithExercises } from '$lib/domain/types';
import { calculate1RM, getMonthRange } from '$lib/utils/calc';
import { workoutRepo } from '$lib/db/repositories';

export async function getExerciseStats(exerciseId: string): Promise<ExerciseStats | null> {
	const exercise = await db.exercises.get(exerciseId);
	if (!exercise) return null;

	const workoutExercises = await db.workoutExercises
		.where('exerciseId')
		.equals(exerciseId)
		.toArray();

	if (workoutExercises.length === 0) {
		return {
			exerciseId,
			exerciseName: exercise.name,
			personalRecord: 0,
			pr1RM: 0,
			avgWeight: 0,
			totalVolume: 0,
			totalSets: 0,
			totalReps: 0,
			frequency: 0,
			history: []
		};
	}

	let personalRecord = 0;
	let pr1RM = 0;
	let totalWeight = 0;
	let totalVolume = 0;
	let totalSets = 0;
	let totalReps = 0;
	let weightEntries = 0;

	const historyMap = new Map<string, { date: Date; maxWeight: number; max1RM: number; totalVolume: number }>();

	for (const we of workoutExercises) {
		const workout = await db.workouts.get(we.workoutId);
		if (!workout) continue;

		const sets = await db.workoutSets
			.where('workoutExerciseId')
			.equals(we.id)
			.toArray();

		let dayMaxWeight = 0;
		let dayMax1RM = 0;
		let dayVolume = 0;

		for (const s of sets) {
			if (s.weight > personalRecord) personalRecord = s.weight;
			const est1rm = calculate1RM(s.weight, s.reps);
			if (est1rm > pr1RM) pr1RM = est1rm;

			if (s.weight > 0) {
				totalWeight += s.weight;
				weightEntries++;
			}
			const setVolume = s.weight * s.reps;
			totalVolume += setVolume;
			dayVolume += setVolume;
			totalSets++;
			totalReps += s.reps;

			if (s.weight > dayMaxWeight) dayMaxWeight = s.weight;
			if (est1rm > dayMax1RM) dayMax1RM = est1rm;
		}

		const dateKey = workout.date.toISOString().split('T')[0];
		const existing = historyMap.get(dateKey);
		if (!existing || dayMaxWeight > existing.maxWeight) {
			historyMap.set(dateKey, {
				date: workout.date,
				maxWeight: dayMaxWeight,
				max1RM: dayMax1RM,
				totalVolume: dayVolume
			});
		}
	}

	const workoutIds = new Set(workoutExercises.map((we) => we.workoutId));

	const history = Array.from(historyMap.values()).sort(
		(a, b) => a.date.getTime() - b.date.getTime()
	);

	return {
		exerciseId,
		exerciseName: exercise.name,
		personalRecord,
		pr1RM,
		avgWeight: weightEntries > 0 ? Math.round(totalWeight / weightEntries * 10) / 10 : 0,
		totalVolume,
		totalSets,
		totalReps,
		frequency: workoutIds.size,
		history
	};
}

export async function getDashboardData(): Promise<DashboardData> {
	const { start, end } = getMonthRange();

	const allWorkouts = await workoutRepo.getAll();
	const lastWorkout = allWorkouts.length > 0
		? await workoutRepo.getWithExercises(allWorkouts[0].id)
		: null;

	const monthWorkouts = await workoutRepo.getByDateRange(start, end);
	const workoutsThisMonth = monthWorkouts.length;

	let totalTonnageThisMonth = 0;
	for (const w of monthWorkouts) {
		const wes = await db.workoutExercises.where('workoutId').equals(w.id).toArray();
		for (const we of wes) {
			const sets = await db.workoutSets.where('workoutExerciseId').equals(we.id).toArray();
			for (const s of sets) {
				totalTonnageThisMonth += s.weight * s.reps;
			}
		}
	}

	// Compound lifts - find by common names
	const compoundNames = [
		'Жим лёжа', 'Bench Press',
		'Присед', 'Squat',
		'Становая тяга', 'Deadlift'
	];

	const compoundLifts: DashboardData['compoundLifts'] = [];
	const exercises = await db.exercises.toArray();

	for (const ex of exercises) {
		if (!compoundNames.includes(ex.name)) continue;

		const stats = await getExerciseStats(ex.id);
		if (stats && stats.personalRecord > 0) {
			compoundLifts.push({
				name: ex.name,
				currentMax: stats.history.length > 0
					? stats.history[stats.history.length - 1].maxWeight
					: 0,
				pr: stats.personalRecord
			});
		}
	}

	return {
		lastWorkout,
		workoutsThisMonth,
		totalTonnageThisMonth: Math.round(totalTonnageThisMonth),
		compoundLifts
	};
}

export async function exportToCSV(): Promise<string> {
	const workouts = await workoutRepo.getAll();
	const lines: string[] = ['Date,Workout,Exercise,Set,Weight,Reps,Volume'];

	for (const w of workouts) {
		const full = await workoutRepo.getWithExercises(w.id);
		if (!full) continue;
		for (const we of full.exercises) {
			for (const s of we.sets) {
				lines.push(
					`${w.date.toISOString().split('T')[0]},${w.name},${we.exercise.name},${s.setNumber},${s.weight},${s.reps},${s.weight * s.reps}`
				);
			}
		}
	}

	return lines.join('\n');
}

export async function exportBackup(): Promise<string> {
	const data = {
		version: 1,
		exportedAt: new Date().toISOString(),
		exercises: await db.exercises.toArray(),
		workouts: await db.workouts.toArray(),
		workoutExercises: await db.workoutExercises.toArray(),
		workoutSets: await db.workoutSets.toArray()
	};
	return JSON.stringify(data, null, 2);
}

export async function importBackup(json: string): Promise<void> {
	const data = JSON.parse(json);
	if (data.version !== 1) throw new Error('Unsupported backup version');

	await db.transaction('rw', [db.exercises, db.workouts, db.workoutExercises, db.workoutSets], async () => {
		await db.exercises.clear();
		await db.workouts.clear();
		await db.workoutExercises.clear();
		await db.workoutSets.clear();

		if (data.exercises?.length) {
			const exercises = data.exercises.map((e: any) => ({
				...e,
				createdAt: new Date(e.createdAt)
			}));
			await db.exercises.bulkAdd(exercises);
		}
		if (data.workouts?.length) {
			const workouts = data.workouts.map((w: any) => ({
				...w,
				date: new Date(w.date),
				createdAt: new Date(w.createdAt)
			}));
			await db.workouts.bulkAdd(workouts);
		}
		if (data.workoutExercises?.length) {
			const wes = data.workoutExercises.map((we: any) => ({
				...we,
				createdAt: new Date(we.createdAt)
			}));
			await db.workoutExercises.bulkAdd(wes);
		}
		if (data.workoutSets?.length) {
			const sets = data.workoutSets.map((s: any) => ({
				...s,
				createdAt: new Date(s.createdAt)
			}));
			await db.workoutSets.bulkAdd(sets);
		}
	});
}
