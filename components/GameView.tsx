'use client';

import React from 'react';
import { Send, ArrowLeft, Users, Edit3, Crown } from 'lucide-react';
import { RoomState } from '../lib/services/game-service';
import { DrawingModel, ToolType, DrawOperation } from '../lib/canvas/drawing-model';
import { CanvasBoard } from './CanvasBoard';
import { DrawingToolbar } from './DrawingToolbar';
import { assetUrl } from '../lib/assets';
import { playSound } from '../lib/sound';
import { useKeyboardInset } from '../hooks/use-mobile';

interface GameViewProps {
  roomState: RoomState;
  drawingModel: DrawingModel;
  currentUserId: string;
  onSelectWord: (index: number) => void;
  onSubmitGuess: (text: string) => void;
  onSubmitStroke: (op: DrawOperation) => void;
  onClearBoard: () => void;
  onBack: () => void;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const GameView: React.FC<GameViewProps> = ({
  roomState,
  drawingModel,
  currentUserId,
  onSelectWord,
  onSubmitGuess,
  onSubmitStroke,
  onClearBoard,
  onBack,
}) => {
  const [guessInput, setGuessInput] = React.useState('');
  const [tool, setTool] = React.useState<ToolType>('brush');
  const [color, setColor] = React.useState<string>('#FFFFFF');
  const [size, setSize] = React.useState<number>(0.008);
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);

  const chatContainerRef = React.useRef<HTMLDivElement | null>(null);
  const keyboardInset = useKeyboardInset();
  const keyboardOpen = keyboardInset > 60;

  const isDrawer = roomState.currentDrawerId === currentUserId;
  const currentUser = roomState.players.find((p) => p.id === currentUserId);
  const currentDrawer = roomState.players.find((p) => p.id === roomState.currentDrawerId);
  const letterCount = roomState.maskedWord ? roomState.maskedWord.replace(/\s/g, '').length : 0;
  const sortedPlayers = React.useMemo(
    () => [...roomState.players].sort((a, b) => b.score - a.score),
    [roomState.players]
  );
  const leaderId = sortedPlayers.length > 0 && sortedPlayers[0].score > 0 ? sortedPlayers[0].id : null;
  const isDrawingPhase = roomState.phase === 'DRAWING';
  const guessDisabled = isDrawer || !!currentUser?.guessedThisRound || !isDrawingPhase;

  // Sync undo/redo state
  React.useEffect(() => {
    const updateHistory = () => {
      setCanUndo(drawingModel.canUndo());
      setCanRedo(drawingModel.canRedo());
    };
    updateHistory();
    return drawingModel.subscribe(updateHistory);
  }, [drawingModel]);

