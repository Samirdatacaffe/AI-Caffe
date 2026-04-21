import { useState, useCallback } from 'react';
import { GoogleLogo } from './icons';
import styles from './AuthCard.module.css';

interface AuthCardProps {
  onOtpSent?: (email: string) => void;
}

const AuthCard: React.FC<AuthCardProps> = ({ onOtpSent }) => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = useCallback((value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }, []);

  const handleContinueWithEmail = async (): Promise<void> => {
    if (!isValidEmail(email)) return;
    setLoading(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      // Step 1: Check if email already registered
      const checkRes = await fetch('/api/user/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const checkData = await checkRes.json();

      if (checkData.exists) {
        setError('An account with this email already exists. Please sign in instead.');
        return;
      }

      // Step 2: Send OTP
      const res = await fetch('/api/otp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong');
        return;
      }

      onOtpSent?.(normalizedEmail);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = (): void => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <button className={styles.googleBtn} onClick={handleGoogleAuth}>
          <GoogleLogo />
          Continue with Google
        </button>

        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>OR</span>
          <div className={styles.dividerLine} />
        </div>

        <input
          type="email"
          placeholder="Enter your email"
          className={styles.emailInput}
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null); }}
          onKeyDown={(e) => e.key === 'Enter' && handleContinueWithEmail()}
        />

        {error && <p className={styles.errorText}>{error}</p>}

        <button
          className={`${styles.emailBtn} ${!isValidEmail(email) ? styles.emailBtnDisabled : ''}`}
          onClick={handleContinueWithEmail}
          disabled={!isValidEmail(email) || loading}
        >
          {loading ? <span className={styles.spinner} /> : 'Continue with email'}
        </button>
      </div>
    </div>
  );
};

export default AuthCard;
