import { Button, Modal } from '@mantine/core'
import { CelebrationArt } from '../../shared/ui/celebration/CelebrationArt'
import styles from './ProgramCompletionModal.module.css'

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
      <CelebrationArt level="onboarding" />
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
