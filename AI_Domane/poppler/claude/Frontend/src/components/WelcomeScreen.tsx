import { useEffect, useState } from 'react';
import logo from '../assets/aicaffe-logo.png';
import styles from './WelcomeScreen.module.css';

interface WelcomeScreenProps {
  onContinue: () => void;
}

const AI_MODELS = [
  { name: 'AICaffe Opus 4.6', icon: '✦' },
  { name: 'GPT-4o', icon: '◆' },
  { name: 'Gemini 2.5 Pro', icon: '◇' },
  { name: 'LLaMA 4', icon: '▣' },
  { name: 'Mistral Large', icon: '✧' },
  { name: 'DeepSeek R1', icon: '⬡' },
  { name: 'AICaffe Sonnet 4.6', icon: '✦' },
  { name: 'Ollama', icon: '●' },
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${styles.screen} ${visible ? styles.screenVisible : ''}`}>
      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logoWrapper}>
          <img src={logo} alt="AICaffe" className={styles.logo} />
        </div>

        {/* Heading */}
        <h1 className={styles.heading}>
          Get the most accurate answers<br />
          from all of the top AI models
        </h1>

        {/* Subtitle */}
        <p className={styles.subtitle}>
          AICaffe connects you to the best AI models and cites its sources —<br />
          so you can trust what you read.
        </p>

        {/* Scrolling AI Model Ticker */}
        <div className={styles.tickerWrapper}>
          <div className={styles.tickerFadeLeft} />
          <div className={styles.tickerTrack}>
            <div className={styles.tickerSlide}>
              {[...AI_MODELS, ...AI_MODELS].map((model, i) => (
                <span key={i} className={styles.modelTag}>
                  <span className={styles.modelIcon}>{model.icon}</span>
                  {model.name}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.tickerFadeRight} />
        </div>

        {/* Continue Button */}
        <button className={styles.continueBtn} onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
