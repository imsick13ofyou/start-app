import type { CSSProperties } from 'react'
import { Button, Modal } from '@mantine/core'
import { IconStarFilled } from '@tabler/icons-react'
import styles from './ProgramCompletionModal.module.css'

const trophies = [0, 1, 2]
const stars = [
  { x: -130, y: -75, size: 15, delay: 150 },
  { x: -90, y: -115, size: 21, delay: 250 },
  { x: -155, y: -20, size: 13, delay: 300 },
  { x: -35, y: -120, size: 13, delay: 100 },
  { x: 55, y: -120, size: 18, delay: 200 },
  { x: 115, y: -90, size: 15, delay: 100 },
  { x: 155, y: -25, size: 22, delay: 280 },
  { x: 95, y: -35, size: 12, delay: 350 },
]

/** Поздравляет с завершением всей программы и предлагает дальнейшую навигацию. */
export function ProgramCompletionModal({
  opened,
  onClose,
  onReference,
  onRoadmap,
}: {
  opened: boolean
  onClose: () => void
  onReference: () => void
  onRoadmap: () => void
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="xl"
      size="lg"
      title="Завершение программы"
      closeButtonProps={{ 'aria-label': 'Закрыть поздравление' }}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      transitionProps={{ transition: 'fade', duration: 250 }}
      classNames={{
        content: styles.content,
        header: styles.header,
        body: styles.body,
      }}
    >
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
        <div className={styles.trophies}>
          {trophies.map((trophy) => (
            <div
              key={trophy}
              className={styles.trophy}
              style={{ '--delay': `${trophy * 130}ms` } as CSSProperties}
            >
              <svg viewBox="0 0 128 128" fill="none">
                <path
                  d="M38 28H21v9c0 18 10 27 24 27M90 28h17v9c0 18-10 27-24 27"
                  stroke="#D49325"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                <path
                  d="M38 20h52v18c0 24-10 38-26 38S38 62 38 38V20Z"
                  fill="#F3B940"
                />
                <path d="M58 76h12v16h13v12H45V92h13V76Z" fill="#D49325" />
                <path
                  d="m64 31 4 9 10 1-7.5 7 2 10-8.5-5-8.5 5 2-10-7.5-7 10-1 4-9Z"
                  fill="#FFF2BB"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.message}>
        <h2>Поздравляем!</h2>
        <p className={styles.lead}>
          Ты успешно завершил обучение и познакомился с экосистемой
          университета!
        </p>
        <p className={styles.reminder}>
          Вся изученная информация всегда доступна в разделе «Справочник».
          Возвращайся в любое время, если захочешь что-то вспомнить.
        </p>
        <div className={styles.actions}>
          <Button size="md" radius="xl" onClick={onReference}>
            Перейти в справочник
          </Button>
          <Button size="md" variant="light" radius="xl" onClick={onRoadmap}>
            Вернуться к карте
          </Button>
        </div>
      </div>
    </Modal>
  )
}
