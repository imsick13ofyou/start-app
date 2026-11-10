import type { CSSProperties } from 'react'
import { IconStarFilled } from '@tabler/icons-react'
import type { CelebrationLevel } from '../../types/celebration'
import { celebrationConfig } from './config'
import styles from './CelebrationArt.module.css'

/** Показывает кубки и звёзды с интенсивностью по уровню достижения. */
export function CelebrationArt({ level }: { level: CelebrationLevel }) {
  const { trophies, stars } = celebrationConfig[level]
  return (
    <div className={`${styles.art} ${styles[level]}`} aria-hidden="true">
      {Array.from({ length: stars }, (_, index) => {
        const angle = ((index % 12) * Math.PI) / 6
        const wave = Math.floor(index / 12)
        return (
          <span
            key={index}
            className={styles.star}
            style={
              {
                '--x': `${Math.round(Math.cos(angle) * (85 + (index % 3) * 28))}px`,
                '--y': `${Math.round(Math.sin(angle) * 45 - 65 - wave * 15)}px`,
                '--delay': `${(index % 6) * 60 + wave * 480}ms`,
              } as CSSProperties
            }
          >
            <IconStarFilled size={12 + (index % 3) * 4} />
          </span>
        )
      })}
      <div className={styles.trophies}>
        {Array.from({ length: trophies }, (_, index) => (
          <div
            key={index}
            className={styles.trophy}
            style={{ '--delay': `${index * 130}ms` } as CSSProperties}
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
  )
}
