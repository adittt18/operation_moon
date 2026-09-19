import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  Shield,
  Fingerprint,
  Check,
  ArrowRight,
  UserPlus,
  Activity,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
} from '../auth';

export default function LoginPage({ onLoginSuccess, onExploreAsGuest }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields — strictly empty. Never pre-fill or cache personal email.
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState(null);

  // On mount: Clean any stored/cached email so fields stay 100% blank
  useEffect(() => {
    try {
      localStorage.removeItem('pixelmoon_saved_identifier');
      sessionStorage.removeItem('pixelmoon_saved_identifier');
    } catch {}
    setIdentifier('');
    setPassword('');
    setRememberMe(false);
  }, []);

  // Email / Password Authentication Handler
  const handleEmailSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        const user = await signUpWithEmail(fullName, regEmail, password, rememberMe);
        setSuccessMessage(`Account created successfully for ${user.name}!`);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(user);
        }, 400);
      } else {
        const user = await signInWithEmail(identifier, password, rememberMe);
        setSuccessMessage(`Welcome back, ${user.name}!`);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(user);
        }, 400);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e?.preventDefault();
    setForgotLoading(true);
    setForgotMessage(null);
    try {
      const res = await resetPassword(forgotEmail);
      setForgotMessage({ type: 'success', text: res.message });
    } catch (err) {
      setForgotMessage({ type: 'error', text: err.message });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="login-viewport">
      {/* ─────────────────────────────────────────────────────────────
       * TOP HEADER BAR (Exact Menu Bar branding & light navy blue CODE_CHAOS)
       * ──────────────────────────────────────────────────────────── */}
      <header className="login-topbar">
        <div className="login-topbar-left">
          <div className="login-brand-container">
            <div className="login-brand-moon">
              <img
                src="/moon_brand_logo.png"
                alt="Pixel-Moon"
                className="login-brand-moon-img"
              />
            </div>
            <div className="login-brand-text-col">
              <div className="login-brand-title">
                <span className="login-brand-white">Pixel-</span>
                <span className="login-brand-cyan">Moon</span>
              </div>
              <span className="login-brand-subtitle">Lunar Image Registration</span>
            </div>
          </div>
          <span className="login-topbar-sep">|</span>
          <span className="login-topbar-team">CODE_CHAOS</span>
        </div>

        <div className="login-topbar-right">
          <div className="login-status-pill">
            <span className="login-status-dot" />
            <div className="login-status-texts">
              <span className="login-status-label">Online</span>
              <span className="login-status-ver">v1.0.0</span>
            </div>
            {/* Heartbeat / ECG Waveform Icon */}
            <svg
              className="login-ecg-icon"
              viewBox="0 0 24 12"
              fill="none"
              stroke="#6ba3eb"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 6h4l2.5-4.5 3 9 2.5-7 2 4.5h8" />
            </svg>
          </div>

          {onExploreAsGuest && (
            <button
              type="button"
              className="login-guest-btn"
              onClick={onExploreAsGuest}
              title="Explore workspace without authentication"
            >
              Explore as Guest →
            </button>
          )}
        </div>
      </header>

      {/* Crisp Divider Line (No glow) */}
      <div className="login-topbar-glow-line" />

      {/* ─────────────────────────────────────────────────────────────
       * MAIN AUTH STAGE (Left Hero [NO moon sphere] + Right Card)
       * ──────────────────────────────────────────────────────────── */}
      <main className="login-content-container">
        {/* Left Side: Hero Typography (Clean layout, signature removed from bottom) */}
        <section className="login-hero-side">
          <div className="login-hero-typography">
            <h1 className="login-hero-heading">
              <span className="login-hero-line1">Turning Lunar Data</span>
              <span className="login-hero-line2">
                <span className="login-hero-white">Into Deeper </span>
                <span className="login-hero-cyan">Insights</span>
              </span>
            </h1>
            <p className="login-hero-description">
              Secure access to advanced lunar image registration
              <br />
              and analysis tools for a smarter tomorrow.
            </p>
          </div>
        </section>

        {/* Right Side: Auth Card with Pixel-Moon styled as Dark Mode UI */}
        <section className="login-card-side">
          <div className="login-auth-card">
            {/* Card Header */}
            <div className="login-card-header">
              <span className="login-card-eyebrow">
                {isRegisterMode ? 'CREATE AN ACCOUNT' : 'WELCOME BACK'}
              </span>
              <h2 className="login-card-title">
                <span className="login-card-title-prefix">
                  {isRegisterMode ? 'Register on ' : 'Sign In to '}
                </span>
                <span className="brand-prefix">Pixel-</span>
                <span className="brand-suffix">Moon</span>
              </h2>
              <p className="login-card-subtitle">
                {isRegisterMode
                  ? 'Join the mission and access high-resolution lunar registration tools.'
                  : 'Access your workspace and continue exploring lunar data.'}
              </p>
            </div>

            {/* Error / Feedback banners */}
            {errorMessage && (
              <div className="login-alert-box alert-error page-fade">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="login-alert-box alert-success page-fade">
                <Check size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailSubmit} className="login-form" method="post" autoComplete="off">
              {isRegisterMode && (
                <div className="login-input-group">
                  <div className="login-input-wrapper">
                    <User className="login-input-icon" size={17} />
                    <input
                      type="text"
                      name="user_fullname"
                      id="login-fullname"
                      className="login-input"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>
              )}

              {/* Email / Username Input */}
              <div className="login-input-group">
                <div className="login-input-wrapper">
                  <Mail className="login-input-icon" size={17} />
                  <input
                    type={isRegisterMode ? 'email' : 'text'}
                    name="user_login_identity"
                    id="login-username"
                    className="login-input"
                    placeholder={
                      isRegisterMode ? 'Work Email Address' : 'Email Address or Username'
                    }
                    value={isRegisterMode ? regEmail : identifier}
                    onChange={(e) =>
                      isRegisterMode
                        ? setRegEmail(e.target.value)
                        : setIdentifier(e.target.value)
                    }
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="login-input-group">
                <div className="login-input-wrapper">
                  <Lock className="login-input-icon" size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="user_login_credential"
                    id="login-password"
                    className="login-input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Options Row: Remember me + Forgot Password */}
              <div className="login-options-row">
                <label className="login-remember-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="login-checkbox-native"
                  />
                  <span className="login-custom-checkbox">
                    {rememberMe && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className="login-remember-text">Remember me</span>
                </label>

                {!isRegisterMode && (
                  <button
                    type="button"
                    className="login-forgot-link"
                    onClick={() => setShowForgotModal(true)}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                className="login-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="login-btn-loading">
                    <Activity className="spin-icon" size={18} /> Authenticating...
                  </span>
                ) : (
                  <>
                    <ShieldCheck size={18} strokeWidth={2.4} />
                    <span>{isRegisterMode ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight size={17} strokeWidth={2.4} />
                  </>
                )}
              </button>
            </form>


            {/* 4-Column Security Badges Strip */}
            <div className="login-security-strip">
              <div className="login-sec-col">
                <Shield className="login-sec-icon" size={17} />
                <span className="login-sec-label">256-bit AES</span>
                <span className="login-sec-sub">Encryption</span>
              </div>
              <div className="login-sec-sep" />
              <div className="login-sec-col">
                <Fingerprint className="login-sec-icon" size={17} />
                <span className="login-sec-label">2FA</span>
                <span className="login-sec-sub">Enabled</span>
              </div>
              <div className="login-sec-sep" />
              <div className="login-sec-col">
                <Lock className="login-sec-icon" size={17} />
                <span className="login-sec-label">Secure</span>
                <span className="login-sec-sub">Session</span>
              </div>
              <div className="login-sec-sep" />
              <div className="login-sec-col">
                <ShieldCheck className="login-sec-icon" size={17} />
                <span className="login-sec-label">SOC 2</span>
                <span className="login-sec-sub">Compliant</span>
              </div>
            </div>

            {/* Footer Trust Message */}
            <div className="login-security-footer">
              <Lock size={12} className="login-sec-footer-lock" />
              <span>Your data is protected with industry-standard security protocols.</span>
            </div>
          </div>

          {/* Under Card Switch: Don't have an account? Sign Up / Register */}
          <div className="login-switch-container">
            <button
              type="button"
              className="login-switch-btn"
              onClick={() => {
                setIsRegisterMode((prev) => !prev);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
            >
              <UserPlus size={16} />
              <span>
                {isRegisterMode ? (
                  <>
                    Already have an account?{' '}
                    <strong className="login-switch-accent">Sign In →</strong>
                  </>
                ) : (
                  <>
                    Don't have an account?{' '}
                    <strong className="login-switch-accent">Sign Up / Register →</strong>
                  </>
                )}
              </span>
            </button>
          </div>
        </section>
      </main>

      {/* ─────────────────────────────────────────────────────────────
       * GOOGLE ACCOUNT CHOOSER & CONSENT MODAL (Matches user screenshots)
       * ──────────────────────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────
       * REAL GOOGLE OAUTH 2.0 LAUNCH & CONFIGURATION MODAL
       * Launches accounts.google.com (Official Google Identity Services)


      {/* ─────────────────────────────────────────────────────────────
       * PASSWORD RECOVERY MODAL
       * ──────────────────────────────────────────────────────────── */}
      {showForgotModal && (
        <div className="login-modal-backdrop page-fade">
          <div className="login-modal-card glass-card">
            <div className="login-modal-header">
              <ShieldCheck className="login-brand-cyan" size={24} />
              <h3>Reset Password</h3>
              <p>Enter your verified workspace email to receive secure reset credentials.</p>
            </div>

            {forgotMessage && (
              <div
                className={`login-alert-box ${
                  forgotMessage.type === 'success' ? 'alert-success' : 'alert-error'
                }`}
              >
                {forgotMessage.text}
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="login-modal-form">
              <div className="login-input-wrapper">
                <Mail className="login-input-icon" size={17} />
                <input
                  type="email"
                  className="login-input"
                  placeholder="Enter your registered email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              <div className="login-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotMessage(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
