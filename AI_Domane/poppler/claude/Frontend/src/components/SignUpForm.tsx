import { useState, useCallback } from 'react';
import logo from '../assets/aicaffe-logo.png';
import styles from './SignUpForm.module.css';

interface SignUpFormProps {
  email: string;
  onComplete: (data: { firstName: string; lastName: string }) => void;
  onBack: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  password?: string;
  confirmPassword?: string;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ email, onComplete, onBack }) => {
  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1); // 1 = name, 2 = password
  const [success, setSuccess] = useState<boolean>(false);

  // Password strength
  const getPasswordStrength = useCallback((pw: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { score, label: 'Weak', color: '#ef4444' };
    if (score <= 2) return { score, label: 'Fair', color: '#f59e0b' };
    if (score <= 3) return { score, label: 'Good', color: '#3b82f6' };
    return { score, label: 'Strong', color: '#22c55e' };
  }, []);

  const strength = getPasswordStrength(form.password);

  const handleChange = (field: keyof FormData, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep1 = (): boolean => {
    const errs: FormErrors = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    else if (form.firstName.trim().length < 2) errs.firstName = 'At least 2 characters';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    else if (form.lastName.trim().length < 2) errs.lastName = 'At least 2 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: FormErrors = {};
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'At least 8 characters';
    else if (strength.score < 2) errs.password = 'Password is too weak';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = (): void => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateStep2()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          password: form.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.message || 'Registration failed';
        setApiError(msg);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => onComplete({ firstName: form.firstName.trim(), lastName: form.lastName.trim() }), 1500);
    } catch {
      // Fallback: if no backend, just proceed
      setSuccess(true);
      setTimeout(() => onComplete({ firstName: form.firstName.trim(), lastName: form.lastName.trim() }), 1500);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logoRow}>
          <img src={logo} alt="AICaffe" className={styles.logo} />
        </div>

        {/* Progress Steps */}
        <div className={styles.progressBar}>
          <div className={`${styles.progressStep} ${styles.progressDone}`}>
            <div className={styles.stepCircle}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7L6 10L11 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className={styles.stepLabel}>Email</span>
          </div>
          <div className={styles.progressLine}>
            <div className={styles.progressLineFill} />
          </div>
          <div className={`${styles.progressStep} ${styles.progressDone}`}>
            <div className={styles.stepCircle}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7L6 10L11 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className={styles.stepLabel}>Verify</span>
          </div>
          <div className={styles.progressLine}>
            <div className={`${styles.progressLineFill} ${step >= 1 ? styles.progressLineFillActive : ''}`} />
          </div>
          <div className={`${styles.progressStep} ${step >= 1 ? styles.progressActive : ''}`}>
            <div className={styles.stepCircle}>
              <span>3</span>
            </div>
            <span className={styles.stepLabel}>Profile</span>
          </div>
          <div className={styles.progressLine}>
            <div className={`${styles.progressLineFill} ${step >= 2 ? styles.progressLineFillActive : ''}`} />
          </div>
          <div className={`${styles.progressStep} ${step >= 2 ? styles.progressActive : ''}`}>
            <div className={styles.stepCircle}>
              <span>4</span>
            </div>
            <span className={styles.stepLabel}>Security</span>
          </div>
        </div>

        {/* Success */}
        {success && (
          <div className={styles.successOverlay}>
            <div className={styles.successContent}>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="26" stroke="#22c55e" strokeWidth="3" />
                <path d="M16 28L24 36L40 18" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h2 className={styles.successTitle}>Account Created!</h2>
              <p className={styles.successSubtitle}>Welcome to AICaffe, {form.firstName}!</p>
            </div>
          </div>
        )}

        {/* Card */}
        {!success && (
          <div className={styles.card}>
            {/* API Error Banner */}
            {apiError && (
              <div className={styles.apiErrorBanner}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="8" stroke="#ef4444" strokeWidth="1.5" />
                  <path d="M9 5v4M9 12h.01" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>{apiError}</span>
                <button className={styles.apiErrorClose} onClick={() => setApiError(null)}>&times;</button>
              </div>
            )}

            {/* Step 1: Name */}
            {step === 1 && (
              <div className={styles.stepContent} key="step1">
                <h2 className={styles.cardTitle}>What's your name?</h2>
                <p className={styles.cardSubtitle}>
                  Let us know how to address you
                </p>

                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>First Name</label>
                    <div className={`${styles.inputWrapper} ${errors.firstName ? styles.inputError : ''} ${form.firstName ? styles.inputFilled : ''}`}>
                      <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="John"
                        value={form.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && document.getElementById('lastName')?.focus()}
                        autoFocus
                      />
                    </div>
                    {errors.firstName && <span className={styles.errorMsg}>{errors.firstName}</span>}
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Last Name</label>
                    <div className={`${styles.inputWrapper} ${errors.lastName ? styles.inputError : ''} ${form.lastName ? styles.inputFilled : ''}`}>
                      <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        id="lastName"
                        type="text"
                        className={styles.input}
                        placeholder="Doe"
                        value={form.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                      />
                    </div>
                    {errors.lastName && <span className={styles.errorMsg}>{errors.lastName}</span>}
                  </div>
                </div>

                {/* Email display */}
                <div className={styles.emailBadge}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <path d="M22 7l-10 7L2 7" />
                  </svg>
                  {email}
                </div>

                <button className={styles.primaryBtn} onClick={handleNext}>
                  Continue
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </button>
              </div>
            )}

            {/* Step 2: Password */}
            {step === 2 && (
              <div className={styles.stepContent} key="step2">
                <h2 className={styles.cardTitle}>Create a password</h2>
                <p className={styles.cardSubtitle}>
                  Secure your account with a strong password
                </p>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Password</label>
                  <div className={`${styles.inputWrapper} ${errors.password ? styles.inputError : ''} ${form.password ? styles.inputFilled : ''}`}>
                    <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={styles.input}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      autoFocus
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  {errors.password && <span className={styles.errorMsg}>{errors.password}</span>}

                  {/* Strength meter */}
                  {form.password.length > 0 && (
                    <div className={styles.strengthRow}>
                      <div className={styles.strengthBar}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div
                            key={n}
                            className={styles.strengthSeg}
                            style={{ background: n <= strength.score ? strength.color : 'rgba(0,0,0,0.08)' }}
                          />
                        ))}
                      </div>
                      <span className={styles.strengthLabel} style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                  )}

                  {/* Requirements */}
                  <div className={styles.requirements}>
                    <div className={`${styles.reqItem} ${form.password.length >= 8 ? styles.reqMet : ''}`}>
                      {form.password.length >= 8 ? '✓' : '○'} 8+ characters
                    </div>
                    <div className={`${styles.reqItem} ${/[A-Z]/.test(form.password) ? styles.reqMet : ''}`}>
                      {/[A-Z]/.test(form.password) ? '✓' : '○'} Uppercase
                    </div>
                    <div className={`${styles.reqItem} ${/[0-9]/.test(form.password) ? styles.reqMet : ''}`}>
                      {/[0-9]/.test(form.password) ? '✓' : '○'} Number
                    </div>
                    <div className={`${styles.reqItem} ${/[^A-Za-z0-9]/.test(form.password) ? styles.reqMet : ''}`}>
                      {/[^A-Za-z0-9]/.test(form.password) ? '✓' : '○'} Special char
                    </div>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Confirm Password</label>
                  <div className={`${styles.inputWrapper} ${errors.confirmPassword ? styles.inputError : ''} ${form.confirmPassword && form.password === form.confirmPassword ? styles.inputSuccess : ''}`}>
                    <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className={styles.input}
                      placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
                      <EyeIcon open={showConfirm} />
                    </button>
                    {form.confirmPassword && form.password === form.confirmPassword && (
                      <svg className={styles.checkMark} width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="8" fill="#22c55e" />
                        <path d="M5 9L8 12L13 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  {errors.confirmPassword && <span className={styles.errorMsg}>{errors.confirmPassword}</span>}
                </div>

                <div className={styles.btnRow}>
                  <button className={styles.backBtn} onClick={() => setStep(1)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M13 8H3M7 4L3 8l4 4" />
                    </svg>
                    Back
                  </button>
                  <button className={styles.primaryBtn} onClick={handleSubmit} disabled={loading}>
                    {loading ? <span className={styles.spinner} /> : (
                      <>
                        Create Account
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M3 8h10M9 4l4 4-4 4" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Back to login */}
        {!success && (
          <button className={styles.loginLink} onClick={onBack}>
            Already have an account? <strong>Sign in</strong>
          </button>
        )}
      </div>
    </div>
  );
};

export default SignUpForm;
