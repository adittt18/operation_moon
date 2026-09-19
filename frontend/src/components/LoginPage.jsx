import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithGitHub,
  resetPassword,
  DEFAULT_USER,
} from '../auth';

export default function LoginPage({ onLoginSuccess, onExploreAsGuest }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form fields
  const [identifier, setIdentifier] = useState('adittt18');
  const [password, setPassword] = useState('PixelMoon#2026');
  const [fullName, setFullName] = useState('Aditya Sasmal');
  const [regEmail, setRegEmail] = useState('');

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState(null);

  const handleEmailSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        const user = await signUpWithEmail(fullName, regEmail, password, rememberMe);
        setSuccessMessage(`Account created successfully for ${user.name}!`);
        if (onLoginSuccess) onLoginSuccess(user);
      } else {
        const user = await signInWithEmail(identifier, password, rememberMe);
        setSuccessMessage(`Welcome back, ${user.name}!`);
        if (onLoginSuccess) onLoginSuccess(user);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      setSuccessMessage(`Google Authentication verified for ${user.name}!`);
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      setErrorMessage(err.message || 'Google sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const user = await signInWithGitHub();
      setSuccessMessage(`GitHub Authentication verified for @${user.username}!`);
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      setErrorMessage(err.message || 'GitHub sign-in failed.');
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
       * TOP HEADER BAR (Exact match to Reference Topbar)
       * ──────────────────────────────────────────────────────────── */}
      <header className="login-topbar">
        <div className="login-topbar-left">
          <div className="login-brand-logo-wrap">
            <img
              src="/moon_brand_logo.png"
              alt="Moon Brand Logo"
              className="login-moon-logo-img"
              onError={(e) => {
                e.target.src = '/real_moon.png';
              }}
            />
          </div>
          <div className="login-brand-titles">
            <span className="login-brand-title">Pixel-Moon</span>
            <span className="login-brand-subtitle">Lunar Image Registration</span>
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
              stroke="#38bdf8"
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

      {/* Full-width Glowing Cyan Divider */}
      <div className="login-topbar-glow-line" />

      {/* ─────────────────────────────────────────────────────────────
       * MAIN AUTH STAGE (Left Hero + Right Card)
       * ──────────────────────────────────────────────────────────── */}
      <main className="login-content-container">
        {/* Left Side: Hero Graphic & Typography */}
        <section className="login-hero-side">
          {/* Glowing 3D Moon Sphere */}
          <div className="login-moon-sphere-container">
            <div className="login-moon-sphere-glow" />
            <img
              src="/real_moon.png"
              alt="Glowing Moon"
              className="login-moon-sphere-img"
            />
          </div>

          <div className="login-hero-typography">
            <h1 className="login-hero-heading">
              <span className="login-hero-line1">Turning Lunar Data</span>
              <span className="login-hero-line2">Into Deeper Insights</span>
            </h1>
            <p className="login-hero-description">
              Secure access to advanced lunar image registration
              <br />
              and analysis tools for a smarter tomorrow.
            </p>
          </div>

          <div className="login-hero-signature">
            <span className="login-sig-line" />
            <span className="login-sig-text">Code_Chaos</span>
          </div>
        </section>

        {/* Right Side: Glassmorphic Auth Card */}
        <section className="login-card-side">
          <div className="login-auth-card glass-card">
            {/* Card Header */}
            <div className="login-card-header">
              <span className="login-card-eyebrow">
                {isRegisterMode ? 'CREATE AN ACCOUNT' : 'WELCOME BACK'}
              </span>
              <h2 className="login-card-title">
                {isRegisterMode ? 'Register on ' : 'Sign In to '}
                <span className="login-brand-cyan">Pixel-Moon</span>
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
            <form onSubmit={handleEmailSubmit} className="login-form">
              {isRegisterMode && (
                <div className="login-input-group">
                  <div className="login-input-wrapper">
                    <User className="login-input-icon" size={17} />
                    <input
                      type="text"
                      className="login-input"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      autoComplete="name"
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
                    autoComplete={isRegisterMode ? 'email' : 'username'}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="login-input-group">
                <div className="login-input-wrapper">
                  <Lock className="login-input-icon" size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="login-input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
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

            {/* OR Divider */}
            <div className="login-divider">
              <span className="login-divider-line" />
              <span className="login-divider-text">OR</span>
              <span className="login-divider-line" />
            </div>

            {/* Social OAuth Buttons */}
            <div className="login-social-group">
              {/* Google Button */}
              <button
                type="button"
                className="login-social-btn login-google-btn"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                {/* Official Google 'G' SVG Logo */}
                <svg className="login-social-icon" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                className="login-social-btn login-github-btn"
                onClick={handleGitHubSignIn}
                disabled={isLoading}
              >
                {/* Official GitHub SVG Icon */}
                <svg
                  className="login-social-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>Continue with GitHub</span>
              </button>
            </div>

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
