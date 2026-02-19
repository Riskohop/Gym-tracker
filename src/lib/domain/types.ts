import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────

export const ExerciseSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Name is required'),
	category: z.enum(['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'other']),
	muscleGroup: z.enum([
		'chest', 'back', 'shoulders', 'biceps', 'triceps',
		'legs', 'glutes', 'core', 'forearms', 'calves', 'full_body'
	]),
	isCustom: z.boolean().default(true),
	createdAt: z.date().optional()
});

export const WorkoutSetSchema = z.object({
	id: z.string().optional(),
	workoutExerciseId: z.string(),
	setNumber: z.number().int().min(1),
	weight: z.number().min(0),
	reps: z.number().int().min(0),
	notes: z.string().optional(),
	completed: z.boolean().default(false),
	createdAt: z.date().optional()
});

export const WorkoutExerciseSchema = z.object({
	id: z.string().optional(),
	workoutId: z.string(),
	exerciseId: z.string(),
	order: z.number().int().min(0),
	createdAt: z.date().optional()
});

export const WorkoutSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Name is required'),
	date: z.date(),
	duration: z.number().int().min(0).optional(),
	notes: z.string().optional(),
	completed: z.boolean().default(false),
	createdAt: z.date().optional()
});

// ─── Types ─────────────────────────────────────────────────

export type Exercise = z.infer<typeof ExerciseSchema> & { id: string };
export type WorkoutSet = z.infer<typeof WorkoutSetSchema> & { id: string };
export type WorkoutExercise = z.infer<typeof WorkoutExerciseSchema> & { id: string };
export type Workout = z.infer<typeof WorkoutSchema> & { id: string };

export type ExerciseCategory = Exercise['category'];
export type MuscleGroup = Exercise['muscleGroup'];

// ─── Derived types ─────────────────────────────────────────

export interface WorkoutExerciseWithSets extends WorkoutExercise {
	exercise: Exercise;
	sets: WorkoutSet[];
}

export interface WorkoutWithExercises extends Workout {
	exercises: WorkoutExerciseWithSets[];
}

export interface ExerciseStats {
	exerciseId: string;
	exerciseName: string;
	personalRecord: number;
	pr1RM: number;
	avgWeight: number;
	totalVolume: number;
	totalSets: number;
	totalReps: number;
	frequency: number;
	history: {
		date: Date;
		maxWeight: number;
		max1RM: number;
		totalVolume: number;
	}[];
}

export interface DashboardData {
	lastWorkout: WorkoutWithExercises | null;
	workoutsThisMonth: number;
	totalTonnageThisMonth: number;
	compoundLifts: {
		name: string;
		currentMax: number;
		pr: number;
	}[];
}

export type WeightUnit = 'kg' | 'lbs';
export type AppLocale = 'ru' | 'en';
export type AppTheme = 'dark' | 'light';

export interface AppSettings {
	weightUnit: WeightUnit;
	locale: AppLocale;
	theme: AppTheme;
}
