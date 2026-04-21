import { useState, useRef } from 'react';
import logo from '../assets/aicaffe-logo.png';
import styles from './ForgotPassword.module.css';

interface ForgotPasswordProps {
  onSuccess: () => void;
  onBack: () => void;
}

type Step = 'email' | 'otp' | 'newPassword' | 'success';

const EyeIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
    ) : (
      <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" /></>
    )}
  </svg>
);

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onSuccess, onBack }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPw, setShowPw] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend timer
  useState(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(interval);
  });

  // ---- Send OTP ----
  const handleSendOtp = async (): Promise<void> => {
    if (!email.trim()) { setError('Enter your email'); return; }
    setLoading(true); setError(null);

    try {
      const res = await fetch('/api/user/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed'); return; }
      setStep('otp');
      setResendTimer(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch { setError('Network error'); } finally { setLoading(false); }
  };

  // ---- OTP input handlers ----
  const handleOtpChange = (i: number, val: string): void => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    if (val.length > 1) {
      const digits = val.replace(/\D/g, '').slice(0, 6);
      for (let j = 0; j < 6; j++) newOtp[j] = digits[j] || '';
      setOtp(newOtp); setError(null);
      otpRefs.current[Math.min(digits.length, 5)]?.focus(); return;
    }
    newOtp[i] = val; setOtp(newOtp); setError(null);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent): void => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  // ---- Verify OTP & go to new password ----
  const handleVerifyOtp = (): void => {
    if (otp.join('').length !== 6) { setError('Enter the 6-digit code'); return; }
    setStep('newPassword');
    setError(null);
  };

  // ---- Reset Password ----
  const handleResetPassword = async (): Promise<void> => {
    if (newPassword.length < 8) { setError('At least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError(null);

    try {
      const res = await fetch('/api/user/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.join(''), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed'); return; }
      setStep('success');
      setTimeout(() => onSuccess(), 2000);
    } catch { setError('Network error'); } finally { setLoading(false); }
  };

  // ---- Resend ----
  const handleResend = async (): Promise<void> => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    await handleSendOtp();
  };

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <div className={styles.logoRow}>
          <img src={logo} alt="AICaffe" className={styles.logo} />
        </div>

        <div className={styles.card}>
          {/* ==== Step 1: Email ==== */}
          {step === 'email' && (
            <div className={styles.stepContent}>
              <div className={styles.iconWrap}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gold, #d97706)" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <h2 className={styles.title}>Forgot password?</h2>
              <p className={styles.subtitle}>Enter your email and we'll send a reset code</p>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Email address</label>
                <div className={`${styles.inputWrapper} ${error ? styles.inputError : ''}`}>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    autoFocus
                  />
                </div>
              </div>

              {error && <p className={styles.errorText}>{error}</p>}

              <button className={styles.primaryBtn} onClick={handleSendOtp} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : 'Send reset code'}
              </button>

              <button className={styles.backLink} onClick={onBack}>
                &larr; Back to sign in
              </button>
            </div>
          )}

          {/* ==== Step 2: OTP ==== */}
          {step === 'otp' && (
            <div className={styles.stepContent}>
              <div className={styles.iconWrap}>
                <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                  <path d="M34 6L18 22" stroke="var(--text-muted, #78716c)" strokeWidth="2" strokeLinecap="round" />
                  <path d="M34 6L24 34L18 22L6 16L34 6Z" stroke="var(--text-muted, #78716c)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className={styles.title}>Check your email</h2>
              <p className={styles.subtitle}>
                We sent a 6-digit code to <strong>{email}</strong>
              </p>

              <div className={styles.otpRow}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1}
                    className={`${styles.otpInput} ${d ? styles.otpFilled : ''}`}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={(e) => { e.preventDefault(); handleOtpChange(0, e.clipboardData.getData('text')); }}
                  />
                ))}
              </div>

              {error && <p className={styles.errorText}>{error}</p>}

              <button className={styles.primaryBtn} onClick={handleVerifyOtp}>
                Verify code
              </button>

              <div className={styles.resendRow}>
                {resendTimer > 0 ? (
                  <span className={styles.resendTimer}>Resend in {resendTimer}s</span>
                ) : (
                  <button className={styles.resendBtn} onClick={handleResend}>Resend code</button>
                )}
              </div>
            </div>
          )}

          {/* ==== Step 3: New Password ==== */}
          {step === 'newPassword' && (
            <div className={styles.stepContent}>
              <div className={styles.iconWrap}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M12 2a5 5 0 015 5v4H7V7a5 5 0 015-5z" />
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <circle cx="12" cy="17" r="1.5" fill="#22c55e" />
                </svg>
              </div>
              <h2 className={styles.title}>Set new password</h2>
              <p className={styles.subtitle}>Choose a strong password for your account</p>

              <div className={styles.inputGroup}>
                <label className={styles.label}>New Password</label>
                <div className={`${styles.inputWrapper} ${error && !confirmPassword ? styles.inputError : ''}`}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    className={styles.input}
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                    autoFocus
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)}>
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Confirm Password</label>
                <div className={`${styles.inputWrapper} ${error ? styles.inputError : ''} ${confirmPassword && newPassword === confirmPassword ? styles.inputSuccess : ''}`}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className={styles.input}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
                    <EyeIcon open={showConfirm} />
                  </button>
                  {confirmPassword && newPassword === confirmPassword && (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="9" cy="9" r="8" fill="#22c55e" />
                      <path d="M5 9L8 12L13 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
              </div>

              {error && <p className={styles.errorText}>{error}</p>}

              <button className={styles.primaryBtn} onClick={handleResetPassword} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : 'Reset password'}
              </button>
            </div>
          )}

          {/* ==== Step 4: Success ==== */}
          {step === 'success' && (
            <div className={styles.successContent}>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="26" stroke="#22c55e" strokeWidth="3" />
                <path d="M16 28L24 36L40 18" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h2 className={styles.title}>Password reset!</h2>
              <p className={styles.subtitle}>Redirecting to sign in...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
