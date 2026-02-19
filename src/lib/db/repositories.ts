import { db } from './database';
import type {
	Exercise,
	Workout,
	WorkoutExercise,
	WorkoutSet,
	WorkoutWithExercises,
	WorkoutExerciseWithSets
} from '$lib/domain/types';

// Dexie ++id returns numeric keys, but IDs flow through URL params as strings.
// This helper ensures correct key type for all Dexie operations.
function k(id: string | number): number {
	return Number(id);
}

// ─── Exercise Repository ───────────────────────────────────

export const exerciseRepo = {
	async getAll(): Promise<Exercise[]> {
		return db.exercises.orderBy('name').toArray();
	},

	async getById(id: string): Promise<Exercise | undefined> {
		return db.exercises.get(k(id));
	},

	async search(query: string): Promise<Exercise[]> {
		const lower = query.toLowerCase();
		return db.exercises
			.filter((e) => e.name.toLowerCase().includes(lower))
			.toArray();
	},

	async create(exercise: Omit<Exercise, 'id'>): Promise<string> {
		const id = await db.exercises.add({
			...exercise,
			createdAt: new Date()
		} as Exercise);
		return String(id);
	},

	async update(id: string, data: Partial<Exercise>): Promise<void> {
		await db.exercises.update(k(id), data);
	},

	async remove(id: string): Promise<void> {
		await db.exercises.delete(k(id));
	}
};

// ─── Workout Repository ────────────────────────────────────

export const workoutRepo = {
	async getAll(): Promise<Workout[]> {
		return db.workouts.orderBy('date').reverse().toArray();
	},

	async getById(id: string): Promise<Workout | undefined> {
		return db.workouts.get(k(id));
	},

	async getByDateRange(start: Date, end: Date): Promise<Workout[]> {
		return db.workouts
			.where('date')
			.between(start, end)
			.reverse()
			.toArray();
	},

	async getWithExercises(id: string): Promise<WorkoutWithExercises | null> {
		const numericId = k(id);
		const workout = await db.workouts.get(numericId);
		if (!workout) return null;

		const workoutExercises = await db.workoutExercises
			.where('workoutId')
			.equals(numericId)
			.sortBy('order');

		const exercises: WorkoutExerciseWithSets[] = [];
		for (const we of workoutExercises) {
			const exercise = await db.exercises.get(we.exerciseId);
			const sets = await db.workoutSets
				.where('workoutExerciseId')
				.equals(we.id)
				.sortBy('setNumber');

			exercises.push({
				...we,
				exercise: exercise!,
				sets
			});
		}

		return { ...workout, exercises };
	},

	async create(workout: Omit<Workout, 'id'>): Promise<string> {
		const id = await db.workouts.add({
			...workout,
			createdAt: new Date()
		} as Workout);
		return String(id);
	},

	async update(id: string, data: Partial<Workout>): Promise<void> {
		await db.workouts.update(k(id), data);
	},

	async remove(id: string): Promise<void> {
		const numericId = k(id);
		const weIds = await db.workoutExercises
			.where('workoutId')
			.equals(numericId)
			.primaryKeys();

		for (const weId of weIds) {
			await db.workoutSets
				.where('workoutExerciseId')
				.equals(weId)
				.delete();
		}
		await db.workoutExercises.where('workoutId').equals(numericId).delete();
		await db.workouts.delete(numericId);
	}
};

// ─── Workout Exercise Repository ───────────────────────────

export const workoutExerciseRepo = {
	async getByWorkoutId(workoutId: string): Promise<WorkoutExercise[]> {
		return db.workoutExercises
			.where('workoutId')
			.equals(k(workoutId))
			.sortBy('order');
	},

	async create(data: Omit<WorkoutExercise, 'id'>): Promise<string> {
		const id = await db.workoutExercises.add({
			...data,
			createdAt: new Date()
		} as WorkoutExercise);
		return String(id);
	},

	async remove(id: string): Promise<void> {
		const numericId = k(id);
		await db.workoutSets.where('workoutExerciseId').equals(numericId).delete();
		await db.workoutExercises.delete(numericId);
	},

	async updateOrder(id: string, order: number): Promise<void> {
		await db.workoutExercises.update(k(id), { order });
	}
};

// ─── Workout Set Repository ────────────────────────────────

export const workoutSetRepo = {
	async getByWorkoutExerciseId(workoutExerciseId: string): Promise<WorkoutSet[]> {
		return db.workoutSets
			.where('workoutExerciseId')
			.equals(k(workoutExerciseId))
			.sortBy('setNumber');
	},

	async create(data: Omit<WorkoutSet, 'id'>): Promise<string> {
		const id = await db.workoutSets.add({
			...data,
			createdAt: new Date()
		} as WorkoutSet);
		return String(id);
	},

	async update(id: string, data: Partial<WorkoutSet>): Promise<void> {
		await db.workoutSets.update(k(id), data);
	},

	async remove(id: string): Promise<void> {
		await db.workoutSets.delete(k(id));
	}
};
