import { emptyProgress, type ProgressSnapshot } from '../../entities/onboarding/model.ts'

export interface ProgressRepository { getProgress(): Promise<unknown>; saveProgress(progress: ProgressSnapshot): Promise<void>; resetProgress(): Promise<void> }
const STORAGE_KEY = 'university-onboarding:progress:v1'
/** Сохраняет только прогресс; ошибки доступа к хранилищу передаются вызывающей стороне. */
export class LocalStorageProgressRepository implements ProgressRepository {
  /** Загружает снимок или возвращает начальное состояние при повреждённом JSON. */
  async getProgress(): Promise<unknown> { const data = localStorage.getItem(STORAGE_KEY); if (!data) return emptyProgress(); try { return JSON.parse(data) as unknown } catch { return emptyProgress() } }
  /** Записывает актуальный снимок. */
  async saveProgress(progress: ProgressSnapshot): Promise<void> { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)) }
  /** Удаляет сохранённый снимок. */
  async resetProgress(): Promise<void> { localStorage.removeItem(STORAGE_KEY) }
}
/** Контракт для будущего API: серверный протокол пока не определён. */
export class HttpProgressRepository implements ProgressRepository {
  /** Загрузка станет доступна после согласования API. */
  async getProgress(): Promise<unknown> { throw new Error('API прогресса не настроен') }
  /** Сохранение станет доступно после согласования API. */
  async saveProgress(): Promise<void> { throw new Error('API прогресса не настроен') }
  /** Сброс станет доступен после согласования API. */
  async resetProgress(): Promise<void> { throw new Error('API прогресса не настроен') }
}
/** Выбирает адаптер хранения в одном месте. */
export function createProgressRepository(): ProgressRepository { return new LocalStorageProgressRepository() }
