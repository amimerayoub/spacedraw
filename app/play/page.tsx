'use client';

import React from 'react';
import { Navbar } from '../../components/Navbar';
import { LandingView } from '../../components/LandingView';
import { SetupView } from '../../components/SetupView';
import { LobbyView } from '../../components/LobbyView';
import { GameView } from '../../components/GameView';
import { ResultsView } from '../../components/ResultsView';
import { SettingsModal } from '../../components/SettingsModal';
import { FooterModals } from '../../components/FooterModals';
import { Toast } from '../../components/Toast';

import { gameService, RoomState, RoomSettings } from '../../lib/services/game-service';
import { DrawingModel, DrawOperation } from '../../lib/canvas/drawing-model';
import { getItem, setItem } from '../../lib/storage';
import { useKeyboardInset } from '../../hooks/use-mobile';

export default function SpaceDrawPage() {
  const [theme, setTheme] = React.useState<'dark' | 'light'>(() => getItem<'dark' | 'light'>('theme', 'dark'));
  const [reducedMotion, setReducedMotion] = React.useState<boolean>(() => getItem<boolean>('reducedMotion', false));
  const [nickname, setNickname] = React.useState<string>(() => {
    const savedProfile = getItem<{ name: string; avatar: string }>('profile', {
      name: 'SpaceCadet',
      avatar: 'astronaut',
    });
    return savedProfile.name;
  });
  const [avatar, setAvatar] = React.useState<string>(() => {
    const savedProfile = getItem<{ name: string; avatar: string }>('profile', {
      name: 'SpaceCadet',
      avatar: 'astronaut',
    });
    return savedProfile.avatar;
  });

  const [roomState, setRoomState] = React.useState<RoomState>(gameService.getState());
  const [drawingModel] = React.useState<DrawingModel>(() => new DrawingModel());

  const [view, setView] = React.useState<'home' | 'setup' | 'lobby' | 'game' | 'results'>('home');
  const [settingsOpen, setSettingsOpen] = React.useState<boolean>(false);
  const [activeFooterModal, setActiveFooterModal] = React.useState<'about' | 'rules' | 'privacy' | 'credits' | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Sync DOM attributes and user profile
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  React.useEffect(() => {
    gameService.setUserProfile(nickname, avatar);
  }, [nickname, avatar]);

  React.useEffect(() => {
    if (reducedMotion) {
      document.documentElement.setAttribute('data-motion', 'reduced');
    } else {
      document.documentElement.removeAttribute('data-motion');
    }
  }, [reducedMotion]);

  // Listen to gameService room updates
  React.useEffect(() => {
    const unsubscribe = gameService.on('room:updated', (newState: RoomState) => {
      setRoomState(newState);

      // Auto view transition based on state phase
      if (newState.phase === 'LOBBY' && view !== 'lobby') {
        setView('lobby');
      } else if ((newState.phase === 'WORD_SELECTION' || newState.phase === 'DRAWING' || newState.phase === 'ROUND_RESULTS') && view !== 'game') {
        setView('game');
      } else if (newState.phase === 'GAME_RESULTS' && view !== 'results') {
        setView('results');
      } else if (newState.phase === 'HOME' && view !== 'home') {
        setView('home');
      }
    });

    return unsubscribe;
  }, [view]);

  // Mirror remote (bot) strokes into the local drawing model and reset the board per round
  React.useEffect(() => {
    const offStroke = gameService.on('stroke:added', (op: DrawOperation) => {
      drawingModel.addExternalOp(op);
    });
    const offRound = gameService.on('round:started', () => {
      drawingModel.reset();
    });
    return () => {
      offStroke();
      offRound();
    };
  }, [drawingModel]);

  // Theme Toggler
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    setItem('theme', nextTheme);
  };

  // Motion Toggler
  const handleToggleReducedMotion = () => {
    const nextMotion = !reducedMotion;
    setReducedMotion(nextMotion);
    if (nextMotion) {
      document.documentElement.setAttribute('data-motion', 'reduced');
    } else {
      document.documentElement.removeAttribute('data-motion');
    }
    setItem('reducedMotion', nextMotion);
  };

  // Profile Change Handlers
  const handleNicknameChange = (name: string) => {
    setNickname(name);
    setItem('profile', { name, avatar });
    gameService.setUserProfile(name, avatar);
  };

  const handleAvatarChange = (av: string) => {
    setAvatar(av);
    setItem('profile', { name: nickname, avatar: av });
    gameService.setUserProfile(nickname, av);
  };

  // Game Flow Actions
  const handlePlayNow = () => {
    setView('setup');
  };

  const handleCreateRoom = () => {
    gameService.createRoom(roomState.settings);
    setView('lobby');
  };

  const handleJoinRoom = (code: string) => {
    gameService.createRoom({ ...roomState.settings, botCount: 2 });
    setToastMessage(`Joined room ${code}`);
    setView('lobby');
  };

  const handleStartPractice = () => {
    gameService.createRoom({ ...roomState.settings, botCount: 0, isPractice: true });
    gameService.startGame();
    drawingModel.reset();
    setView('game');
  };

  const handleStartGame = () => {
    drawingModel.reset();
    gameService.startGame();
    setView('game');
  };

  const handleLeaveRoom = () => {
    gameService.leaveRoom();
    drawingModel.reset();
    setView('home');
  };

  const handleBackToLobby = () => {
    gameService.returnToLobby();
    drawingModel.reset();
    setView('lobby');
  };

  const handlePlayAgain = () => {
    drawingModel.reset();
    gameService.playAgain();
    setView('lobby');
  };

  const keyboardInset = useKeyboardInset();
  const isGameView = view === 'game';

  return (
    <div
      className={`${
        isGameView ? 'h-dvh overflow-hidden' : 'min-h-screen'
      } flex flex-col justify-between bg-[var(--bg-primary)] text-[var(--text-primary)]`}
    >
      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setSettingsOpen(true)}
        onGoHome={() => {
          if (view !== 'home') {
            handleLeaveRoom();
          }
        }}
      />

      <main
        className={`flex-1 flex flex-col ${
          isGameView ? 'min-h-0 overflow-hidden p-1.5 sm:p-4' : 'items-center justify-center p-2 sm:p-4'
        }`}
        style={
          isGameView
            ? {
                paddingBottom: `calc(${keyboardInset}px + env(safe-area-inset-bottom, 0px) + 0.375rem)`,
              }
            : undefined
        }
      >
        {view === 'home' && (
          <LandingView
            onPlayNow={handlePlayNow}
            onCreateRoom={() => setView('setup')}
            onOpenFooterModal={(modal) => setActiveFooterModal(modal)}
          />
        )}

        {view === 'setup' && (
          <SetupView
            nickname={nickname}
            avatar={avatar}
            settings={roomState.settings}
            onChangeNickname={handleNicknameChange}
            onChangeAvatar={handleAvatarChange}
            onChangeSettings={(patch) => gameService.updateSettings(patch)}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onStartPractice={handleStartPractice}
          />
        )}

        {view === 'lobby' && (
          <LobbyView
            roomState={roomState}
            onStartGame={handleStartGame}
            onLeaveRoom={handleLeaveRoom}
            onUpdateSettings={(patch) => gameService.updateSettings(patch)}
            onShowToast={(msg) => setToastMessage(msg)}
          />
        )}

        {view === 'game' && (
          <GameView
            roomState={roomState}
            drawingModel={drawingModel}
            currentUserId="user-local-1"
            onSelectWord={(idx) => gameService.chooseWord(idx)}
            onSubmitGuess={(txt) => gameService.submitGuess(txt)}
            onSubmitStroke={(op) => gameService.submitStroke(op)}
            onClearBoard={() => {
              drawingModel.clearBoard();
              gameService.clearBoard();
            }}
            onBack={handleBackToLobby}
          />
        )}

        {view === 'results' && (
          <ResultsView
            roomState={roomState}
            onPlayAgain={handlePlayAgain}
            onReturnToLobby={() => setView('lobby')}
            onGoHome={handleLeaveRoom}
          />
        )}
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        theme={theme}
        reducedMotion={reducedMotion}
        onClose={() => setSettingsOpen(false)}
        onToggleTheme={handleToggleTheme}
        onToggleReducedMotion={handleToggleReducedMotion}
        onShowToast={(msg) => setToastMessage(msg)}
      />

      <FooterModals
        activeModal={activeFooterModal}
        onClose={() => setActiveFooterModal(null)}
      />

      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
    </div>
  );
}
