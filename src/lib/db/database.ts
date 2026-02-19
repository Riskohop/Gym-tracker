import Dexie, { type EntityTable } from 'dexie';
import type { Exercise, Workout, WorkoutExercise, WorkoutSet } from '$lib/domain/types';

class GymDatabase extends Dexie {
	exercises!: EntityTable<Exercise, 'id'>;
	workouts!: EntityTable<Workout, 'id'>;
	workoutExercises!: EntityTable<WorkoutExercise, 'id'>;
	workoutSets!: EntityTable<WorkoutSet, 'id'>;

	constructor() {
		super('GymTrackerDB');

		this.version(1).stores({
			exercises: '++id, name, category, muscleGroup, createdAt',
			workouts: '++id, date, completed, createdAt',
			workoutExercises: '++id, workoutId, exerciseId, order, createdAt',
			workoutSets: '++id, workoutExerciseId, setNumber, createdAt'
		});
	}
}

export const db = new GymDatabase();
