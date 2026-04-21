import { useState } from 'react';
import logo from '../assets/aicaffe-logo.png';
import styles from './TopicPicker.module.css';

interface TopicPickerProps {
  userName: string;
  onContinue: (topics: string[]) => void;
}

interface Topic {
  id: string;
  label: string;
  icon: string;
}

const TOPICS: Topic[] = [
  { id: 'esg', label: 'ESG', icon: '🌱' },
  { id: 'election', label: 'Election Caffe', icon: '🗳️' },
  { id: 'workforce', label: 'Workforce Intelligence', icon: '👥' },
  { id: 'datacaffe', label: 'DataCaffe', icon: '☕' },
  { id: 'insurance', label: 'Insurance', icon: '🛡️' },
];

const TopicPicker: React.FC<TopicPickerProps> = ({ userName, onContinue }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleTopic = (id: string): void => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((t) => t !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <img src={logo} alt="AICaffe" className={styles.logo} />

        <h1 className={styles.heading}>
          What are you into, {userName}? Pick three topics to explore.
        </h1>

        <div className={styles.topicGrid}>
          {TOPICS.map((topic) => (
            <button
              key={topic.id}
              className={`${styles.topicBtn} ${selected.includes(topic.id) ? styles.topicSelected : ''}`}
              onClick={() => toggleTopic(topic.id)}
            >
              <span className={styles.topicIcon}>{topic.icon}</span>
              <span>{topic.label}</span>
            </button>
          ))}
        </div>

        <p className={styles.hint}>
          {selected.length === 0 && 'Select at least 1 topic'}
          {selected.length > 0 && selected.length < 3 && `${selected.length}/3 selected`}
          {selected.length === 3 && '3/3 selected'}
        </p>

        <button
          className={`${styles.goBtn} ${selected.length === 0 ? styles.goBtnDisabled : ''}`}
          onClick={() => onContinue(selected)}
          disabled={selected.length === 0}
        >
          Let's go
        </button>
      </div>
    </div>
  );
};

export default TopicPicker;
