'use client';

import React from 'react';
import { X, HelpCircle, BookOpen, Shield, Code2 } from 'lucide-react';
import { playSound } from '../lib/sound';

interface FooterModalsProps {
  activeModal: 'about' | 'rules' | 'privacy' | 'credits' | null;
  onClose: () => void;
}

export const FooterModals: React.FC<FooterModalsProps> = ({
  activeModal,
  onClose,
}) => {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[var(--glass-modal)] backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="glass-panel-strong max-w-xl w-full p-6 space-y-6 rounded-2xl border border-[var(--border-strong)] relative max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            {activeModal === 'about' && <HelpCircle className="w-5 h-5 text-[var(--text-primary)]" />}
            {activeModal === 'rules' && <BookOpen className="w-5 h-5 text-[var(--text-primary)]" />}
            {activeModal === 'privacy' && <Shield className="w-5 h-5 text-[var(--text-primary)]" />}
            {activeModal === 'credits' && <Code2 className="w-5 h-5 text-[var(--text-primary)]" />}
            <h3 className="font-semibold text-lg text-[var(--text-primary)] capitalize">
              {activeModal === 'about'
                ? 'About SpaceDraw'
                : activeModal === 'rules'
                ? 'Game Rules'
                : activeModal === 'privacy'
                ? 'Privacy Policy'
                : 'Credits & Assets'}
            </h3>
          </div>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="text-sm text-[var(--text-secondary)] space-y-4 leading-relaxed font-sans">
          {activeModal === 'about' && (
            <>
              <p>
                SpaceDraw is a real-time drawing and guessing multiplayer game designed with a cinematic, glassmorphic monochrome interface.
              </p>
              <p>
                Experience fast-paced gameplay with local simulated bots, responsive canvas controls, high-DPI scaling, and instant scoring logic.
              </p>
            </>
          )}

          {activeModal === 'rules' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
                <span className="font-bold text-[var(--text-primary)] block mb-1">1. Drawing Phase</span>
                <span>The designated artist chooses a word and has a set time to draw it on the glass board without using letters or numbers.</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
                <span className="font-bold text-[var(--text-primary)] block mb-1">2. Guessing Phase</span>
                <span>Guesser players type guesses into the live chat. Faster correct guesses score higher points!</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
                <span className="font-bold text-[var(--text-primary)] block mb-1">3. Scoring</span>
                <span>Points are awarded based on speed and accuracy. The artist receives bonus points when guessers succeed.</span>
              </div>
            </div>
          )}

          {activeModal === 'privacy' && (
            <>
              <p>
                SpaceDraw is a frontend-only application. All profiles, preferences, and game rooms are simulated locally in your browser.
              </p>
              <p>
                No personal data, canvas drawings, or chat messages are recorded or transmitted to remote tracking servers.
              </p>
            </>
          )}

          {activeModal === 'credits' && (
            <>
              <p>
                Designed and engineered for Google AI Studio. Uses Next.js, Tailwind CSS, Lucide Icons, and Web Audio API.
              </p>
              <p>
                All custom artwork and game status graphics are licensed for AI Studio SpaceDraw platform usage.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
