import { test } from 'node:test'
import assert from 'node:assert/strict'
import { blocks } from '../src/entities/onboarding/content.ts'
import {
  emptyProgress,
  normalizeProgress,
  orderedPoints,
  isAvailable,
  updatePoint,
  completesProgram,
  getCelebrationLevel,
} from '../src/entities/onboarding/model.ts'
import { LocalStorageProgressRepository } from '../src/shared/api/progressRepository.ts'
import { celebrationConfig } from '../src/shared/ui/celebration/config.ts'

const points = orderedPoints(blocks)
const initial = () => normalizeProgress(emptyProgress(), blocks)
const complete = (state, id) =>
  updatePoint(state, blocks, id, {
    status: 'completed',
    completedAt: '2026-01-01',
  })
test('начальное состояние и доступность', () => {
  const p = initial()
  assert.equal(points.length, 15)
  assert.equal(p.blocks[blocks[0].id], 'not_started')
  assert.equal(p.points[points[0].id].status, 'not_started')
  assert.equal(isAvailable(points[0].id, p, blocks), true)
  assert.equal(isAvailable(points[1].id, p, blocks), false)
})
test('открытие сохраняет позицию и состояние блока', () => {
  const p = updatePoint(initial(), blocks, points[0].id, {
    status: 'in_progress',
    cardIndex: 1,
  })
  assert.equal(p.blocks[blocks[0].id], 'in_progress')
  const restored = normalizeProgress(JSON.parse(JSON.stringify(p)), blocks)
  assert.equal(restored.points[points[0].id].cardIndex, 1)
  assert.equal(restored.currentCardIndex, 1)
})
test('завершение открывает следующую тему и сохраняет время', () => {
  const p = complete(initial(), points[0].id)
  assert.equal(p.points[points[0].id].completedAt, '2026-01-01')
  assert.equal(isAvailable(points[1].id, p, blocks), true)
  assert.equal(p.points[points[1].id].status, 'not_started')
  assert.equal(p.blocks[blocks[0].id], 'in_progress')
})
test('закрытую тему нельзя изменить', () => {
  const p = updatePoint(initial(), blocks, points[1].id, {
    status: 'completed',
  })
  assert.equal(p.points[points[1].id].status, 'not_started')
})
test('завершение блока и всего маршрута', () => {
  let p = initial()
  for (const [i, point] of points.entries()) {
    p = complete(p, point.id)
    if (i === 2) assert.equal(p.blocks[blocks[0].id], 'completed')
  }
  assert.equal(
    Object.values(p.blocks).every((s) => s === 'completed'),
    true,
  )
  assert.equal(
    Object.values(p.points).filter((x) => x.status === 'completed').length,
    15,
  )
})
test('повторный просмотр не сбрасывает статус', () => {
  let p = complete(initial(), points[0].id)
  p = updatePoint(p, blocks, points[0].id, { cardIndex: 1 })
  assert.equal(p.points[points[0].id].status, 'completed')
})
test('повреждённые данные безопасны, статусы блоков пересчитываются', () => {
  const p = normalizeProgress(
    {
      version: 1,
      points: { [points[0].id]: { status: 'invalid', cardIndex: 999 } },
      blocks: { [blocks[0].id]: 'completed' },
    },
    blocks,
  )
  assert.equal(p.points[points[0].id].status, 'not_started')
  assert.equal(p.blocks[blocks[0].id], 'not_started')
  assert.equal(
    normalizeProgress(null, blocks).points[points[0].id].status,
    'not_started',
  )
})
test('изменение содержимого сохраняет известные точки и удаляет старые', () => {
  const saved = complete(initial(), points[0].id)
  saved.points.removed = { status: 'completed', cardIndex: 0 }
  const restored = normalizeProgress(saved, blocks)
  assert.equal(restored.points[points[0].id].status, 'completed')
  assert.equal(restored.points.removed, undefined)
  assert.equal(restored.points[points[14].id].status, 'not_started')
})
test('сброс и неизвестная версия возвращают начальное состояние', () => {
  assert.equal(
    normalizeProgress({ version: 99 }, blocks).blocks[blocks[0].id],
    'not_started',
  )
  assert.equal(initial().currentPointId, null)
})
test('хранилище восстанавливает прогресс, обрабатывает повреждённый JSON и сбрасывается', async () => {
  const data = new Map()
  globalThis.localStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  }
  const repository = new LocalStorageProgressRepository()
  const saved = complete(initial(), points[0].id)
  await repository.saveProgress(saved)
  assert.equal(
    normalizeProgress(await repository.getProgress(), blocks).points[
      points[0].id
    ].status,
    'completed',
  )
  data.set('university-onboarding:progress:v1', '{')
  assert.equal(
    normalizeProgress(await repository.getProgress(), blocks).points[
      points[0].id
    ].status,
    'not_started',
  )
  await repository.saveProgress(saved)
  await repository.resetProgress()
  assert.equal(data.size, 0)
})
test('поздравление только при первом завершении последней темы всей программы', () => {
  let progress = initial()
  for (const point of points.slice(0, -1)) {
    progress = updatePoint(progress, blocks, point.id, {
      status: 'in_progress',
    })
    assert.equal(completesProgram(progress, blocks, point.id), false)
    progress = complete(progress, point.id)
  }
  const last = points.at(-1)
  assert.equal(completesProgram(progress, blocks, last.id), false)
  progress = updatePoint(progress, blocks, last.id, { status: 'in_progress' })
  assert.equal(completesProgram(progress, blocks, last.id), true)
  progress = complete(progress, last.id)
  assert.equal(completesProgram(progress, blocks, last.id), false)
  const restored = normalizeProgress(
    JSON.parse(JSON.stringify(progress)),
    blocks,
  )
  assert.equal(completesProgram(restored, blocks, last.id), false)
  assert.equal(
    Object.values(restored.blocks).every((status) => status === 'completed'),
    true,
  )
})
test('уровень награды соответствует первому завершению и приоритету', () => {
  let progress = initial()
  assert.equal(getCelebrationLevel(progress, blocks, points[1].id), null)
  for (const [index, point] of points.entries()) {
    progress = updatePoint(progress, blocks, point.id, {
      status: 'in_progress',
    })
    const expected =
      index === points.length - 1
        ? 'onboarding'
        : index % 3 === 2
          ? 'block'
          : 'topic'
    assert.equal(getCelebrationLevel(progress, blocks, point.id), expected)
    progress = complete(progress, point.id)
    assert.equal(getCelebrationLevel(progress, blocks, point.id), null)
  }
  const restored = normalizeProgress(
    JSON.parse(JSON.stringify(progress)),
    blocks,
  )
  assert.equal(getCelebrationLevel(restored, blocks, points.at(-1).id), null)
})
test('число кубков и интенсивность звёзд растут с уровнем', () => {
  assert.deepEqual(
    Object.values(celebrationConfig).map((value) => value.trophies),
    [1, 3, 5],
  )
  assert.ok(celebrationConfig.topic.stars < celebrationConfig.block.stars)
  assert.ok(celebrationConfig.block.stars < celebrationConfig.onboarding.stars)
})
