import { db } from './database';
import type { Exercise } from '$lib/domain/types';

const defaultExercises: Omit<Exercise, 'id'>[] = [
	// Barbell
	{ name: 'Жим лёжа', category: 'barbell', muscleGroup: 'chest', isCustom: false, createdAt: new Date() },
	{ name: 'Присед', category: 'barbell', muscleGroup: 'legs', isCustom: false, createdAt: new Date() },
	{ name: 'Становая тяга', category: 'barbell', muscleGroup: 'back', isCustom: false, createdAt: new Date() },
	{ name: 'Жим стоя', category: 'barbell', muscleGroup: 'shoulders', isCustom: false, createdAt: new Date() },
	{ name: 'Тяга в наклоне', category: 'barbell', muscleGroup: 'back', isCustom: false, createdAt: new Date() },
	{ name: 'Подъём на бицепс', category: 'barbell', muscleGroup: 'biceps', isCustom: false, createdAt: new Date() },
	// Dumbbell
	{ name: 'Жим гантелей лёжа', category: 'dumbbell', muscleGroup: 'chest', isCustom: false, createdAt: new Date() },
	{ name: 'Жим гантелей сидя', category: 'dumbbell', muscleGroup: 'shoulders', isCustom: false, createdAt: new Date() },
	{ name: 'Разводка гантелей', category: 'dumbbell', muscleGroup: 'chest', isCustom: false, createdAt: new Date() },
	{ name: 'Молотки', category: 'dumbbell', muscleGroup: 'biceps', isCustom: false, createdAt: new Date() },
	{ name: 'Выпады с гантелями', category: 'dumbbell', muscleGroup: 'legs', isCustom: false, createdAt: new Date() },
	// Cable / Machine
	{ name: 'Тяга верхнего блока', category: 'cable', muscleGroup: 'back', isCustom: false, createdAt: new Date() },
	{ name: 'Тяга нижнего блока', category: 'cable', muscleGroup: 'back', isCustom: false, createdAt: new Date() },
	{ name: 'Разгибание на трицепс', category: 'cable', muscleGroup: 'triceps', isCustom: false, createdAt: new Date() },
	{ name: 'Жим ногами', category: 'machine', muscleGroup: 'legs', isCustom: false, createdAt: new Date() },
	{ name: 'Сгибание ног', category: 'machine', muscleGroup: 'legs', isCustom: false, createdAt: new Date() },
	{ name: 'Разгибание ног', category: 'machine', muscleGroup: 'legs', isCustom: false, createdAt: new Date() },
	// Bodyweight
	{ name: 'Подтягивания', category: 'bodyweight', muscleGroup: 'back', isCustom: false, createdAt: new Date() },
	{ name: 'Отжимания на брусьях', category: 'bodyweight', muscleGroup: 'triceps', isCustom: false, createdAt: new Date() },
	{ name: 'Отжимания', category: 'bodyweight', muscleGroup: 'chest', isCustom: false, createdAt: new Date() },
	{ name: 'Планка', category: 'bodyweight', muscleGroup: 'core', isCustom: false, createdAt: new Date() }
];

const defaultExercisesEn: Omit<Exercise, 'id'>[] = [
	{ name: 'Bench Press', category: 'barbell', muscleGroup: 'chest', isCustom: false, createdAt: new Date() },
	{ name: 'Squat', category: 'barbell', muscleGroup: 'legs', isCustom: false, createdAt: new Date() },
	{ name: 'Deadlift', category: 'barbell', muscleGroup: 'back', isCustom: false, createdAt: new Date() },
	{ name: 'Overhead Press', category: 'barbell', muscleGroup: 'shoulders', isCustom: false, createdAt: new Date() },
	{ name: 'Barbell Row', category: 'barbell', muscleGroup: 'back', isCustom: false, createdAt: new Date() },
	{ name: 'Barbell Curl', category: 'barbell', muscleGroup: 'biceps', isCustom: false, createdAt: new Date() },
	{ name: 'Dumbbell Bench Press', category: 'dumbbell', muscleGroup: 'chest', isCustom: false, createdAt: new Date() },
	{ name: 'Dumbbell Shoulder Press', category: 'dumbbell', muscleGroup: 'shoulders', isCustom: false, createdAt: new Date() },
	{ name: 'Dumbbell Fly', category: 'dumbbell', muscleGroup: 'chest', isCustom: false, createdAt: new Date() },
	{ name: 'Hammer Curl', category: 'dumbbell', muscleGroup: 'biceps', isCustom: false, createdAt: new Date() },
	{ name: 'Dumbbell Lunge', category: 'dumbbell', muscleGroup: 'legs', isCustom: false, createdAt: new Date() },
	{ name: 'Lat Pulldown', category: 'cable', muscleGroup: 'back', isCustom: false, createdAt: new Date() },
	{ name: 'Seated Cable Row', category: 'cable', muscleGroup: 'back', isCustom: false, createdAt: new Date() },
	{ name: 'Tricep Pushdown', category: 'cable', muscleGroup: 'triceps', isCustom: false, createdAt: new Date() },
	{ name: 'Leg Press', category: 'machine', muscleGroup: 'legs', isCustom: false, createdAt: new Date() },
	{ name: 'Leg Curl', category: 'machine', muscleGroup: 'legs', isCustom: false, createdAt: new Date() },
	{ name: 'Leg Extension', category: 'machine', muscleGroup: 'legs', isCustom: false, createdAt: new Date() },
	{ name: 'Pull-up', category: 'bodyweight', muscleGroup: 'back', isCustom: false, createdAt: new Date() },
	{ name: 'Dips', category: 'bodyweight', muscleGroup: 'triceps', isCustom: false, createdAt: new Date() },
	{ name: 'Push-up', category: 'bodyweight', muscleGroup: 'chest', isCustom: false, createdAt: new Date() },
	{ name: 'Plank', category: 'bodyweight', muscleGroup: 'core', isCustom: false, createdAt: new Date() }
];

export async function seedDatabase(locale: 'ru' | 'en' = 'ru'): Promise<void> {
	const count = await db.exercises.count();
	if (count === 0) {
		const exercises = locale === 'ru' ? defaultExercises : defaultExercisesEn;
		await db.exercises.bulkAdd(exercises as Exercise[]);
	}
}
