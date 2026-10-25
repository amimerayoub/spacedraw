'use client';

import React from 'react';
import { Lock, ShieldAlert, KeyRound, AlertTriangle, RefreshCw, Check, ArrowRight } from 'lucide-react';
import { playSound } from '../../lib/sound';

interface AdminAuthGateProps {
  onAuthenticated: (role: 'Owner' | 'Admin' | 'Moderator' | 'Viewer') => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({ onAuthenticated }) => {
  const [isFirstRun, setIsFirstRun] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('spacedraw:v1:admin_passcode_hash');
  });
  const [passcode, setPasscode] = React.useState<string>('');
  const [confirmPasscode, setConfirmPasscode] = React.useState<string>('');
  const [errorMsg, setErrorMsg] = React.useState<string>('');
  const [attempts, setAttempts] = React.useState<number>(0);
  const [lockoutTime, setLockoutTime] = React.useState<number>(0);
  const [showForgotReset, setShowForgotReset] = React.useState<boolean>(false);
  const [resetConfirmInput, setResetConfirmInput] = React.useState<string>('');

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const sessionAuth = sessionStorage.getItem('spacedraw:v1:admin_session');
    if (sessionAuth === 'true') {
      onAuthenticated('Owner');
    }
  }, [onAuthenticated]);

  // Lockout countdown timer
  React.useEffect(() => {
    if (lockoutTime <= 0) return;
    const interval = setInterval(() => {
      setLockoutTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTime]);

  // PBKDF2 Hashing helper via Web Crypto SubtleCrypto
  const hashPasscode = async (plainText: string, saltStr: string): Promise<string> => {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(plainText),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(saltStr),
        iterations: 150000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    const hashArray = Array.from(new Uint8Array(derivedBits));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const calculateStrength = (pass: string) => {
    if (pass.length === 0) return { label: 'Empty', score: 0 };
    if (pass.length < 8) return { label: 'Weak (min 8 chars)', score: 1 };
    let score = 2;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 2) return { label: 'Moderate', score: 2 };
    if (score === 3) return { label: 'Strong', score: 3 };
    return { label: 'Very Strong', score: 4 };
  };

  const handleFirstRunSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.length < 8) {
      setErrorMsg('Passcode must be at least 8 characters long.');
      return;
    }
    if (passcode !== confirmPasscode) {
      setErrorMsg('Passcodes do not match.');
      return;
    }

    try {
      const salt = window.crypto.getRandomValues(new Uint8Array(16)).join('');
      const hash = await hashPasscode(passcode, salt);
      localStorage.setItem('spacedraw:v1:admin_passcode_hash', hash);
      localStorage.setItem('spacedraw:v1:admin_passcode_salt', salt);
      sessionStorage.setItem('spacedraw:v1:admin_session', 'true');

      playSound('click');
      onAuthenticated('Owner');
    } catch (err) {
      setErrorMsg('Web Crypto error creating hash.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime > 0) return;

    try {
      const storedHash = localStorage.getItem('spacedraw:v1:admin_passcode_hash');
      const storedSalt = localStorage.getItem('spacedraw:v1:admin_passcode_salt') || 'salt';

      if (!storedHash) {
        setIsFirstRun(true);
        return;
      }

      const hash = await hashPasscode(passcode, storedSalt);

      if (hash === storedHash) {
        sessionStorage.setItem('spacedraw:v1:admin_session', 'true');
        playSound('click');
        onAuthenticated('Owner');
      } else {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        setErrorMsg('Incorrect passcode.');
        playSound('wrong');

        if (nextAttempts >= 5) {
          setLockoutTime(30);
          setErrorMsg('Too many failed attempts. Locked out for 30 seconds.');
        }
      }
    } catch (err) {
      setErrorMsg('Authentication error.');
    }
  };

  const handleLocalReset = () => {
    if (resetConfirmInput.trim().toUpperCase() !== 'RESET ADMIN') {
      setErrorMsg('Type RESET ADMIN to confirm.');
      return;
    }

    localStorage.removeItem('spacedraw:v1:admin_passcode_hash');
    localStorage.removeItem('spacedraw:v1:admin_passcode_salt');
    sessionStorage.removeItem('spacedraw:v1:admin_session');
    setShowForgotReset(false);
    setIsFirstRun(true);
    setPasscode('');
    setConfirmPasscode('');
    setErrorMsg('');
    playSound('click');
  };

  const strength = calculateStrength(passcode);

  return (
    <div className="min-h-screen w-full bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel-strong p-8 rounded-2xl border border-[var(--border-strong)] space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] text-[var(--accent-inverse)] flex items-center justify-center mx-auto font-bold text-2xl shadow">
            SD
          </div>
          <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">
            SpaceDraw Admin Console
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Full-Control Frontend Dashboard
          </p>
        </div>

        {/* Local Admin Mode Notice Banner */}
        <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] space-y-1">
          <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5 font-mono">
            <ShieldAlert className="w-4 h-4 text-[var(--text-primary)]" />
            <span>Local Admin Mode</span>
          </div>
          <p>
            Changes apply to this browser instance. Client-side authentication is for layout convenience, not server-level security.
          </p>
        </div>

        {/* First Run Setup Form */}
        {isFirstRun ? (
          <form onSubmit={handleFirstRunSetup} className="space-y-4">
            <div className="space-y-1 text-center">
              <span className="font-mono text-xs uppercase text-[var(--text-primary)] font-bold">
                Initial Passcode Setup
              </span>
              <p className="text-xs text-[var(--text-secondary)]">
                Create an Owner passcode (min 8 chars) to access the console.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-[var(--text-secondary)]">
                Owner Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--border-strong)]"
              />
              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)]">
                <span>Strength: {strength.label}</span>
                <span className="font-bold text-[var(--text-primary)]">{strength.score}/4</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-[var(--text-secondary)]">
                Confirm Passcode
              </label>
              <input
                type="password"
                value={confirmPasscode}
                onChange={(e) => setConfirmPasscode(e.target.value)}
                placeholder="Re-enter passcode"
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--border-strong)]"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-[var(--text-primary)] font-mono flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-medium text-sm flex items-center justify-center gap-2"
            >
              <span>Save Passcode & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-[var(--text-secondary)]">
                Enter Admin Passcode
              </label>
              <input
                type="password"
                value={passcode}
                disabled={lockoutTime > 0}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder={lockoutTime > 0 ? `Locked out (${lockoutTime}s)` : 'Passcode'}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--border-strong)] disabled:opacity-50"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-[var(--text-primary)] font-mono flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={lockoutTime > 0 || !passcode}
              className="w-full py-3.5 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Console</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowForgotReset(true)}
                className="text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline"
              >
                Forgot Passcode?
              </button>
            </div>
          </form>
        )}

        {/* Forgot Passcode Local Reset Popover */}
        {showForgotReset && (
          <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-strong)] space-y-3">
            <div className="text-xs font-mono text-[var(--text-primary)] font-bold flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Local Passcode Reset</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              This resets local admin credentials. Type <strong className="text-[var(--text-primary)] font-mono">RESET ADMIN</strong> to confirm.
            </p>
            <input
              type="text"
              value={resetConfirmInput}
              onChange={(e) => setResetConfirmInput(e.target.value)}
              placeholder="RESET ADMIN"
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-mono"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleLocalReset}
                className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-inverse)] font-medium text-xs font-mono"
              >
                Reset Credentials
              </button>
              <button
                type="button"
                onClick={() => setShowForgotReset(false)}
                className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
