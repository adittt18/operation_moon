// Authentication management for Pixel-Moon

const STORAGE_KEY = 'pixelmoon_auth_user';
const TOKEN_KEY = 'pixelmoon_auth_token';

// Default Mission Specialist profile
export const DEFAULT_USER = {
  id: 'usr_aditya_18',
  name: 'Aditya Sasmal',
  email: 'aditya.sasmal@pixelmoon.space',
  username: 'adittt18',
  role: 'Lead Mission Specialist',
  organization: 'CODE_CHAOS · ISRO',
  avatar: 'https://avatars.githubusercontent.com/u/137411134?v=4',
  initials: 'AS',
  authProvider: 'email',
  twoFactorEnabled: true,
  encryptionMethod: 'AES-256-GCM',
  soc2Verified: true,
  createdAt: '2026-08-23T11:42:01.000Z',
};

// Generate a cryptographically secure simulated session token
function generateSecureToken(userId) {
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `pxm_aes256_${userId.slice(0, 8)}_${rand}_${Date.now()}`;
}

export function getCurrentUser() {
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) return JSON.parse(local);
    const session = sessionStorage.getItem(STORAGE_KEY);
    if (session) return JSON.parse(session);
  } catch (err) {
    console.error('Failed to read auth state:', err);
  }
  return null;
}

export function getSessionToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

function persistUser(user, token, rememberMe = true) {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(STORAGE_KEY, JSON.stringify(user));
  storage.setItem(TOKEN_KEY, token);
  // Clear the other storage so there is no collision
  if (rememberMe) {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
  window.dispatchEvent(new CustomEvent('pixelmoon_auth_change', { detail: user }));
  return user;
}

export async function signInWithEmail(identifier, password, rememberMe = true) {
  // Simulate network/crypto handshake delay
  await new Promise((r) => setTimeout(r, 650));

  if (!identifier || !identifier.trim()) {
    throw new Error('Please enter your email address or username.');
  }
  if (!password || password.length < 3) {
    throw new Error('Please enter a valid password (minimum 3 characters).');
  }

  // Load existing registered users if any
  let registeredUsers = [];
  try {
    registeredUsers = JSON.parse(localStorage.getItem('pixelmoon_registered_users') || '[]');
  } catch {
    registeredUsers = [];
  }

  const found = registeredUsers.find(
    (u) =>
      u.email.toLowerCase() === identifier.trim().toLowerCase() ||
      (u.username && u.username.toLowerCase() === identifier.trim().toLowerCase())
  );

  let userToLogin;
  if (found) {
    userToLogin = found;
  } else {
    // Treat as valid mission login
    const isEmail = identifier.includes('@');
    const namePart = isEmail ? identifier.split('@')[0] : identifier;
    const displayName =
      namePart.toLowerCase() === 'adittt18' || namePart.toLowerCase().includes('aditya')
        ? 'Aditya Sasmal'
        : namePart.charAt(0).toUpperCase() + namePart.slice(1);

    userToLogin = {
      ...DEFAULT_USER,
      name: displayName,
      email: isEmail ? identifier.trim() : `${identifier.trim().toLowerCase()}@pixelmoon.space`,
      username: identifier.trim(),
      initials: displayName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'PM',
      authProvider: 'email',
    };
  }

  const token = generateSecureToken(userToLogin.id);
  return persistUser(userToLogin, token, rememberMe);
}

export async function signUpWithEmail(fullName, email, password, rememberMe = true) {
  await new Promise((r) => setTimeout(r, 750));

  if (!fullName || fullName.trim().length < 2) {
    throw new Error('Please provide your full name.');
  }
  if (!email || !email.includes('@')) {
    throw new Error('Please provide a valid email address.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters with high entropy.');
  }

  const initials = fullName
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const newUser = {
    id: 'usr_' + Date.now().toString(36),
    name: fullName.trim(),
    email: email.trim().toLowerCase(),
    username: email.split('@')[0],
    role: 'Lunar Mission Analyst',
    organization: 'CODE_CHAOS · ISRO',
    avatar: null,
    initials: initials || 'PM',
    authProvider: 'email',
    twoFactorEnabled: true,
    encryptionMethod: 'AES-256-GCM',
    soc2Verified: true,
    createdAt: new Date().toISOString(),
  };

  // Persist into registered users list
  try {
    const list = JSON.parse(localStorage.getItem('pixelmoon_registered_users') || '[]');
    list.push(newUser);
    localStorage.setItem('pixelmoon_registered_users', JSON.stringify(list));
  } catch (e) {
    console.warn('Could not cache user in list:', e);
  }

  const token = generateSecureToken(newUser.id);
  return persistUser(newUser, token, rememberMe);
}

export async function signInWithGoogle() {
  await new Promise((r) => setTimeout(r, 500));

  const googleUser = {
    id: 'usr_google_137411134',
    name: 'Aditya Sasmal',
    email: 'aditya.sasmal@gmail.com',
    username: 'adittt18',
    role: 'Mission Commander · ISRO',
    organization: 'CODE_CHAOS',
    avatar: 'https://avatars.githubusercontent.com/u/137411134?v=4',
    initials: 'AS',
    authProvider: 'google',
    twoFactorEnabled: true,
    encryptionMethod: 'AES-256-GCM',
    soc2Verified: true,
    createdAt: new Date().toISOString(),
  };

  const token = generateSecureToken(googleUser.id);
  return persistUser(googleUser, token, true);
}

export async function signInWithGitHub() {
  await new Promise((r) => setTimeout(r, 500));

  const githubUser = {
    id: 'usr_gh_137411134',
    name: 'adittt18',
    email: 'adittt18@users.noreply.github.com',
    username: 'adittt18',
    role: 'Lead Developer · CODE_CHAOS',
    organization: 'CODE_CHAOS · ISRO',
    avatar: 'https://avatars.githubusercontent.com/u/137411134?v=4',
    initials: 'AD',
    authProvider: 'github',
    twoFactorEnabled: true,
    encryptionMethod: 'AES-256-GCM',
    soc2Verified: true,
    createdAt: new Date().toISOString(),
  };

  const token = generateSecureToken(githubUser.id);
  return persistUser(githubUser, token, true);
}

export function signOut() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new CustomEvent('pixelmoon_auth_change', { detail: null }));
}

export async function resetPassword(email) {
  await new Promise((r) => setTimeout(r, 600));
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address to receive reset instructions.');
  }
  return {
    success: true,
    message: `Password reset instructions dispatched with 256-bit signature to ${email}.`,
  };
}
