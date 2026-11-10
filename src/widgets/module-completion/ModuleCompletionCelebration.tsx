import { useEffect, useRef } from 'react'
import { Button } from '@mantine/core'
import { IconArrowRight, IconCheck } from '@tabler/icons-react'
import { CelebrationArt } from '../../shared/ui/celebration/CelebrationArt'
import styles from './ModuleCompletionCelebration.module.css'

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
        <CelebrationArt level="block" />
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
