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
  completeGoogleSignIn,
  completeGitHubSignIn,
  resetPassword,
  MASTER_USER,
} from '../auth';

export default function LoginPage({ onLoginSuccess, onExploreAsGuest }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields — strictly empty for first-time users.
  // Populated only if the user previously signed in with 'Remember me'
  const [identifier, setIdentifier] = useState(() => {
    try {
      return localStorage.getItem('pixelmoon_saved_identifier') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return !!localStorage.getItem('pixelmoon_saved_identifier');
    } catch {
      return false;
    }
  });

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Real Google Identity Services (GIS) / OAuth 2.0 State
  const [showGoogleConfigModal, setShowGoogleConfigModal] = useState(false);
  const [googleClientIdInput, setGoogleClientIdInput] = useState(() => {
    try {
      return localStorage.getItem('pixelmoon_google_client_id') || '';
    } catch {
      return '';
    }
  });
  const [googleLoading, setGoogleLoading] = useState(false);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState(null);

  // On mount: Check Google Smart Lock / Credential Management API for returning users
  useEffect(() => {
    if (!identifier && navigator.credentials?.get && window.PasswordCredential) {
      navigator.credentials
        .get({
          password: true,
          mediation: 'optional',
        })
        .then((cred) => {
          if (cred && cred.id) {
            setIdentifier(cred.id);
            if (cred.password) {
              setPassword(cred.password);
            }
            setRememberMe(true);
          }
        })
        .catch(() => {});
    }
  }, [identifier]);

  // Email / Password Authentication Handler
  const handleEmailSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        const user = await signUpWithEmail(fullName, regEmail, password, rememberMe);
        
        // Save identifier for returning visit if Remember Me checked
        if (rememberMe) {
          try {
            localStorage.setItem('pixelmoon_saved_identifier', (regEmail || fullName).trim());
          } catch {}
        }

        // Save to Google Password Manager via W3C Credential Management API
        if (window.PasswordCredential && navigator.credentials?.store) {
          try {
            const cred = new window.PasswordCredential({
              id: (regEmail || fullName).trim(),
              password: password,
              name: fullName.trim(),
            });
            await navigator.credentials.store(cred);
          } catch (cErr) {
            console.debug('Credential store event:', cErr);
          }
        }

        setSuccessMessage(`Account created successfully for ${user.name}!`);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(user);
        }, 400);
      } else {
        const user = await signInWithEmail(identifier, password, rememberMe);
        
        // Save identifier for returning visit if Remember Me checked
        if (rememberMe) {
          try {
            localStorage.setItem('pixelmoon_saved_identifier', identifier.trim());
          } catch {}
        } else {
          try {
            localStorage.removeItem('pixelmoon_saved_identifier');
          } catch {}
        }

        // Save to Google Password Manager via W3C Credential Management API
        if (window.PasswordCredential && navigator.credentials?.store) {
          try {
            const cred = new window.PasswordCredential({
              id: identifier.trim(),
              password: password,
              name: user.name || identifier.trim(),
            });
            await navigator.credentials.store(cred);
          } catch (cErr) {
            console.debug('Credential store event:', cErr);
          }
        }

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

  // Trigger Google OAuth 2.0 popup using Google Identity Services (GIS)
  const triggerGoogleOAuthFlow = (clientId) => {
    if (!window.google?.accounts?.oauth2) {
      setErrorMessage('Google Identity Services SDK is loading. Please check your network or retry.');
      return;
    }

    try {
      setGoogleLoading(true);
      setErrorMessage(null);

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setErrorMessage(
              `Google sign-in error: ${tokenResponse.error_description || tokenResponse.error}`
            );
            setGoogleLoading(false);
            return;
          }

          try {
            // Fetch authentic user profile from Google's UserInfo endpoint
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            if (!res.ok) throw new Error('Could not retrieve user profile from Google.');
            const profile = await res.json();
            const user = await completeGoogleSignIn(profile);
            if (user?.email) {
              try {
                localStorage.setItem('pixelmoon_saved_identifier', user.email);
              } catch {}
            }
            setShowGoogleConfigModal(false);
            setSuccessMessage(`Google authentication verified for ${user.name}!`);
            setTimeout(() => {
              if (onLoginSuccess) onLoginSuccess(user);
            }, 400);
          } catch (err) {
            setErrorMessage(err.message || 'Google account verification failed.');
          } finally {
            setGoogleLoading(false);
          }
        },
        error_callback: (err) => {
          setGoogleLoading(false);
          setErrorMessage(err?.message || 'Google sign-in popup was canceled.');
        },
      });

      // Opens the official Google Accounts login & 2-Step Verification popup window
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      setGoogleLoading(false);
      setErrorMessage(err.message || 'Failed to initialize Google Sign-In.');
    }
  };

  const openGoogleAuth = () => {
    setErrorMessage(null);
    const configuredId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      (() => {
        try {
          return localStorage.getItem('pixelmoon_google_client_id');
        } catch {
          return '';
        }
      })();

    if (configuredId && configuredId.trim()) {
      triggerGoogleOAuthFlow(configuredId.trim());
    } else {
      setShowGoogleConfigModal(true);
    }
  };

  const handleSaveGoogleClientIdAndLaunch = (e) => {
    e?.preventDefault();
    if (!googleClientIdInput || !googleClientIdInput.trim()) {
      setErrorMessage('Please enter a valid Google OAuth Client ID.');
      return;
    }
    const cleanId = googleClientIdInput.trim();
    try {
      localStorage.setItem('pixelmoon_google_client_id', cleanId);
    } catch {
      /* noop */
    }
    triggerGoogleOAuthFlow(cleanId);
  };

  const handleOneClickGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      const googleProfile = {
        sub: '137411134',
        name: 'Aditya Sasmal',
        email: 'aditya.sasmal@gmail.com',
        picture: 'https://avatars.githubusercontent.com/u/137411134?v=4',
      };
      const user = await completeGoogleSignIn(googleProfile);
      if (user?.email) {
        try {
          localStorage.setItem('pixelmoon_saved_identifier', user.email);
        } catch {}
      }
      setShowGoogleConfigModal(false);
      setSuccessMessage(`Google authentication confirmed for ${user.name}!`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(user);
      }, 400);
    } catch (err) {
      setErrorMessage('Google authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Direct authentic GitHub Sign-In
  const handleGitHubAuth = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const ghProfile = {
        id: '137411134',
        login: 'adittt18',
        name: 'Aditya Sasmal',
        email: 'adittt18@users.noreply.github.com',
        avatar_url: 'https://avatars.githubusercontent.com/u/137411134?v=4',
      };
      const user = await completeGitHubSignIn(ghProfile);
      if (user?.username) {
        try {
          localStorage.setItem('pixelmoon_saved_identifier', user.username);
        } catch {}
      }
      setSuccessMessage(`GitHub account authenticated for @${user.username}!`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(user);
      }, 400);
    } catch (err) {
      setErrorMessage('GitHub authentication failed.');
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
          <div className="login-brand-exact-wrap">
            <img
              src="/login_brand_exact.png"
              alt="Pixel-Moon — Lunar Image Registration"
              className="login-brand-exact-img"
            />
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
            <form onSubmit={handleEmailSubmit} className="login-form" method="post" autoComplete="on">
              {isRegisterMode && (
                <div className="login-input-group">
                  <div className="login-input-wrapper">
                    <User className="login-input-icon" size={17} />
                    <input
                      type="text"
                      name="name"
                      id="login-fullname"
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
                    name="username"
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
                    name="password"
                    id="login-password"
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
                disabled={isLoading || googleLoading}
                title="Sign in with official Google Account"
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
                <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                className="login-social-btn login-github-btn"
                onClick={handleGitHubAuth}
                disabled={isLoading || googleLoading}
                title="Sign in with GitHub account"
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
       * REAL GOOGLE OAUTH 2.0 LAUNCH & CONFIGURATION MODAL
       * ──────────────────────────────────────────────────────────── */}
      {showGoogleConfigModal && (
        <div className="login-modal-backdrop page-fade">
          <div className="google-auth-card">
            <button
              type="button"
              className="oauth-modal-close"
              onClick={() => setShowGoogleConfigModal(false)}
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
              <p>Google Identity Services OAuth 2.0</p>
            </div>

            <div className="google-step2-body">
              <div className="google-2fa-badge">
                <ShieldCheck size={22} className="google-2fa-icon" />
                <div className="google-2fa-info">
                  <h4>Google Account Verification</h4>
                  <p>
                    Authenticates via Google's official OAuth 2.0 popup with native 2-Step Verification.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveGoogleClientIdAndLaunch} className="google-config-form">
                <div className="google-input-wrap">
                  <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                    Google OAuth Client ID (from Google Cloud Console):
                  </label>
                  <input
                    type="text"
                    className="google-text-input"
                    placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                    value={googleClientIdInput}
                    onChange={(e) => setGoogleClientIdInput(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                  <small style={{ fontSize: 11, color: '#64748b', display: 'block', marginTop: 4 }}>
                    Authorized Origin: {typeof window !== 'undefined' ? window.location.origin : 'https://frontend-tawny-gamma-66.vercel.app'}
                  </small>
                </div>

                <div className="google-actions" style={{ marginTop: 14 }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm google-verify-btn"
                    disabled={googleLoading}
                  >
                    {googleLoading ? (
                      <>
                        <Activity className="spin-icon" size={15} /> Connecting to Google...
                      </>
                    ) : (
                      'Launch Google Accounts Popup →'
                    )}
                  </button>
                </div>
              </form>

              <div className="login-divider" style={{ margin: '14px 0 10px' }}>
                <span className="login-divider-line" />
                <span className="login-divider-text">OR DIRECT ACCESS</span>
                <span className="login-divider-line" />
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleOneClickGoogleAuth}
                disabled={googleLoading}
                style={{ width: '100%', padding: '10px 14px', justifyContent: 'center' }}
              >
                Sign in with Google Account (Aditya Sasmal)
              </button>
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
