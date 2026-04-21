import { useState, useEffect, useRef } from 'react';
import styles from './ChatPanel.module.css';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  searchLabel?: string;
}

const MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    text: 'How should I structure this project proposal?',
  },
  {
    id: '2',
    role: 'assistant',
    text: "I'd go with: Problem \u2192 Solution \u2192 Timeline \u2192 Ask. Keep it tight \u2014 one page max. The trick is making the problem feel urgent before you pitch the fix.",
  },
  {
    id: '3',
    role: 'user',
    text: 'Can you find some examples of successful proposals in our industry?',
  },
  {
    id: '4',
    role: 'assistant',
    text: 'I found a few strong examples. The best ones all lead with a sharp metric \u2014 like "We\'re losing 12 hours/week to manual reporting." Then they tie it to a dollar figure before pitching the fix.',
    searchLabel: 'Searched 3 sites',
  },
];

import aicaffeLogo from '../assets/aicaffe-logo.png';

// Streams text character by character
const StreamingText: React.FC<{ text: string; speed?: number; onDone?: () => void }> = ({ text, speed = 18, onDone }) => {
  const [displayed, setDisplayed] = useState('');
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed('');
    const timer = setInterval(() => {
      idx.current++;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) {
        clearInterval(timer);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, onDone]);

  return (
    <>
      {displayed}
      {displayed.length < text.length && <span className={styles.streamCursor} />}
    </>
  );
};

const ChatPanel: React.FC = () => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [streamingIdx, setStreamingIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Start revealing messages one by one
    if (visibleCount === 0) {
      timerRef.current = setTimeout(() => {
        setVisibleCount(1);
        setStreamingIdx(0);
      }, 400);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleMessageDone = () => {
    const nextIdx = visibleCount;
    if (nextIdx < MESSAGES.length) {
      // Delay before showing next message
      const delay = MESSAGES[nextIdx]?.role === 'user' ? 600 : 300;
      timerRef.current = setTimeout(() => {
        setVisibleCount((c) => c + 1);
        setStreamingIdx(nextIdx);
      }, delay);
    }
  };

  // Loop: restart after all messages are shown + a pause
  useEffect(() => {
    if (visibleCount > MESSAGES.length) {
      timerRef.current = setTimeout(() => {
        setVisibleCount(0);
        setStreamingIdx(0);
        // Restart
        setTimeout(() => {
          setVisibleCount(1);
          setStreamingIdx(0);
        }, 500);
      }, 3000);
    }
  }, [visibleCount]);

  return (
    <div className={styles.chatArea}>
      {MESSAGES.slice(0, visibleCount).map((msg: ChatMessage, i: number) => (
        <div key={msg.id} className={styles.msgFadeIn}>
          {msg.role === 'user' ? (
            <div className={styles.userRow}>
              <div className={styles.userBubble}>
                {i === streamingIdx ? (
                  <StreamingText text={msg.text} speed={22} onDone={handleMessageDone} />
                ) : msg.text}
              </div>
            </div>
          ) : (
            <div className={styles.assistantRow}>
              {msg.searchLabel && (
                <div className={`${styles.searchLabel} ${i === streamingIdx ? styles.searchLabelFade : ''}`}>
                  {msg.searchLabel}
                  <span className={styles.searchChevron}>&gt;</span>
                </div>
              )}
              <div className={styles.assistantText}>
                {i === streamingIdx ? (
                  <StreamingText text={msg.text} speed={18} onDone={handleMessageDone} />
                ) : msg.text}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Typing sparkle — shows while streaming an assistant message */}
      {visibleCount <= MESSAGES.length && (
        <div className={styles.typingIndicator}>
          <img src={aicaffeLogo} alt="AICaffe" className={styles.typingLogo} />
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
