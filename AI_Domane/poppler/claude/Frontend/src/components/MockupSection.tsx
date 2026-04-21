import { useState } from 'react';
import CoworkPanel from './CoworkPanel';
import ProgressPanel from './ProgressPanel';
import ContextPanel from './ContextPanel';
import ChatPanel from './ChatPanel';
import styles from './MockupSection.module.css';

type TabType = 'chat' | 'cowork';

const MockupSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('cowork');

  return (
    <div className={styles.wrapper}>
      {/* Grid Background */}
      <div className={styles.gridBg} />

      {activeTab === 'chat' ? (
        /* ---- Chat View ---- */
        <div className={`${styles.chatCard} ${styles.fadeIn}`} key="chat">
          <div className={styles.tabWrapper}>
            <div className={styles.tabContainer}>
              <button className={styles.tabActive}>Chat</button>
              <button className={styles.tab} onClick={() => setActiveTab('cowork')}>Cowork</button>
            </div>
          </div>
          <ChatPanel />
        </div>
      ) : (
        /* ---- Cowork View ---- */
        <>
          <div className={`${styles.cowork} ${styles.slideUp}`} key="cowork">
            <CoworkPanel onTabChange={() => setActiveTab('chat')} />
          </div>
          <div className={`${styles.progress} ${styles.slideUpDelay1}`}>
            <ProgressPanel />
          </div>
          <div className={`${styles.context} ${styles.slideUpDelay2}`}>
            <ContextPanel />
          </div>
        </>
      )}
    </div>
  );
};

export default MockupSection;
