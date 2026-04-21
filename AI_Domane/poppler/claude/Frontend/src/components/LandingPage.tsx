import { useRef, useCallback, useEffect, useState } from 'react';
import logo from '../assets/aicaffe-logo.png';
import styles from './LandingPage.module.css';

interface LandingPageProps {
  onSignUp: () => void;
  onSignIn: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSignUp, onSignIn }) => {
  const chipSceneRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const scene = chipSceneRef.current;
    if (!scene) return;
    const rect = scene.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = ((e.clientY - centerY) / (rect.height / 2)) * -12;
    const y = ((e.clientX - centerX) / (rect.width / 2)) * 12;
    setTilt({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  useEffect(() => {
    const scene = chipSceneRef.current;
    if (!scene) return;
    scene.addEventListener('mousemove', handleMouseMove);
    scene.addEventListener('mouseleave', handleMouseLeave);
    scene.addEventListener('mouseenter', handleMouseEnter);
    return () => {
      scene.removeEventListener('mousemove', handleMouseMove);
      scene.removeEventListener('mouseleave', handleMouseLeave);
      scene.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [handleMouseMove, handleMouseLeave, handleMouseEnter]);

  return (
    <div className={styles.page}>
      {/* ==================== NAVBAR ==================== */}
      <nav className={styles.navbar}>
        <div className={styles.brandWrap}>
          <img src={logo} alt="AICaffe" className={styles.logo} />
          <span className={styles.brandName}>AICaffe</span>
        </div>

        <div className={styles.navCenter}>
          <a href="#home" className={`${styles.navLink} ${styles.navLinkActive}`}>Home</a>
          <a href="#about" className={styles.navLink}>About Us</a>
          <a href="#services" className={styles.navLink}>Services</a>
          <a href="#contact" className={styles.navLink}>Contact</a>
        </div>

        <div className={styles.navRight}>
          <button className={styles.navSignUpBtn} onClick={onSignUp}>SIGN UP</button>
          <button className={styles.navSignInBtn} onClick={onSignIn}>SIGN IN</button>
        </div>
      </nav>

      {/* ==================== HERO ==================== */}
      <main className={styles.hero}>
        <div className={styles.heroLeft}>
          <h1 className={styles.titleBlock}>
            <span className={styles.titleLine1}>Artificial</span>
            <span className={styles.titleLine2}>Intelligence</span>
          </h1>

          <p className={styles.description}>
            Discover the power of artificial intelligence with our cutting-edge platform.
            Build smarter solutions, automate workflows, and unlock insights that drive real results.
          </p>

          {/* What is AICaffe */}
          <div className={styles.whatSection}>
            <h2 className={styles.whatTitle}>
              <span className={styles.typeWriter}>What is AICaffe?</span>
              <span className={styles.cursor}>|</span>
            </h2>
            <p className={styles.whatText}>
              AICaffe is a <strong>multi-domain AI platform</strong> with a proprietary intelligence layer that transforms any base AI model into a domain expert. The intelligence layer is model-agnostic — it works with <strong>Ollama</strong>, <strong>GPT</strong>, <strong>Claude</strong>, <strong>Gemini</strong>, or any future model.
            </p>
          </div>

        </div>

        <div className={styles.heroRight}>
          {/* Animated AI Chip */}
          <div
            className={`${styles.chipScene} ${isHovered ? styles.chipSceneHovered : ''}`}
            ref={chipSceneRef}
            style={{
              transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            }}
          >
            {/* Orbiting ring */}
            <div className={styles.orbitRing}>
              <div className={styles.orbitDot} />
              <div className={styles.orbitDot} style={{ animationDelay: '-2s' }} />
              <div className={styles.orbitDot} style={{ animationDelay: '-4s' }} />
            </div>

            {/* Energy rings */}
            <div className={styles.energyRing} />
            <div className={styles.energyRing} style={{ animationDelay: '1.5s' }} />
            <div className={styles.energyRing} style={{ animationDelay: '3s' }} />

            {/* Circuit traces behind the chip */}
            <svg className={styles.circuitTraces} viewBox="0 0 400 400">
              {/* Trace paths */}
              <path d="M200 40 L200 10 L320 10 L320 60" stroke="#b0bec5" strokeWidth="1.5" fill="none" className={styles.tracePath} />
              <path d="M340 120 L380 120 L380 200" stroke="#b0bec5" strokeWidth="1.5" fill="none" className={styles.tracePath} style={{animationDelay: '0.3s'}} />
              <path d="M340 200 L370 200 L370 300 L340 300" stroke="#b0bec5" strokeWidth="1.5" fill="none" className={styles.tracePath} style={{animationDelay: '0.6s'}} />
              <path d="M200 340 L200 370 L100 370 L100 320" stroke="#b0bec5" strokeWidth="1.5" fill="none" className={styles.tracePath} style={{animationDelay: '0.9s'}} />
              <path d="M60 200 L30 200 L30 100 L80 100" stroke="#b0bec5" strokeWidth="1.5" fill="none" className={styles.tracePath} style={{animationDelay: '1.2s'}} />
              <path d="M60 150 L20 150 L20 250" stroke="#b0bec5" strokeWidth="1.5" fill="none" className={styles.tracePath} style={{animationDelay: '0.5s'}} />
              {/* New extended traces */}
              <path d="M280 40 L280 20 L360 20 L360 80" stroke="#90a4ae" strokeWidth="1" fill="none" className={styles.tracePath} style={{animationDelay: '0.8s'}} />
              <path d="M120 40 L120 15 L40 15 L40 80" stroke="#90a4ae" strokeWidth="1" fill="none" className={styles.tracePath} style={{animationDelay: '1.0s'}} />
              <path d="M60 260 L15 260 L15 340 L60 340" stroke="#90a4ae" strokeWidth="1" fill="none" className={styles.tracePath} style={{animationDelay: '1.4s'}} />
              <path d="M340 280 L385 280 L385 350 L340 350" stroke="#90a4ae" strokeWidth="1" fill="none" className={styles.tracePath} style={{animationDelay: '1.1s'}} />

              {/* Static nodes */}
              <circle cx="320" cy="60" r="3" fill="#90a4ae" className={styles.traceNode} />
              <circle cx="380" cy="200" r="3" fill="#90a4ae" className={styles.traceNode} style={{animationDelay: '0.3s'}} />
              <circle cx="100" cy="320" r="3" fill="#90a4ae" className={styles.traceNode} style={{animationDelay: '0.9s'}} />
              <circle cx="80" cy="100" r="3" fill="#90a4ae" className={styles.traceNode} style={{animationDelay: '1.2s'}} />
              {/* New nodes */}
              <circle cx="360" cy="80" r="3" fill="#78909c" className={styles.traceNode} style={{animationDelay: '0.8s'}} />
              <circle cx="40" cy="80" r="3" fill="#78909c" className={styles.traceNode} style={{animationDelay: '1.0s'}} />
              <circle cx="60" cy="340" r="3" fill="#78909c" className={styles.traceNode} style={{animationDelay: '1.4s'}} />
              <circle cx="340" cy="350" r="3" fill="#78909c" className={styles.traceNode} style={{animationDelay: '1.1s'}} />

              {/* Flowing data dots along traces */}
              <circle r="2.5" fill="#6366f1" className={styles.flowDot}>
                <animateMotion dur="3s" repeatCount="indefinite" path="M200 40 L200 10 L320 10 L320 60" />
              </circle>
              <circle r="2.5" fill="#8b5cf6" className={styles.flowDot}>
                <animateMotion dur="3.5s" repeatCount="indefinite" begin="0.5s" path="M340 120 L380 120 L380 200" />
              </circle>
              <circle r="2.5" fill="#6366f1" className={styles.flowDot}>
                <animateMotion dur="4s" repeatCount="indefinite" begin="1s" path="M200 340 L200 370 L100 370 L100 320" />
              </circle>
              <circle r="2.5" fill="#8b5cf6" className={styles.flowDot}>
                <animateMotion dur="3s" repeatCount="indefinite" begin="1.5s" path="M60 200 L30 200 L30 100 L80 100" />
              </circle>
              <circle r="2" fill="#a78bfa" className={styles.flowDot}>
                <animateMotion dur="3.2s" repeatCount="indefinite" begin="0.7s" path="M340 200 L370 200 L370 300 L340 300" />
              </circle>
              <circle r="2" fill="#a78bfa" className={styles.flowDot}>
                <animateMotion dur="2.8s" repeatCount="indefinite" begin="1.2s" path="M60 150 L20 150 L20 250" />
              </circle>
              <circle r="2" fill="#6366f1" className={styles.flowDot}>
                <animateMotion dur="3.6s" repeatCount="indefinite" begin="0.3s" path="M280 40 L280 20 L360 20 L360 80" />
              </circle>
              <circle r="2" fill="#8b5cf6" className={styles.flowDot}>
                <animateMotion dur="3.4s" repeatCount="indefinite" begin="0.9s" path="M120 40 L120 15 L40 15 L40 80" />
              </circle>
            </svg>

            {/* Floating particles */}
            <div className={styles.particleField}>
              {Array.from({length: 12}).map((_, i) => (
                <span
                  key={`p${i}`}
                  className={styles.particle}
                  style={{
                    '--delay': `${i * 0.6}s`,
                    '--x': `${Math.cos((i / 12) * Math.PI * 2) * 200 + 240}px`,
                    '--y': `${Math.sin((i / 12) * Math.PI * 2) * 200 + 240}px`,
                    '--size': `${2 + (i % 3)}px`,
                  } as React.CSSProperties}
                />
              ))}
            </div>

            {/* Chip base platform */}
            <div className={styles.chipPlatform}>
              <div className={styles.chipPlatformInner} />
            </div>

            {/* Main chip body */}
            <div className={styles.chipBody}>
              {/* Chip pins — top */}
              <div className={`${styles.chipPins} ${styles.chipPinsTop}`}>
                {Array.from({length: 8}).map((_, i) => <span key={`t${i}`} className={styles.pin} style={{animationDelay: `${i * 0.1}s`}} />)}
              </div>
              {/* Chip pins — bottom */}
              <div className={`${styles.chipPins} ${styles.chipPinsBottom}`}>
                {Array.from({length: 8}).map((_, i) => <span key={`b${i}`} className={styles.pin} style={{animationDelay: `${i * 0.1 + 0.4}s`}} />)}
              </div>
              {/* Chip pins — left */}
              <div className={`${styles.chipPins} ${styles.chipPinsLeft}`}>
                {Array.from({length: 6}).map((_, i) => <span key={`l${i}`} className={styles.pin} style={{animationDelay: `${i * 0.1 + 0.2}s`}} />)}
              </div>
              {/* Chip pins — right */}
              <div className={`${styles.chipPins} ${styles.chipPinsRight}`}>
                {Array.from({length: 6}).map((_, i) => <span key={`r${i}`} className={styles.pin} style={{animationDelay: `${i * 0.1 + 0.6}s`}} />)}
              </div>

              {/* Chip face */}
              <div className={styles.chipFace}>
                <div className={styles.scanLine} />
                <span className={styles.chipText}>AI</span>
              </div>
            </div>

            {/* Glow effect */}
            <div className={styles.chipGlow} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
