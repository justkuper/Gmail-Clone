import React, { useState, useEffect } from 'react';
import { signIn, signOut, signUp, getCurrentUser } from 'aws-amplify/auth';
import './KmailAuth.css';

const DOMAIN = '@kmail.com';
const TAKEN = new Set(['admin', 'support', 'info', 'noreply', 'hello', 'kmail', 'postmaster', 'abuse']);

// Check username availability — swap the setTimeout stub for a real API call if needed
async function checkAvailable(username) {
  await new Promise(r => setTimeout(r, 500));
  return !TAKEN.has(username.toLowerCase());
}

function KmailLogo() {
  return (
    <div className="kauth-logo">
      <svg width="44" height="44" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="12" fill="#1a73e8"/>
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
          fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="32" fill="white">K</text>
      </svg>
      <span className="kauth-wordmark">Kmail</span>
    </div>
  );
}

// ─── Sign In ──────────────────────────────────────────────────────────────────
function SignInForm({ onSuccess, onGoRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn({ username: email.trim(), password });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="kauth-card">
      <KmailLogo />
      <h2>Sign in</h2>
      <p className="kauth-sub">to continue to Kmail</p>
      {error && <div className="kauth-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          className="kauth-input"
          type="email"
          placeholder="Email (e.g. you@kmail.com)"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoFocus
        />
        <input
          className="kauth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <div className="kauth-actions">
          <button type="button" className="kauth-link" onClick={onGoRegister}>
            Create account
          </button>
          <button className="kauth-btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Register: step 1 — choose username ───────────────────────────────────────
function ChooseUsername({ onNext }) {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [timer, setTimer] = useState(null);

  function handleChange(raw) {
    const clean = raw.replace(/[^a-z0-9._-]/gi, '').toLowerCase();
    setUsername(clean);
    setStatus(null);
    if (timer) clearTimeout(timer);
    if (clean.length < 3) return;
    if (!/^[a-z0-9][a-z0-9._-]*[a-z0-9]$/i.test(clean)) {
      setStatus('invalid');
      return;
    }
    setStatus('checking');
    const t = setTimeout(async () => {
      const ok = await checkAvailable(clean);
      setStatus(ok ? 'available' : 'taken');
    }, 500);
    setTimer(t);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (status === 'available') onNext(username);
  }

  const fullEmail = username ? `${username}${DOMAIN}` : '';

  return (
    <div className="kauth-card">
      <KmailLogo />
      <h2>Create your Kmail address</h2>
      <p className="kauth-sub">Choose a username — we'll add <strong>{DOMAIN}</strong></p>
      <form onSubmit={handleSubmit}>
        <div className="kauth-username-row">
          <input
            className="kauth-input username-input"
            type="text"
            placeholder="username"
            value={username}
            onChange={e => handleChange(e.target.value)}
            autoFocus
            spellCheck={false}
            autoCapitalize="none"
            required
          />
          <span className="kauth-domain">{DOMAIN}</span>
        </div>
        {username.length >= 3 && (
          <p className={`kauth-avail kauth-avail--${status}`}>
            {status === 'checking'  && 'Checking…'}
            {status === 'available' && `✓ ${fullEmail} is available`}
            {status === 'taken'     && `✗ ${fullEmail} is already taken`}
            {status === 'invalid'   && 'Only letters, numbers, dots, hyphens, and underscores allowed'}
          </p>
        )}
        <div className="kauth-actions">
          <span />
          <button className="kauth-btn-primary" type="submit" disabled={status !== 'available'}>
            Next
          </button>
        </div>
      </form>
    </div>
  );
}

// Password must match Cognito's default policy
function validatePassword(pw) {
  if (pw.length < 8)           return 'At least 8 characters required';
  if (!/[A-Z]/.test(pw))       return 'Must include an uppercase letter';
  if (!/[a-z]/.test(pw))       return 'Must include a lowercase letter';
  if (!/[0-9]/.test(pw))       return 'Must include a number';
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Must include a special character (e.g. !@#$)';
  return null;
}

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters',       ok: password.length >= 8 },
    { label: 'Uppercase letter',     ok: /[A-Z]/.test(password) },
    { label: 'Lowercase letter',     ok: /[a-z]/.test(password) },
    { label: 'Number',               ok: /[0-9]/.test(password) },
    { label: 'Special character',    ok: /[^A-Za-z0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <ul className="kauth-pw-rules">
      {checks.map(c => (
        <li key={c.label} className={c.ok ? 'pw-ok' : 'pw-bad'}>
          {c.ok ? '✓' : '✗'} {c.label}
        </li>
      ))}
    </ul>
  );
}

// ─── Register: step 2 — set password ─────────────────────────────────────────
function SetPassword({ username, onNext, onBack }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fullEmail = `${username}${DOMAIN}`;

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validatePassword(password);
    if (validationError) { setError(validationError); return; }
    setError('');
    setLoading(true);
    try {
      await signUp({
        username: fullEmail,
        password,
        options: { userAttributes: { email: fullEmail } }
      });
      // Lambda auto-confirms the user — sign in immediately
      await signIn({ username: fullEmail, password });
      onNext();
    } catch (err) {
      setError(err.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  }

  const isValid = validatePassword(password) === null;

  return (
    <div className="kauth-card">
      <KmailLogo />
      <h2>Create a password</h2>
      <p className="kauth-sub">For <strong>{fullEmail}</strong></p>
      {error && <div className="kauth-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          className="kauth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoFocus
        />
        <PasswordStrength password={password} />
        <div className="kauth-actions">
          <button type="button" className="kauth-link" onClick={onBack}>Back</button>
          <button className="kauth-btn-primary" type="submit" disabled={loading || !isValid}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Root auth wrapper ────────────────────────────────────────────────────────
export default function KmailAuth({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [view, setView] = useState('signin'); // 'signin' | 'choose' | 'password'
  const [regUsername, setRegUsername] = useState('');

  useEffect(() => {
    getCurrentUser()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  function handleAuthSuccess() {
    getCurrentUser().then(u => setUser(u));
  }

  if (checking) {
    return (
      <div className="kauth-loading">
        <svg width="48" height="48" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="#1a73e8"/>
          <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
            fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="32" fill="white">K</text>
        </svg>
      </div>
    );
  }

  if (user) {
    return children({ user, signOut: async () => { await signOut(); setUser(null); setView('signin'); } });
  }

  return (
    <div className="kauth-backdrop">
      {view === 'signin' && (
        <SignInForm
          onSuccess={handleAuthSuccess}
          onGoRegister={() => setView('choose')}
        />
      )}
      {view === 'choose' && (
        <ChooseUsername
          onNext={u => { setRegUsername(u); setView('password'); }}
        />
      )}
      {view === 'password' && (
        <SetPassword
          username={regUsername}
          onNext={handleAuthSuccess}
          onBack={() => setView('choose')}
        />
      )}
    </div>
  );
}