  // Auto scroll chat list (does not touch focus, so typing is not disrupted)
  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [roomState.chatMessages]);

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = guessInput.trim();
    if (!text || guessDisabled) return;
    onSubmitGuess(text);
    setGuessInput('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex-1 min-h-0 flex flex-col gap-2 sm:gap-3">
      {/* Compact Game Status Bar */}
      <header className="shrink-0 glass-panel-strong px-2 sm:px-4 py-2 rounded-2xl flex items-center gap-2 sm:gap-4 border border-[var(--border-strong)]">
        <button
          type="button"
          onClick={() => {
            playSound('click');
            onBack();
          }}
          className="shrink-0 p-2.5 -ml-1 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] transition-colors"
          aria-label="Back to lobby"
          title="Back to lobby"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="shrink-0 flex flex-col leading-tight">
          <span className="text-[9px] sm:text-[10px] font-mono uppercase text-[var(--text-secondary)]">Round</span>
          <span className="font-mono font-bold text-sm sm:text-lg text-[var(--text-primary)]">
            {roomState.currentRound}/{roomState.totalRounds}
          </span>
        </div>

        <div
          className="shrink-0 flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]"
          role="timer"
          aria-label={`${roomState.timeRemaining} seconds remaining`}
        >
          <img
            src={assetUrl('game-status', roomState.timeRemaining <= 10 && isDrawingPhase ? 'fast-timer' : 'hourglass-icon')}
            alt=""
            className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="font-mono font-bold text-base sm:text-xl text-[var(--text-primary)] tabular-nums min-w-[2ch] text-center">
            {roomState.timeRemaining}
          </span>
        </div>

        {/* Word / Hint */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center leading-tight">
          <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)] truncate max-w-full">
            {isDrawer
              ? 'Your word'
              : roomState.phase === 'WORD_SELECTION'
              ? `${currentDrawer?.name || 'Artist'} is choosing…`
              : `${currentDrawer?.name || 'Artist'} is drawing${
                  roomState.wordCategory ? ` • ${roomState.wordCategory}` : ''
                }${letterCount ? ` • ${letterCount} letters` : ''}`}
          </span>
          <div
            className="font-mono font-bold text-sm sm:text-2xl tracking-widest text-[var(--text-primary)] truncate max-w-full"
            aria-live="polite"
          >
            {isDrawer
              ? (roomState.wordChoices[0] || '…').toUpperCase()
              : roomState.maskedWord || '— — —'}
          </div>
        </div>

        {/* Drawer avatar */}
        <div className="shrink-0 flex items-center gap-2" title={`Drawing: ${currentDrawer?.name || '—'}`}>
          <span className="hidden md:inline font-medium text-xs text-[var(--text-secondary)] max-w-[100px] truncate">
            {currentDrawer?.name || 'Someone'}
          </span>
          <div className="relative w-9 h-9 rounded-xl bg-[var(--chip-bg)] border border-[var(--border)] flex items-center justify-center overflow-hidden">
            <img
              src={assetUrl('avatars', currentDrawer?.avatar || 'astronaut')}
              alt={currentDrawer ? `${currentDrawer.name} avatar` : 'Drawer avatar'}
              className="w-full h-full object-contain p-0.5"
            />
            {isDrawingPhase && (
              <span className="absolute bottom-0 right-0 bg-[var(--accent)] text-[var(--accent-inverse)] rounded-tl-md p-px">
                <Edit3 className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        </div>

        {/* Players count */}
        <div
          className="shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]"
          title={`${roomState.players.length} players in room ${roomState.code}`}
        >
          <Users className="w-3.5 h-3.5 text-[var(--text-secondary)]" aria-hidden="true" />
          <span className="font-mono font-bold text-xs sm:text-sm text-[var(--text-primary)] tabular-nums">
            {roomState.players.length}
          </span>
        </div>
      </header>

      {/* Mobile / Tablet: horizontally scrollable player strip (hidden on desktop and while the keyboard is open) */}
      <div
        className={`shrink-0 lg:hidden overflow-x-auto no-scrollbar -mx-0.5 px-0.5 ${keyboardOpen ? 'hidden' : ''}`}
        aria-label="Player rankings"
      >
        <div className="flex items-center gap-2 w-max">
          {sortedPlayers.map((player, idx) => (
            <div
              key={player.id}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border ${
                player.id === currentUserId
                  ? 'bg-[var(--glass-strong)] border-[var(--border-strong)]'
                  : 'bg-[var(--bg-tertiary)] border-[var(--border)]'
              }`}
            >
              <span className="font-mono text-[10px] text-[var(--text-secondary)]">#{idx + 1}</span>
              <div className="relative w-7 h-7 rounded-lg bg-[var(--chip-bg)] border border-[var(--border)] overflow-hidden shrink-0">
                <img
                  src={assetUrl('avatars', player.avatar)}
                  alt=""
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="flex items-center gap-1 font-medium text-[11px] text-[var(--text-primary)] max-w-[80px] truncate">
                  {player.id === leaderId && <Crown className="w-3 h-3 shrink-0" aria-label="Leader" />}
                  {player.name}
                  {player.id === roomState.currentDrawerId && <Edit3 className="w-3 h-3 shrink-0" aria-label="Drawing" />}
                </span>
                <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                  {player.guessedThisRound ? (
                    <span className="text-green-400 font-semibold">Guessed ✓</span>
                  ) : (
                    `${player.score} pts`
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Game Area: Leaderboard (desktop) | Canvas | Chat */}
      <div className="flex-1 min-h-0 grid grid-cols-1 grid-rows-[minmax(0,1fr)_auto] md:grid-rows-1 md:grid-cols-5 lg:grid-cols-12 gap-2 sm:gap-4">
        {/* Scoreboard Sidebar (desktop only) */}
        <aside
          className="hidden lg:flex lg:col-span-3 glass-panel p-4 flex-col min-h-0 overflow-y-auto"
          aria-label="Player rankings"
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-3">
            <span className="font-mono text-xs uppercase text-[var(--text-secondary)]">Standings</span>
            <span className="font-mono text-xs text-[var(--text-secondary)]">Score</span>
          </div>

          <div className="space-y-2">
            {sortedPlayers.map((player, idx) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                  player.id === currentUserId
                    ? 'bg-[var(--glass-strong)] border-[var(--border-strong)]'
                    : 'bg-[var(--bg-tertiary)] border-[var(--border)]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-xs text-[var(--text-secondary)] w-4 text-center shrink-0">
                    #{idx + 1}
                  </span>

                  <div className="w-8 h-8 rounded-lg bg-[var(--chip-bg)] border border-[var(--border)] flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={assetUrl('avatars', player.avatar)}
                      alt=""
                      className="w-full h-full object-contain p-0.5"
                    />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1">
                      {player.id === leaderId && <Crown className="w-3 h-3 shrink-0" aria-label="Leader" />}
                      <span className="font-medium text-xs text-[var(--text-primary)] truncate max-w-[90px]">
                        {player.name}
                      </span>
                      {player.id === roomState.currentDrawerId && (
                        <Edit3 className="w-3 h-3 shrink-0" aria-label="Drawing" />
                      )}
                    </div>
                    {player.guessedThisRound && (
                      <span className="text-[10px] font-mono text-green-400 font-semibold">Guessed!</span>
                    )}
                  </div>
                </div>

                <span className="font-mono font-bold text-sm text-[var(--text-primary)] tabular-nums shrink-0">
                  {player.score}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: Canvas Board & Toolbar */}
        <section className="flex flex-col min-h-0 gap-2 md:col-span-3 lg:col-span-6">
          <div className="flex-1 min-h-[140px]">
            <CanvasBoard
              model={drawingModel}
              isReadOnly={!isDrawer || !isDrawingPhase}
              tool={tool}
              color={color}
              size={size}
              showGridDots={true}
              onStrokeFinished={(op) => {
                if (isDrawer) {
                  onSubmitStroke(op);
                }
              }}
            />
          </div>

          {/* Toolbar (Only interactable for drawer during DRAWING phase) */}
          {isDrawer && isDrawingPhase && (
            <div className="shrink-0">
              <DrawingToolbar
                tool={tool}
                color={color}
                size={size}
                canUndo={canUndo}
                canRedo={canRedo}
                onSelectTool={(t) => setTool(t)}
                onSelectColor={(c) => setColor(c)}
                onSelectSize={(s) => setSize(s)}
                onUndo={() => drawingModel.undo()}
                onRedo={() => drawingModel.redo()}
                onClear={onClearBoard}
              />
            </div>
          )}
        </section>

        {/* Right / Bottom: Live Chat & Guessing Panel */}
        <section
          className="flex flex-col min-h-0 glass-panel p-2.5 sm:p-4 md:col-span-2 lg:col-span-3"
          aria-label="Chat and guessing"
        >
          <div className="shrink-0 flex items-center justify-between border-b border-[var(--border)] pb-2 mb-2">
            <span className="font-mono text-[10px] sm:text-xs uppercase text-[var(--text-secondary)]">
              Live Chat &amp; Guesses
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono text-[var(--text-muted)]">Demo mode</span>
          </div>

          {/* Messages Feed */}
          <div
            ref={chatContainerRef}
            className="overflow-y-auto space-y-2 pr-1 font-mono text-xs max-h-[18vh] md:max-h-none md:flex-1 md:min-h-0"
            role="log"
            aria-live="polite"
          >
            {roomState.chatMessages.length === 0 && (
              <p className="text-[var(--text-muted)] font-sans text-xs py-2 text-center">
                Guesses and messages will appear here.
              </p>
            )}
            {roomState.chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-xl transition-all ${
                  msg.isSuccess
                    ? 'bg-green-950/40 border border-green-800/60 text-green-200'
                    : msg.isClose
                    ? 'bg-amber-950/40 border border-amber-800/60 text-amber-200'
                    : msg.isSystem
                    ? 'bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-secondary)] font-sans'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={`truncate ${msg.isSystem ? 'font-medium' : 'font-bold text-[var(--text-primary)]'}`}
                  >
                    {msg.senderName}:
                  </span>
                  <time
                    dateTime={new Date(msg.timestamp).toISOString()}
                    className="shrink-0 text-[9px] text-[var(--text-muted)] font-sans"
                  >
                    {formatTime(msg.timestamp)}
                  </time>
                </div>
                <span className="break-words">{msg.text}</span>
              </div>
            ))}
          </div>

          {/* Guess Input Form */}
          <form onSubmit={handleGuessSubmit} className="shrink-0 pt-2 mt-2 border-t border-[var(--border)] flex gap-2 items-center">
            <label htmlFor="guess-input" className="sr-only">
              Type your guess
            </label>
            <input
              id="guess-input"
              type="text"
              enterKeyHint="send"
              autoComplete="off"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              disabled={guessDisabled}
              maxLength={60}
              placeholder={
                isDrawer
                  ? 'You are drawing!'
                  : currentUser?.guessedThisRound
                  ? 'You guessed it!'
                  : !isDrawingPhase
                  ? 'Waiting for round…'
                  : 'Type your guess…'
              }
              className="flex-1 min-w-0 min-h-11 px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-strong)] disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={guessDisabled || !guessInput.trim()}
              className="shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] disabled:opacity-30 transition-transform hover:scale-105 active:scale-95"
              aria-label="Send guess"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      </div>

      {/* Drawer Word Selection Overlay Modal */}
      {isDrawer && roomState.phase === 'WORD_SELECTION' && (
        <div
          className="fixed inset-0 z-50 bg-[var(--glass-modal)] backdrop-blur-md flex items-center justify-center p-4"
          style={{ paddingBottom: `max(1rem, env(safe-area-inset-bottom, 0px))` }}
          role="dialog"
          aria-modal="true"
          aria-label="Choose a secret word"
        >
          <div className="glass-panel-strong max-w-md w-full p-6 text-center space-y-6 rounded-2xl border border-[var(--border-strong)] animate-pulse-subtle">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-[var(--text-secondary)]">Your turn to draw</span>
              <h3 className="font-display font-bold text-3xl text-[var(--text-primary)]">Choose a Secret Word</h3>
              <p className="text-xs text-[var(--text-secondary)] font-mono">
                Selection auto-closes in {roomState.timeRemaining}s
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {roomState.wordChoices.map((word, idx) => (
                <button
                  key={word}
                  type="button"
                  onClick={() => {
                    playSound('click');
                    onSelectWord(idx);
                  }}
                  className="min-h-11 py-4 px-6 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] font-bold text-lg uppercase tracking-wider transition-transform hover:scale-105 active:scale-95 shadow"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Round End Results Banner Overlay */}
      {roomState.phase === 'ROUND_RESULTS' && (
        <div
          className="fixed inset-0 z-50 bg-[var(--glass-modal)] backdrop-blur-md flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Round results"
        >
          <div className="glass-panel-strong max-w-md w-full p-8 text-center space-y-6 rounded-2xl border border-[var(--border-strong)]">
            <div className="flex flex-col items-center gap-3">
              <img
                src={assetUrl('game-status', 'round-over')}
                alt=""
                className="w-48 h-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-widest">
                Round Finished
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] space-y-1">
              <span className="text-xs font-mono text-[var(--text-secondary)]">The secret word was</span>
              <div className="font-display font-bold text-3xl text-[var(--text-primary)] uppercase">
                {roomState.wordChoices[0] || 'Secret Word'}
              </div>
            </div>

            <div className="text-xs font-mono text-[var(--text-secondary)]">
              Next round starting in {roomState.timeRemaining}s...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
