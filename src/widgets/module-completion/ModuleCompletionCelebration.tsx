import { useEffect, useRef, type CSSProperties } from 'react'
import { Button } from '@mantine/core'
import { IconArrowRight, IconCheck, IconStarFilled } from '@tabler/icons-react'
import styles from './ModuleCompletionCelebration.module.css'

const stars = [
  { x: -125, y: -80, size: 22, delay: 0 },
  { x: 112, y: -90, size: 17, delay: 80 },
  { x: -148, y: -8, size: 14, delay: 140 },
  { x: 146, y: 5, size: 23, delay: 40 },
  { x: -93, y: -145, size: 16, delay: 180 },
  { x: 75, y: -150, size: 23, delay: 110 },
  { x: -165, y: -60, size: 12, delay: 220 },
  { x: 165, y: -50, size: 13, delay: 190 },
]

/** Показывает награду за впервые завершённый раздел. */
export function ModuleCompletionCelebration({
  title,
  onContinue,
}: {
  title: string
  onContinue: () => void
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus()
  }, [])
  return (
    <main className={styles.screen} aria-labelledby="module-celebration-title">
      <div className={styles.panel}>
        <div className={styles.art} aria-hidden="true">
          {stars.map((star, index) => (
            <span
              key={index}
              className={styles.star}
              style={
                {
                  '--x': `${star.x}px`,
                  '--y': `${star.y}px`,
                  '--size': `${star.size}px`,
                  '--delay': `${star.delay}ms`,
                } as CSSProperties
              }
            >
              <IconStarFilled size={star.size} aria-hidden="true" />
            </span>
          ))}
          <div className={styles.trophy}>
            <svg viewBox="0 0 128 128" fill="none" aria-hidden="true">
              <path
                d="M38 20h52v18c0 24-10 38-26 38S38 62 38 38V20Z"
                fill="#F3B940"
              />
              <path
                d="M38 28H21v9c0 18 10 27 24 27M90 28h17v9c0 18-10 27-24 27"
                stroke="#D49325"
                strokeWidth="9"
                strokeLinecap="round"
              />
              <path d="M58 76h12v16h13v12H45V92h13V76Z" fill="#D49325" />
              <path
                d="m64 31 4 9 10 1-7.5 7 2 10-8.5-5-8.5 5 2-10-7.5-7 10-1 4-9Z"
                fill="#FFF2BB"
              />
            </svg>
          </div>
        </div>
        <span className={styles.badge}>
          <IconCheck size={15} aria-hidden="true" /> РАЗДЕЛ ПРОЙДЕН · 100%
        </span>
        <h1 id="module-celebration-title" tabIndex={-1} ref={heading}>
          Модуль завершён!
        </h1>
        <p className={styles.moduleName}>{title}</p>
        <p className={styles.message}>
          Отличная работа! Ты стал ещё на шаг ближе к знакомству с МИСИС.
        </p>
        <Button size="md" radius="xl" onClick={onContinue}>
          Продолжить путь{' '}
          <IconArrowRight
            className={styles.inlineIcon}
            size={18}
            aria-hidden="true"
          />
        </Button>
      </div>
    </main>
  )
}
