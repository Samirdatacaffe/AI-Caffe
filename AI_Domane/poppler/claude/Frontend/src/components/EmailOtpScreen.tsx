import { useState, useRef, useEffect } from 'react';
import styles from './EmailOtpScreen.module.css';

interface EmailOtpScreenProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

const EmailOtpScreen: React.FC<EmailOtpScreenProps> = ({ email, onVerified, onBack }) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(30);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input
  useEffect(() => {
    setTimeout(() => otpRefs.current[0]?.focus(), 200);
  }, []);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (index: number, value: string): void => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];

    // Handle paste
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6);
      for (let i = 0; i < 6; i++) newOtp[i] = digits[i] || '';
      setOtp(newOtp);
      setError(null);
      otpRefs.current[Math.min(digits.length, 5)]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent): void => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = async (): Promise<void> => {
    const code = otp.join('');
    if (code.length !== 6) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/otp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await res.json();

      if (!res.ok || !data.verified) {
        setError(data.message || 'Invalid code. Please try again.');
        return;
      }

      setSuccess(true);
      setTimeout(() => onVerified(), 1500);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (): Promise<void> => {
    if (resendTimer > 0) return;
    setError(null);

    try {
      const res = await fetch('/api/otp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setResendTimer(30);
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } catch {
      setError('Failed to resend. Try again.');
    }
  };

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        {/* Email Sent Icon */}
        <div className={styles.iconWrapper}>
          <div className={styles.iconCircle}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className={styles.planeIcon}>
              <path d="M34 6L18 22" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
              <path d="M34 6L24 34L18 22L6 16L34 6Z" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={styles.iconDots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>

        {/* Heading */}
        <h1 className={styles.heading}>Check your email</h1>
        <p className={styles.subtitle}>
          A temporary sign-in link has been sent to
          <br />
          <strong>{email}</strong>
        </p>

        {/* Success State */}
        {success && (
          <div className={styles.successBox}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="2" />
              <path d="M6 10.5L9 13.5L14 7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Email verified successfully!
          </div>
        )}

        {/* OTP Inputs */}
        {!success && (
          <>
            <div className={styles.otpRow}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={`${styles.otpInput} ${digit ? styles.otpFilled : ''} ${error ? styles.otpError : ''}`}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={(e) => {
                    e.preventDefault();
                    handleChange(0, e.clipboardData.getData('text'));
                  }}
                />
              ))}
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            <button
              className={`${styles.confirmBtn} ${otp.join('').length !== 6 ? styles.btnDisabled : ''}`}
              onClick={handleConfirm}
              disabled={otp.join('').length !== 6 || loading}
            >
              {loading ? <span className={styles.spinner} /> : 'Confirm'}
            </button>

            {/* Resend */}
            <div className={styles.resendRow}>
              {resendTimer > 0 ? (
                <span className={styles.resendTimer}>Resend code in {resendTimer}s</span>
              ) : (
                <button className={styles.resendBtn} onClick={handleResend}>
                  Resend code
                </button>
              )}
            </div>
          </>
        )}

        {/* Back link */}
        <button className={styles.backBtn} onClick={onBack}>
          &larr; Use a different email
        </button>
      </div>
    </div>
  );
};

export default EmailOtpScreen;
