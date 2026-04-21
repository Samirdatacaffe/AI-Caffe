import type { ProgressStepType } from '../types';
import styles from './ProgressPanel.module.css';

const STEPS: ProgressStepType[] = [
  { step: 1, label: 'Read meeting transcripts' },
  { step: 2, label: 'Pull out key points' },
  { step: 3, label: 'Find action items' },
  { step: 4, label: 'Check Google Calendar' },
  { step: 5, label: 'Build standup deck' },
  { step: 6, label: 'Write summary' },
];

const ProgressPanel: React.FC = () => {
  return (
    <div className={styles.card}>
      <div className={styles.title}>Progress</div>
      <div className={styles.steps}>
        {STEPS.map((s: ProgressStepType) => (
          <div key={s.step} className={styles.stepItem}>
            <div className={styles.stepNumber}>{s.step}</div>
            <span className={styles.stepText}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressPanel;
