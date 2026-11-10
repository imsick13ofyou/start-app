import type { CelebrationLevel } from '../../types/celebration'

/** Количество декоративных элементов для каждого достижения. */
export const celebrationConfig: Record<
  CelebrationLevel,
  { trophies: number; stars: number }
> = {
  topic: { trophies: 1, stars: 4 },
  block: { trophies: 3, stars: 12 },
  onboarding: { trophies: 5, stars: 24 },
}
