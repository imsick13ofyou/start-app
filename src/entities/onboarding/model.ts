export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'
export interface OfficialSource { title: string; url: string; verifiedAt?: string; owner?: string }
export type ContentCard = { type: 'text'; title: string; text: string } | { type: 'steps'; title: string; steps: string[] } | { type: 'choice'; title: string; options: string[]; answer: number; explanation: string }
export interface OnboardingPoint { id: string; blockId: string; title: string; description: string; order: number; cards: ContentCard[]; sources: OfficialSource[] }
export interface OnboardingBlock { id: string; title: string; description: string; order: number; icon: string; theme: string; points: OnboardingPoint[] }
export interface PointProgress { status: ProgressStatus; cardIndex: number; completedAt?: string }
export interface ProgressSnapshot { version: 1; points: Record<string, PointProgress>; blocks: Record<string, ProgressStatus>; currentPointId: string | null; currentCardIndex: number; updatedAt: string }

/** Создаёт пустой снимок без привязки к содержимому. */
export function emptyProgress(): ProgressSnapshot { return { version: 1, points: {}, blocks: {}, currentPointId: null, currentCardIndex: 0, updatedAt: new Date().toISOString() } }
/** Возвращает точки в порядке прохождения. */
export function orderedPoints(blocks: OnboardingBlock[]): OnboardingPoint[] { return [...blocks].sort((a,b) => a.order-b.order).flatMap(b => [...b.points].sort((a,c) => a.order-c.order)) }
/** Приводит сохранённые данные к актуальному содержимому и пересчитывает блоки. */
export function normalizeProgress(input: unknown, blocks: OnboardingBlock[]): ProgressSnapshot {
  const raw = input && typeof input === 'object' ? input as Partial<ProgressSnapshot> : {}
  if (raw.version !== 1 && raw.version !== undefined) return normalizeProgress({}, blocks)
  const points: Record<string, PointProgress> = {}
  for (const point of orderedPoints(blocks)) {
    const saved = raw.points?.[point.id]
    const status = saved && ['not_started','in_progress','completed'].includes(saved.status) ? saved.status : 'not_started'
    points[point.id] = { status, cardIndex: Number.isInteger(saved?.cardIndex) ? Math.max(0, Math.min(point.cards.length - 1, saved!.cardIndex)) : 0, ...(status === 'completed' && typeof saved?.completedAt === 'string' ? { completedAt: saved.completedAt } : {}) }
  }
  const statuses: Record<string, ProgressStatus> = {}
  for (const block of blocks) { const values = block.points.map(p => points[p.id].status); statuses[block.id] = values.length > 0 && values.every(s => s === 'completed') ? 'completed' : values.some(s => s !== 'not_started') ? 'in_progress' : 'not_started' }
  const currentPointId = typeof raw.currentPointId === 'string' && points[raw.currentPointId] ? raw.currentPointId : null
  return { version: 1, points, blocks: statuses, currentPointId, currentCardIndex: currentPointId ? points[currentPointId].cardIndex : 0, updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString() }
}
/** Проверяет последовательную доступность точки, включая повторное чтение. */
export function isAvailable(id: string, progress: ProgressSnapshot, blocks: OnboardingBlock[]): boolean { const all = orderedPoints(blocks); const index = all.findIndex(p => p.id === id); return index >= 0 && (progress.points[id]?.status !== 'not_started' || all.slice(0,index).every(p => progress.points[p.id]?.status === 'completed')) }
/** Обновляет точку и синхронизирует производные показатели. */
export function updatePoint(progress: ProgressSnapshot, blocks: OnboardingBlock[], id: string, update: Partial<PointProgress>): ProgressSnapshot { if (!progress.points[id] || !isAvailable(id, progress, blocks)) return progress; return normalizeProgress({ ...progress, points: { ...progress.points, [id]: { ...progress.points[id], ...update } }, currentPointId: id, updatedAt: new Date().toISOString() }, blocks) }
/** Проверяет, завершит ли точка свой блок впервые при текущем состоянии. */
export function completesBlock(progress: ProgressSnapshot, blocks: OnboardingBlock[], id: string): boolean {
  const block = blocks.find(item => item.points.some(point => point.id === id))
  if (!block || progress.blocks[block.id] !== 'in_progress' || progress.points[id]?.status !== 'in_progress' || !isAvailable(id, progress, blocks)) return false
  const last = [...block.points].sort((a, b) => a.order - b.order).at(-1)
  return last?.id === id && block.points.every(point => point.id === id || progress.points[point.id]?.status === 'completed')
}
