import { useState } from 'react';
import logo from '../assets/aicaffe-logo.png';
import styles from './LoginPage.module.css';

interface LoginPageProps {
  onSuccess: (user: { firstName: string; lastName: string; email: string }) => void;
  onForgotPassword: () => void;
  onSignUp: () => void;
}

const EyeIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onForgotPassword, onSignUp }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (): Promise<void> => {
    if (!email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      onSuccess(data.user);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <div className={styles.logoRow}>
          <img src={logo} alt="AICaffe" className={styles.logo} />
        </div>

        <div className={styles.card}>
          <h2 className={styles.title}>Welcome back</h2>
          <p className={styles.subtitle}>Sign in to your AICaffe account</p>

          {/* Email */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <div className={`${styles.inputWrapper} ${error ? styles.inputError : ''}`}>
              <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="M22 7l-10 7L2 7" />
              </svg>
              <input
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === 'Enter' && document.getElementById('login-pw')?.focus()}
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label className={styles.label}>Password</label>
              <button className={styles.forgotLink} onClick={onForgotPassword}>
                Forgot password?
              </button>
            </div>
            <div className={`${styles.inputWrapper} ${error ? styles.inputError : ''}`}>
              <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                id="login-pw"
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <button className={styles.loginBtn} onClick={handleLogin} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Sign in'}
          </button>
        </div>

        <p className={styles.signupLink}>
          Don't have an account?{' '}
          <button className={styles.linkBtn} onClick={onSignUp}>
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
