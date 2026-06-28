import React, { useState, useEffect } from 'react';
import {
  signIn, signOut, signUp, confirmSignUp,
  getCurrentUser, resendSignUpCode
} from 'aws-amplify/auth';
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

// ─── Register: step 2 — set password ─────────────────────────────────────────
function SetPassword({ username, onNext, onBack }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fullEmail = `${username}${DOMAIN}`;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUp({
        username: fullEmail,
        password,
        options: { userAttributes: { email: fullEmail } }
      });
      onNext(password);
    } catch (err) {
      setError(err.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  }

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
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          minLength={8}
          required
          autoFocus
        />
        <div className="kauth-actions">
          <button type="button" className="kauth-link" onClick={onBack}>Back</button>
          <button className="kauth-btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Register: step 3 — verify code ──────────────────────────────────────────
function VerifyCode({ username, password, onSuccess, onBack }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const fullEmail = `${username}${DOMAIN}`;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await confirmSignUp({ username: fullEmail, confirmationCode: code.trim() });
      await signIn({ username: fullEmail, password });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await resendSignUpCode({ username: fullEmail });
      setResent(true);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="kauth-card">
      <KmailLogo />
      <h2>Verify your email</h2>
      <p className="kauth-sub">Enter the code sent to <strong>{fullEmail}</strong></p>
      {error && <div className="kauth-error">{error}</div>}
      {resent && <div className="kauth-success">Code resent!</div>}
      <form onSubmit={handleSubmit}>
        <input
          className="kauth-input"
          type="text"
          placeholder="Verification code"
          value={code}
          onChange={e => setCode(e.target.value)}
          required
          autoFocus
        />
        <div className="kauth-actions">
          <button type="button" className="kauth-link" onClick={handleResend}>
            Resend code
          </button>
          <button className="kauth-btn-primary" type="submit" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify'}
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
  const [view, setView] = useState('signin'); // 'signin' | 'choose' | 'password' | 'verify'
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

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
          onNext={p => { setRegPassword(p); setView('verify'); }}
          onBack={() => setView('choose')}
        />
      )}
      {view === 'verify' && (
        <VerifyCode
          username={regUsername}
          password={regPassword}
          onSuccess={handleAuthSuccess}
          onBack={() => setView('password')}
        />
      )}
    </div>
  );
}
