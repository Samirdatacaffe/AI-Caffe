import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import AuthCard from './components/AuthCard';
import MockupSection from './components/MockupSection';
import PricingSection from './components/PricingSection';
import EmailOtpScreen from './components/EmailOtpScreen';
import WelcomeScreen from './components/WelcomeScreen';
import SignUpForm from './components/SignUpForm';
import LoginPage from './components/LoginPage';
import ForgotPassword from './components/ForgotPassword';
import TopicPicker from './components/TopicPicker';
import ChatBot from './components/ChatBot';
import './App.css';

type AppScreen = 'loading' | 'landing' | 'auth' | 'welcome' | 'signup' | 'login' | 'forgot' | 'topics' | 'chat';

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('loading');
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userLastName, setUserLastName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Auto-login: check if user has a valid session (JWT cookie)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUserName(data.user.firstName);
            setUserLastName(data.user.lastName);
            setUserEmail(data.user.email);
            // Restore topics from localStorage if available
            const savedTopics = localStorage.getItem('selectedTopics');
            if (savedTopics) {
              setSelectedTopics(JSON.parse(savedTopics));
            }
            setScreen('chat');
            return;
          }
        }
      } catch {
        // No valid session — show landing page
      }
      setScreen('landing');
    };
    checkAuth();
  }, []);

  // Save topics to localStorage when they change
  useEffect(() => {
    if (selectedTopics.length > 0) {
      localStorage.setItem('selectedTopics', JSON.stringify(selectedTopics));
    }
  }, [selectedTopics]);

  // ---- Loading (checking auth) ----
  if (screen === 'loading') {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#f5f0ea',
        fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px',
        fontStyle: 'italic', color: '#1c1917',
      }}>
        AICaffe
      </div>
    );
  }

  // ---- Landing Page ----
  if (screen === 'landing') {
    return (
      <LandingPage
        onSignUp={() => setScreen('auth')}
        onSignIn={() => setScreen('login')}
      />
    );
  }

  // ---- Login Page ----
  if (screen === 'login') {
    return (
      <LoginPage
        onSuccess={(user) => {
          setUserName(user.firstName);
          setUserLastName(user.lastName);
          setUserEmail(user.email);
          setScreen('topics');
        }}
        onForgotPassword={() => setScreen('forgot')}
        onSignUp={() => setScreen('auth')}
      />
    );
  }

  // ---- Forgot Password ----
  if (screen === 'forgot') {
    return (
      <ForgotPassword
        onSuccess={() => setScreen('login')}
        onBack={() => setScreen('login')}
      />
    );
  }

  // ---- Welcome Screen (after email verification) ----
  if (screen === 'welcome') {
    return (
      <WelcomeScreen onContinue={() => setScreen('signup')} />
    );
  }

  // ---- Sign Up Form ----
  if (screen === 'signup') {
    return (
      <SignUpForm
        email={verifiedEmail}
        onComplete={(data) => {
          setUserName(data.firstName);
          setUserLastName(data.lastName);
          setUserEmail(verifiedEmail);
          setScreen('topics');
        }}
        onBack={() => setScreen('login')}
      />
    );
  }

  // ---- Topic Picker (after login/signup) ----
  if (screen === 'topics') {
    return (
      <TopicPicker
        userName={userName}
        onContinue={(topics) => {
          setSelectedTopics(topics);
          setScreen('chat');
        }}
      />
    );
  }

  // ---- AI ChatBot ----
  if (screen === 'chat') {
    return (
      <ThemeProvider>
        <ChatBot
          userName={userName}
          userLastName={userLastName}
          userEmail={userEmail}
          topics={selectedTopics}
          onLogout={async () => {
            // Call logout API to clear cookies
            try {
              await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            } catch { /* ignore */ }
            localStorage.removeItem('selectedTopics');
            setUserName('');
            setUserLastName('');
            setUserEmail('');
            setSelectedTopics([]);
            setScreen('landing');
          }}
        />
      </ThemeProvider>
    );
  }

  // ---- Auth Screen (Email + Google Sign Up) ----
  return (
    <ThemeProvider>
      {otpEmail && (
        <EmailOtpScreen
          email={otpEmail}
          onVerified={() => {
            setVerifiedEmail(otpEmail);
            setOtpEmail(null);
            setScreen('welcome');
          }}
          onBack={() => setOtpEmail(null)}
        />
      )}

      <div className="app authPage">
        {/* Animated background elements */}
        <div className="authBgOrb authBgOrb1" />
        <div className="authBgOrb authBgOrb2" />
        <div className="authBgOrb authBgOrb3" />
        <div className="authGridOverlay" />

        {/* Floating sparkle particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="authParticle" style={{ '--i': i } as React.CSSProperties} />
        ))}

        <Header onLogoClick={() => setScreen('landing')} />

        <main className="hero">
          <div className="heroLeft">
            <div className="heroBadge">
              <span className="heroBadgeDot" />
              <span>Powered by multi-model AI</span>
            </div>
            <h1 className="heroTitle">
              <span className="authBrandInline">AICaffe</span> Think fast,
              <br />
              <span className="heroTitleIndent">build faster</span>
            </h1>
            <p className="heroSubtitle">
              Brainstorm in AICaffe, build smarter
            </p>
            <AuthCard onOtpSent={(email) => setOtpEmail(email)} />

            {/* Trust signals */}
            <div className="authTrust">
              <span className="authTrustItem">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"><path d="M2 7l3.5 3.5L12 4" /></svg>
                5 AI models
              </span>
              <span className="authTrustItem">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"><path d="M2 7l3.5 3.5L12 4" /></svg>
                Domain expert
              </span>
            </div>
          </div>

          <MockupSection />
        </main>

        <PricingSection />
      </div>
    </ThemeProvider>
  );
};

export default App;
