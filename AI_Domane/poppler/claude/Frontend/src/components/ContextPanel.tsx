import type { ContextItemType } from '../types';
import {
  ChevronDownIcon,
  FileDocIcon,
  SkillIcon,
  ChromeIcon,
  NotionLogo,
  LinearLogo,
} from './icons';
import styles from './ContextPanel.module.css';

const CONTEXT_ITEMS: ContextItemType[] = [
  { id: 'mt', icon: <FileDocIcon />, label: 'Meeting Transcripts' },
  { id: 'sk', icon: <SkillIcon />, label: 'SKILL.md' },
  { id: 'ch', icon: <ChromeIcon />, label: 'AICaffe in Chrome' },
  { id: 'no', icon: <NotionLogo />, label: 'Notion' },
  { id: 'li', icon: <LinearLogo />, label: 'Linear' },
];

const ContextPanel: React.FC = () => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Context</span>
        <ChevronDownIcon size={18} color="#78716C" />
      </div>
      <div className={styles.list}>
        {CONTEXT_ITEMS.map((item: ContextItemType) => (
          <div key={item.id} className={styles.item}>
            {item.icon}
            <span className={styles.label}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextPanel;
