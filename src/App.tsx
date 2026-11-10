import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import {
  ActionIcon,
  Alert,
  Button,
  Progress,
  Radio,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core'
import { Link, Outlet, useNavigate, useParams } from '@tanstack/react-router'
import { blocks } from './entities/onboarding/content'
import {
  completesBlock,
  isAvailable,
  orderedPoints,
} from './entities/onboarding/model'
import { ModuleCompletionCelebration } from './widgets/module-completion/ModuleCompletionCelebration'
import { useProgress } from './app/progress'
import styles from './App.module.css'
const points = orderedPoints(blocks)
const labels = {
  not_started: 'Не начато',
  in_progress: 'В процессе',
  completed: 'Пройдено',
}
function countDone(progress: ReturnType<typeof useProgress>['progress']) {
  return points.filter((p) => progress.points[p.id]?.status === 'completed')
    .length
}
function Bar({ value, label }: { value: number; label: string }) {
  return <Progress value={value} size="sm" radius="xl" aria-label={label} />
}
function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme()
  const scheme = useComputedColorScheme('light')
  const dark = scheme === 'dark'
  return (
    <ActionIcon
      className={styles.themeToggle}
      variant="default"
      size="lg"
      radius="xl"
      onClick={() => setColorScheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      title={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}
    >
      {dark ? '☀' : '☾'}
    </ActionIcon>
  )
}
/** Общая оболочка и навигация. */
export function Layout() {
  const { progress, loading, error } = useProgress()
  const done = countDone(progress)
  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand}>
            <span className={styles.brandMark}>✳</span>
            <span>
              старт <span className={styles.brandAccent}>в вузе</span>
              <small>твой гид по университету</small>
            </span>
          </Link>
          <nav className={styles.nav} aria-label="Основная навигация">
            <Link to="/roadmap">Маршрут</Link>
            <Link to="/reference">Справочник</Link>
          </nav>
          <ThemeToggle />
          <div className={styles.headerProgress}>
            <div>
              <span>ТВОЙ ПРОГРЕСС</span>
              <strong>
                {done} <em>/ {points.length}</em>
              </strong>
            </div>
            <Bar
              value={(done / points.length) * 100}
              label={`Пройдено ${done} из ${points.length} тем`}
            />
          </div>
        </div>
      </header>
      {error && (
        <Alert title="Не удалось сохранить прогресс">
          Продолжать можно, но изменения могут не сохраниться после закрытия
          страницы.
        </Alert>
      )}
      {loading ? (
        <main className={styles.loading}>Загружаем твой маршрут…</main>
      ) : (
        <div className={styles.routeContent}>
          <Outlet />
        </div>
      )}
      <footer className={styles.footer}>
        Учебный прототип · Не является официальным сервисом НИТУ МИСИС
      </footer>
    </>
  )
}
/** Экран знакомства с приложением. */
export function Welcome() {
  const { progress } = useProgress()
  const started = points.some(
    (p) => progress.points[p.id]?.status !== 'not_started',
  )
  const done = countDone(progress)
  return (
    <main className={styles.welcome}>
      <div className={styles.welcomeCopy}>
        <span className={styles.eyebrow}>✦ ТВОЙ ПЕРВЫЙ ШАГ В МИСИС</span>
        <h1>
          В университете
          <br />
          <span>всё получится.</span>
        </h1>
        <p>
          Новый этап начинается здесь. Разберёмся вместе, как устроен
          университет и где найти всё важное.
        </p>
        <div className={styles.welcomeActions}>
          <Button component={Link} to="/roadmap" size="lg" radius="xl">
            {started ? 'Продолжить маршрут' : 'Начать знакомство'} &nbsp; →
          </Button>
          <span>15 тем · в своём темпе</span>
        </div>
        <div className={styles.welcomeNote}>
          <span>✳</span>
          <p>
            <strong>Не нужно запоминать всё сразу.</strong>
            <br />
            Пройденные темы всегда будут под рукой.
          </p>
        </div>
      </div>
      <div className={styles.heroArt} aria-hidden="true">
        <div className={styles.orbitOne} />
        <div className={styles.orbitTwo} />
        <div className={styles.heroCard}>
          <div className={styles.heroCardTop}>
            ТВОЙ МАРШРУТ <span>✦</span>
          </div>
          <div className={styles.heroDots}>
            <i>✓</i>
            <i>✦</i>
            <i>♡</i>
          </div>
          <strong>
            Всё начинается
            <br />с первого шага
          </strong>
          <small>{done} из 15 тем пройдено</small>
          <Bar value={(done / 15) * 100} label="Прогресс" />
        </div>
        <div className={styles.floatStar}>✳</div>
        <div className={styles.floatBadge}>
          ✦<br />
          <small>
            новый
            <br />
            этап
          </small>
        </div>
      </div>
    </main>
  )
}
/** Последовательный маршрут по темам. */
export function Roadmap() {
  const { progress, reset } = useProgress()
  const done = countDone(progress)
  const current = points.find(
    (p) => progress.points[p.id].status !== 'completed',
  )
  return (
    <main className={styles.page}>
      <div className={styles.intro}>
        <div>
          <span className={styles.eyebrow}>ТВОЙ ПУТЕВОДИТЕЛЬ</span>
          <h1>
            Шаг за шагом <span>к своему</span>
          </h1>
          <p>
            Знакомься с университетом в удобном темпе. Каждая тема — маленький
            шаг к большой уверенности.
          </p>
        </div>
        <div className={styles.summary}>
          <span>ОБЩИЙ ПРОГРЕСС</span>
          <strong>
            {Math.round((done / points.length) * 100)}
            <small>%</small>
          </strong>
          <Bar value={(done / points.length) * 100} label="Общий прогресс" />
          <p>
            {done} из {points.length} тем пройдено
          </p>
        </div>
      </div>
      {done === points.length && (
        <div className={styles.roadmapComplete}>
          <Button component={Link} to="/completion" radius="xl">
            Посмотреть итоги маршрута →
          </Button>
        </div>
      )}
      <div className={styles.roadmapLayout}>
        <div className={styles.path}>
          {blocks.map((block, bi) => {
            const completed = block.points.filter(
              (p) => progress.points[p.id].status === 'completed',
            ).length
            return (
              <section
                key={block.id}
                id={`block-${block.id}`}
                className={styles.block}
              >
                <div className={`${styles.blockHeader} ${styles[block.theme]}`}>
                  <div className={styles.blockIcon}>{block.icon}</div>
                  <div>
                    <span>
                      РАЗДЕЛ 0{bi + 1} · {completed} / {block.points.length}
                    </span>
                    <h2>{block.title}</h2>
                    <p>{block.description}</p>
                  </div>
                  <div
                    className={styles.blockCount}
                    aria-label={`Пройдено ${completed} из ${block.points.length} тем`}
                  >
                    {completed === 3 ? '✓' : `${completed}/3`}
                  </div>
                </div>
                <div className={styles.blockProgress} aria-hidden="true">
                  <span
                    style={{
                      width: `${(completed / block.points.length) * 100}%`,
                    }}
                  />
                </div>
                <div className={styles.nodes}>
                  {block.points.map((point, i) => {
                    const status = progress.points[point.id].status
                    const available = isAvailable(point.id, progress, blocks)
                    return (
                      <div
                        className={`${styles.nodeRow} ${i === 1 ? styles.offset : ''}`}
                        key={point.id}
                      >
                        <div className={styles.nodeConnector} />
                        {available ? (
                          <Link
                            to="/lesson/$pointId"
                            params={{ pointId: point.id }}
                            className={`${styles.node} ${status === 'completed' ? styles.nodeDone : status === 'in_progress' ? styles.nodeInProgress : styles.nodeActive}`}
                            aria-label={`${point.title}: ${labels[status]}`}
                          >
                            {status === 'completed' ? '✓' : i + 1}
                          </Link>
                        ) : (
                          <span
                            className={`${styles.node} ${styles.nodeLocked}`}
                            aria-label={`${point.title}: недоступно`}
                          >
                            ?
                          </span>
                        )}
                        <div className={styles.nodeText}>
                          <span>
                            {!available
                              ? 'ЗАКРЫТО'
                              : status === 'in_progress'
                                ? 'ПРОДОЛЖИТЬ'
                                : status === 'completed'
                                  ? 'ПРОЙДЕНО'
                                  : 'СЛЕДУЮЩИЙ ШАГ'}
                          </span>
                          <h3>{point.title}</h3>
                          <p>{point.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>
            <div className={styles.sideIcon}>✦</div>
            <h3>Всё получится!</h3>
            <p>
              Двигайся постепенно — каждая открытая тема останется в
              справочнике.
            </p>
            {current ? (
              <Link
                to="/lesson/$pointId"
                params={{ pointId: current.id }}
                className={styles.sideLink}
              >
                Продолжить →
              </Link>
            ) : (
              <Button component={Link} to="/completion" fullWidth radius="xl">
                Итоги маршрута →
              </Button>
            )}
          </div>
          <div className={styles.sideHint}>
            <strong>✳ &nbsp;Полезно знать</strong>
            <p>
              Ссылки ведут на официальный сайт университета. Проверяй там
              актуальные условия.
            </p>
          </div>
          <button
            className={styles.reset}
            onClick={() => {
              if (
                window.confirm(
                  'Начать маршрут заново? Сохранённый прогресс будет удалён.',
                )
              )
                reset()
            }}
          >
            Сбросить прогресс
          </button>
        </aside>
      </div>
    </main>
  )
}
/** Пошаговый просмотр темы и сохранение позиции. */
export function Lesson() {
  const { pointId } = useParams({ strict: false })
  const { progress, update } = useProgress()
  const navigate = useNavigate()
  const point = points.find((p) => p.id === pointId)
  const available = point ? isAvailable(point.id, progress, blocks) : false
  const saved = point ? progress.points[point.id] : undefined
  const [choice, setChoice] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)
  const [moduleFinished, setModuleFinished] = useState(false)
  useEffect(() => {
    if (point && available && saved?.status === 'not_started')
      update(point.id, { status: 'in_progress' })
  }, [point, available, saved?.status, update])
  if (!point || !saved || !available)
    return (
      <main className={styles.empty}>
        <h1>{point ? 'Эта тема пока закрыта' : 'Тема не найдена'}</h1>
        <p>
          {point
            ? 'Сначала пройди предыдущие шаги маршрута.'
            : 'Проверь адрес или вернись к маршруту.'}
        </p>
        <Button component={Link} to="/roadmap" radius="xl">
          К маршруту
        </Button>
      </main>
    )
  const block = blocks.find((b) => b.id === point.blockId)!
  const index = saved.cardIndex
  const card = point.cards[index]
  const pointIndex = points.indexOf(point)
  const next = points[pointIndex + 1]
  const move = (cardIndex: number) => {
    setChoice(null)
    update(point.id, { cardIndex })
  }
  if (moduleFinished)
    return (
      <ModuleCompletionCelebration
        title={block.title}
        onContinue={() => {
          void navigate({ to: '/roadmap', hash: `block-${block.id}` })
        }}
      />
    )
  if (finished)
    return (
      <main className={styles.empty}>
        <div className={styles.celebrate}>✦</div>
        <span className={styles.eyebrow}>ЕЩЁ ОДИН ШАГ</span>
        <h1>Тема пройдена!</h1>
        <p>Ты всегда можешь вернуться к ней в справочнике.</p>
        <div className={styles.actions}>
          <Button component={Link} to="/roadmap" variant="light" radius="xl">
            К маршруту
          </Button>
          {next ? (
            <Button
              onClick={() => {
                setFinished(false)
                void navigate({ to: '/lesson/' + next.id })
              }}
              radius="xl"
            >
              Следующая тема →
            </Button>
          ) : (
            <Button component={Link} to="/completion" radius="xl">
              Завершить маршрут →
            </Button>
          )}
        </div>
      </main>
    )
  return (
    <main className={styles.lesson}>
      <Link to="/roadmap" className={styles.back}>
        ← &nbsp; К маршруту
      </Link>
      <div className={styles.lessonTop}>
        <span>
          {block.title} · ТЕМА {pointIndex + 1} ИЗ {points.length}
        </span>
        <span>
          {index + 1} / {point.cards.length}
        </span>
      </div>
      <Bar
        value={((index + 1) / point.cards.length) * 100}
        label={`Карточка ${index + 1} из ${point.cards.length}`}
      />
      <div className={styles.lessonTitle}>
        <span className={styles.lessonIcon}>{block.icon}</span>
        <div>
          <span className={styles.eyebrow}>
            {saved.status === 'completed' ? 'ПОВТОРЕНИЕ ТЕМЫ' : 'ЗНАКОМИМСЯ'}
          </span>
          <h1>{point.title}</h1>
        </div>
      </div>
      <article className={styles.lessonCard}>
        <span className={styles.cardNumber}>
          0{index + 1} / 0{point.cards.length}
        </span>
        <h2>{card.title}</h2>
        {card.type === 'text' && <p>{card.text}</p>}
        {card.type === 'steps' && (
          <ol>
            {card.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
        {card.type === 'choice' && (
          <>
            <Radio.Group
              value={choice}
              onChange={setChoice}
              aria-label={card.title}
            >
              <div className={styles.options}>
                {card.options.map((option, i) => (
                  <Radio value={String(i)} label={option} key={option} />
                ))}
              </div>
            </Radio.Group>
            {choice !== null && (
              <Alert mt="lg">
                {Number(choice) === card.answer
                  ? 'Верно! '
                  : 'Хорошая попытка. '}
                {card.explanation}
              </Alert>
            )}
          </>
        )}
        <div className={styles.source}>
          <span>↗</span>
          <div>
            <strong>Проверь на официальном сайте</strong>
            <p>Актуальные подробности и условия — у университета.</p>
            {point.sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
              >
                {source.title} ↗
              </a>
            ))}
          </div>
        </div>
      </article>
      <div className={styles.lessonActions}>
        <Button
          variant="subtle"
          radius="xl"
          disabled={index === 0}
          onClick={() => move(index - 1)}
        >
          ← Назад
        </Button>
        {index < point.cards.length - 1 ? (
          <Button radius="xl" size="md" onClick={() => move(index + 1)}>
            Продолжить →
          </Button>
        ) : (
          <Button
            radius="xl"
            size="md"
            onClick={() => {
              const moduleComplete = completesBlock(progress, blocks, point.id)
              const finish = () => {
                update(point.id, {
                  status: 'completed',
                  completedAt: saved.completedAt ?? new Date().toISOString(),
                })
                if (moduleComplete) setModuleFinished(true)
                else setFinished(true)
              }
              if (
                moduleComplete &&
                document.startViewTransition &&
                !window.matchMedia('(prefers-reduced-motion: reduce)').matches
              )
                document.startViewTransition(() => flushSync(finish))
              else finish()
            }}
          >
            Завершить тему ✓
          </Button>
        )}
      </div>
    </main>
  )
}
/** Итоговый экран завершённого маршрута. */
export function Completion() {
  const { progress } = useProgress()
  const done = countDone(progress)
  if (done !== points.length)
    return (
      <main className={styles.empty}>
        <h1>Всё ещё впереди!</h1>
        <p>Заверши все темы, чтобы закончить маршрут.</p>
        <Button component={Link} to="/roadmap">
          К маршруту
        </Button>
      </main>
    )
  return (
    <main className={styles.empty}>
      <div className={styles.celebrate}>✳</div>
      <span className={styles.eyebrow}>МАРШРУТ ЗАВЕРШЁН · 100%</span>
      <h1>Поздравляем!</h1>
      <p>
        Ты познакомился с основной экосистемой университета. Возвращайся в любой
        момент, если понадобится вспомнить, где найти информацию или куда
        обратиться.
      </p>
      <strong>
        {done} из {points.length} тем пройдено
      </strong>
      <div className={styles.actions}>
        <Button component={Link} to="/roadmap" variant="light" radius="xl">
          Посмотреть маршрут
        </Button>
        <Button component={Link} to="/reference" radius="xl">
          Открыть справочник →
        </Button>
      </div>
    </main>
  )
}
/** Справочник ранее открытых тем. */
export function Reference() {
  const { progress } = useProgress()
  const opened = points.filter(
    (p) => progress.points[p.id].status !== 'not_started',
  )
  return (
    <main className={styles.reference}>
      <span className={styles.eyebrow}>ВСЁ В ОДНОМ МЕСТЕ</span>
      <h1>Твой справочник</h1>
      <p>Возвращайся к открытым темам и нужным ссылкам в любой момент.</p>
      {opened.length === 0 ? (
        <div className={styles.refEmpty}>
          <h2>Здесь пока пусто</h2>
          <p>Открой первую тему, и она появится в справочнике.</p>
          <Button component={Link} to="/roadmap" radius="xl">
            К маршруту
          </Button>
        </div>
      ) : (
        blocks.map((block) => {
          const items = block.points.filter(
            (p) => progress.points[p.id].status !== 'not_started',
          )
          return items.length ? (
            <section key={block.id} className={styles.refSection}>
              <h2>
                <span>{block.icon}</span> {block.title}
              </h2>
              {items.map((point) => (
                <div className={styles.refItem} key={point.id}>
                  <div>
                    <Link to="/lesson/$pointId" params={{ pointId: point.id }}>
                      {point.title} →
                    </Link>
                    <p>
                      {point.description} ·{' '}
                      {labels[progress.points[point.id].status]}
                    </p>
                  </div>
                  <a
                    href={point.sources[0].url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Официальный источник: ${point.title}`}
                  >
                    Источник ↗
                  </a>
                </div>
              ))}
            </section>
          ) : null
        })
      )}
    </main>
  )
}
/** Страница неизвестного маршрута. */
export function NotFound() {
  return (
    <main className={styles.empty}>
      <h1>Страница не найдена</h1>
      <p>Кажется, такой страницы нет. Вернёмся к маршруту?</p>
      <Button component={Link} to="/roadmap">
        К маршруту
      </Button>
    </main>
  )
}
