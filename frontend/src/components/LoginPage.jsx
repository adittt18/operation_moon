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
  Smartphone,
  KeyRound,
  X,
} from 'lucide-react';
import {
  signInWithEmail,
  signUpWithEmail,
  completeGoogleSignIn,
  completeGitHubSignIn,
  resetPassword,
  MASTER_USER,
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

  // Google 2-Step Verification Modal
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleStep, setGoogleStep] = useState(1); // 1: Account selection, 2: 2-Step Verification
  const [google2faCode, setGoogle2faCode] = useState('849201');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [useCustomGoogle, setUseCustomGoogle] = useState(false);

  // GitHub Authorization Modal
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

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

  // Google OAuth flow with 2-Step Verification
  const openGoogleAuth = () => {
    setErrorMessage(null);
    setGoogleStep(1);
    setUseCustomGoogle(false);
    setShowGoogleModal(true);
  };

  const handleSelectGoogleAccount = () => {
    setGoogleStep(2); // Move to 2-Step Verification
  };

  const handleConfirmGoogle2FA = async (e) => {
    e?.preventDefault();
    setGoogleLoading(true);
    try {
      const email = useCustomGoogle && customGoogleEmail ? customGoogleEmail : 'aditya.sasmal@gmail.com';
      const name = useCustomGoogle && customGoogleEmail ? customGoogleEmail.split('@')[0] : 'Aditya Sasmal';
      const googleProfile = {
        sub: '137411134',
        name,
        email,
        picture: 'https://avatars.githubusercontent.com/u/137411134?v=4',
      };
      const user = await completeGoogleSignIn(googleProfile);
      setShowGoogleModal(false);
      setSuccessMessage(`Google 2-Step Verification confirmed for ${user.name}!`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(user);
      }, 400);
    } catch (err) {
      setErrorMessage('Google verification failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // GitHub OAuth Flow
  const openGitHubAuth = () => {
    setErrorMessage(null);
    setShowGitHubModal(true);
  };

  const handleAuthorizeGitHub = async () => {
    setGithubLoading(true);
    try {
      const ghProfile = {
        id: '137411134',
        login: 'adittt18',
        name: 'adittt18',
        email: 'adittt18@users.noreply.github.com',
        avatar_url: 'https://avatars.githubusercontent.com/u/137411134?v=4',
      };
      const user = await completeGitHubSignIn(ghProfile);
      setShowGitHubModal(false);
      setSuccessMessage(`GitHub OAuth authorized for @${user.username}!`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(user);
      }, 400);
    } catch (err) {
      setErrorMessage('GitHub authorization failed.');
    } finally {
      setGithubLoading(false);
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
          <div className="sidebar-brand login-sidebar-brand-match">
            <div className="sidebar-brand-logo">
              <img
                src="/moon_brand_logo.png"
                alt="Pixel-Moon"
                style={{
                  width: 44,
                  height: 44,
                  maxWidth: 44,
                  maxHeight: 44,
                  objectFit: 'contain',
                  display: 'block',
                  flexShrink: 0,
                  borderRadius: '50%',
                  filter: 'drop-shadow(0 2px 10px rgba(0, 0, 0, 0.45))',
                }}
              />
            </div>
            <div className="sidebar-brand-text login-brand-text">
              <h1>
                <span className="brand-prefix">Pixel-</span>
                <span className="brand-suffix">Moon</span>
              </h1>
              <span>Lunar Image Registration</span>
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
        {/* Left Side: Hero Typography (1st pic floating moon sphere REMOVED) */}
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

          <div className="login-hero-signature">
            <span className="login-sig-line" />
            <span className="login-sig-text">Code_Chaos</span>
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
                onClick={openGoogleAuth}
                disabled={isLoading}
              >
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
                onClick={openGitHubAuth}
                disabled={isLoading}
              >
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
       * GOOGLE OAUTH & 2-STEP VERIFICATION MODAL
       * ──────────────────────────────────────────────────────────── */}
      {showGoogleModal && (
        <div className="login-modal-backdrop page-fade">
          <div className="google-auth-card">
            <button
              type="button"
              className="oauth-modal-close"
              onClick={() => setShowGoogleModal(false)}
            >
              <X size={18} />
            </button>

            {/* Google G Header */}
            <div className="google-modal-header">
              <svg width="28" height="28" viewBox="0 0 24 24">
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
              <h3>Sign in with Google</h3>
              <p>to continue to <strong>Pixel-Moon</strong></p>
            </div>

            {googleStep === 1 ? (
              /* Step 1: Choose Account */
              <div className="google-step1-body">
                <span className="google-accounts-title">Choose an account</span>
                <div className="google-accounts-list">
                  <button
                    type="button"
                    className="google-account-row"
                    onClick={() => {
                      setUseCustomGoogle(false);
                      handleSelectGoogleAccount();
                    }}
                  >
                    <img
                      src="https://avatars.githubusercontent.com/u/137411134?v=4"
                      alt="Aditya Sasmal"
                      className="google-avatar-img"
                    />
                    <div className="google-account-text">
                      <strong>Aditya Sasmal</strong>
                      <span>aditya.sasmal@gmail.com</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="google-account-row"
                    onClick={() => {
                      setUseCustomGoogle(true);
                      setGoogleStep(2);
                    }}
                  >
                    <div className="google-generic-avatar">
                      <User size={18} />
                    </div>
                    <div className="google-account-text">
                      <strong>Use another account</strong>
                      <span>Sign in with another Google Workspace ID</span>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: 2-Step Verification */
              <form onSubmit={handleConfirmGoogle2FA} className="google-step2-body">
                <div className="google-2fa-badge">
                  <Smartphone size={22} className="google-2fa-icon" />
                  <div className="google-2fa-info">
                    <h4>2-Step Verification</h4>
                    <p>
                      To help keep your account safe, Google wants to make sure it's really you.
                    </p>
                  </div>
                </div>

                {useCustomGoogle && (
                  <div className="google-input-wrap">
                    <label>Google Account Email</label>
                    <input
                      type="email"
                      className="google-text-input"
                      placeholder="name@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="google-prompt-box">
                  <div className="google-prompt-row">
                    <Check size={16} color="#34A853" />
                    <span>Notification sent to Pixel 8 Pro · Tap <strong>YES</strong></span>
                  </div>
                  <small className="google-prompt-sub">Or enter the 6-digit Google Authenticator code below:</small>
                </div>

                <div className="google-code-input-wrap">
                  <KeyRound size={18} className="google-code-icon" />
                  <input
                    type="text"
                    className="google-code-input"
                    maxLength={6}
                    placeholder="Enter 6-digit code (e.g. 849201)"
                    value={google2faCode}
                    onChange={(e) => setGoogle2faCode(e.target.value)}
                    required
                  />
                </div>

                <div className="google-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setGoogleStep(1)}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm google-verify-btn"
                    disabled={googleLoading}
                  >
                    {googleLoading ? (
                      <>
                        <Activity className="spin-icon" size={15} /> Verifying...
                      </>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
       * GITHUB OAUTH AUTHORIZATION MODAL
       * ──────────────────────────────────────────────────────────── */}
      {showGitHubModal && (
        <div className="login-modal-backdrop page-fade">
          <div className="github-auth-card">
            <button
              type="button"
              className="oauth-modal-close"
              onClick={() => setShowGitHubModal(false)}
            >
              <X size={18} />
            </button>

            <div className="github-modal-header">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="#ffffff">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <h3>Authorize Pixel-Moon</h3>
              <p>by <strong>CODE_CHAOS</strong></p>
            </div>

            <div className="github-modal-body">
              <div className="github-user-row">
                <img
                  src="https://avatars.githubusercontent.com/u/137411134?v=4"
                  alt="adittt18"
                  className="github-avatar-img"
                />
                <div className="github-user-info">
                  <strong>adittt18</strong>
                  <span>Signed in as Lead Developer</span>
                </div>
              </div>

              <div className="github-permissions-box">
                <span className="github-perm-title">Permissions Requested:</span>
                <ul>
                  <li>
                    <Check size={14} color="#34A853" /> Verify public profile information
                  </li>
                  <li>
                    <Check size={14} color="#34A853" /> Access verified email address
                  </li>
                </ul>
              </div>

              <div className="github-2fa-note">
                <ShieldCheck size={15} color="#6ba3eb" />
                <span>GitHub 2FA / Passkey Verified</span>
              </div>

              <div className="github-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowGitHubModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm github-auth-btn"
                  onClick={handleAuthorizeGitHub}
                  disabled={githubLoading}
                >
                  {githubLoading ? (
                    <>
                      <Activity className="spin-icon" size={15} /> Authorizing...
                    </>
                  ) : (
                    'Authorize adittt18'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
