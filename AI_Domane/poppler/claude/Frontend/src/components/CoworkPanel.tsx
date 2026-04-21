import type { FolderItemType } from '../types';
import { SearchIcon, FolderSvg } from './icons';
import styles from './CoworkPanel.module.css';

interface CoworkPanelProps {
  onTabChange?: () => void;
}

const FOLDERS: FolderItemType[] = [
  { id: '1', name: 'Analysis' },
  { id: '2', name: 'Meeting Transcripts' },
  { id: '3', name: 'Quarterly Reports' },
  { id: '4', name: 'Expenses' },
];

const CoworkPanel: React.FC<CoworkPanelProps> = ({ onTabChange }) => {
  return (
    <div className={styles.card}>
      {/* Tab Switcher */}
      <div className={styles.tabWrapper}>
        <div className={styles.tabContainer}>
          <button className={styles.tab} onClick={onTabChange}>Chat</button>
          <button className={styles.tabActive}>Cowork</button>
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <SearchIcon />
        <span className={styles.searchText}>Search</span>
      </div>

      {/* Folder Grid */}
      <div className={styles.folderGrid}>
        {FOLDERS.map((folder: FolderItemType) => (
          <div key={folder.id} className={styles.folderItem}>
            <FolderSvg />
            <span className={styles.folderName}>{folder.name}</span>
          </div>
        ))}
      </div>

      {/* Cancel */}
      <div className={styles.cancelRow}>
        <button className={styles.cancelBtn}>Cancel</button>
      </div>
    </div>
  );
};

export default CoworkPanel;
