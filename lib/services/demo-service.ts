import { ASSET_MANIFEST } from '../assets';
import { BotPlayer, createBotPlayers, getRandomWrongGuess, generateProceduralBotStrokes } from '../engine/bots';
import { evaluateGuess } from '../engine/guess';
import { calculateDrawerPoints, calculateGuesserPoints } from '../engine/scoring';
import { globalTimerManager } from '../engine/timers';
import { Difficulty, getWordCategory, maskWord, pickWords } from '../engine/words';
import { DrawOperation } from '../canvas/drawing-model';
import { play } from '../sound';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  score: number;
  guessedThisRound: boolean;
  isHost: boolean;
  isDrawing: boolean;
  skill?: number;
}

export interface RoomSettings {
  rounds: number; // 2 to 8
  drawTime: number; // 30 to 120s
  difficulty: Difficulty;
  hints: boolean;
  botCount: number; // 1 to 7
  isPractice?: boolean;
}

export type GamePhase =
  | 'HOME'
  | 'SETUP'
  | 'LOBBY'
  | 'WORD_SELECTION'
  | 'DRAWING'
  | 'ROUND_RESULTS'
  | 'GAME_RESULTS';

export interface ChatMessage {
  id: string;
  senderId?: string;
  senderName: string;
  text: string;
  isSystem?: boolean;
  isSuccess?: boolean;
  isClose?: boolean;
  timestamp: number;
}

export interface RoomState {
  code: string;
  phase: GamePhase;
  hostId: string;
  players: Player[];
  settings: RoomSettings;
  currentRound: number;
  totalRounds: number;
  currentDrawerId: string | null;
  wordChoices: string[];
  wordCategory: string;
  maskedWord: string;
  timeRemaining: number;
  drawTimeTotal: number;
  chatMessages: ChatMessage[];
  lastGuesserPoints: Record<string, number>;
  ops: DrawOperation[];
  winnerPlayer?: Player;
}

type EventCallback = (data: any) => void;

class EventEmitter {
  private events: Map<string, EventCallback[]> = new Map();

  public on(event: string, cb: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(cb);
    return () => this.off(event, cb);
  }

  public off(event: string, cb: EventCallback): void {
    if (!this.events.has(event)) return;
    const filtered = this.events.get(event)!.filter((c) => c !== cb);
    this.events.set(event, filtered);
  }

  public emit(event: string, data?: any): void {
    if (this.events.has(event)) {
      this.events.get(event)!.forEach((cb) => cb(data));
    }
  }
}

export class DemoService extends EventEmitter {
  private state: RoomState;
  private secretWord: string = '';
  private drawerOrder: string[] = [];
  private drawerIndex: number = 0;
  private roundGuesserPointsList: number[] = [];
  private revealedIndices: Set<number> = new Set();
  private userPlayerId: string = 'user-local-1';

  constructor() {
    super();
    this.state = this.getInitialState();
  }

  private getInitialState(): RoomState {
    return {
      code: 'SD-' + Math.floor(1000 + Math.random() * 9000),
      phase: 'HOME',
      hostId: this.userPlayerId,
      players: [
        {
          id: this.userPlayerId,
          name: 'SpaceCadet',
          avatar: 'astronaut',
          isBot: false,
          score: 0,
          guessedThisRound: false,
          isHost: true,
          isDrawing: false,
        },
      ],
      settings: {
        rounds: 3,
        drawTime: 60,
        difficulty: 'mixed',
        hints: true,
        botCount: 3,
        isPractice: false,
      },
      currentRound: 1,
      totalRounds: 3,
      currentDrawerId: null,
      wordChoices: [],
      wordCategory: '',
      maskedWord: '',
      timeRemaining: 60,
      drawTimeTotal: 60,
      chatMessages: [],
      lastGuesserPoints: {},
      ops: [],
    };
  }

  public getState(): RoomState {
    return { ...this.state, players: this.state.players.map((p) => ({ ...p })) };
  }

  public setUserProfile(name: string, avatar: string): void {
    const user = this.state.players.find((p) => p.id === this.userPlayerId);
    if (user) {
      user.name = name || 'SpaceCadet';
      user.avatar = avatar || 'astronaut';
    }
    this.emit('room:updated', this.getState());
  }

  public createRoom(settings: Partial<RoomSettings>): RoomState {
    globalTimerManager.clearAll();
    const roomCode = 'SD-' + Math.floor(1000 + Math.random() * 9000);
    const user = this.state.players.find((p) => p.id === this.userPlayerId) || {
      id: this.userPlayerId,
      name: 'SpaceCadet',
      avatar: 'astronaut',
      isBot: false,
      score: 0,
      guessedThisRound: false,
      isHost: true,
      isDrawing: false,
    };

    user.isHost = true;
    user.score = 0;
    user.guessedThisRound = false;
    user.isDrawing = false;

    const mergedSettings: RoomSettings = {
      rounds: settings.rounds ?? 3,
      drawTime: settings.drawTime ?? 60,
      difficulty: settings.difficulty ?? 'mixed',
      hints: settings.hints ?? true,
      botCount: settings.botCount ?? 3,
      isPractice: settings.isPractice ?? false,
    };

    const bots = mergedSettings.isPractice ? [] : createBotPlayers(mergedSettings.botCount, [user.name]);

    this.state = {
      code: roomCode,
      phase: 'LOBBY',
      hostId: user.id,
      players: [user, ...bots],
      settings: mergedSettings,
      currentRound: 1,
      totalRounds: mergedSettings.rounds,
      currentDrawerId: null,
      wordChoices: [],
      wordCategory: '',
      maskedWord: '',
      timeRemaining: mergedSettings.drawTime,
      drawTimeTotal: mergedSettings.drawTime,
      chatMessages: [
        {
          id: `msg-${Date.now()}`,
          senderName: 'System',
          text: `Room ${roomCode} created. All simulated players joined.`,
          isSystem: true,
          timestamp: Date.now(),
        },
      ],
      lastGuesserPoints: {},
      ops: [],
    };

    play('player-join');
    this.emit('room:updated', this.getState());
    return this.getState();
  }

  public updateSettings(patch: Partial<RoomSettings>): void {
    if (this.state.phase !== 'LOBBY') return;
    this.state.settings = { ...this.state.settings, ...patch };
    this.state.totalRounds = this.state.settings.rounds;

    // Update bots list if bot count changed
    const user = this.state.players.find((p) => !p.isBot)!;
    const currentBotCount = this.state.players.filter((p) => p.isBot).length;
    if (patch.botCount !== undefined && patch.botCount !== currentBotCount) {
      const newBots = createBotPlayers(patch.botCount, [user.name]);
      this.state.players = [user, ...newBots];
    }

    this.emit('room:updated', this.getState());
  }

  public startGame(): void {
    if (this.state.phase !== 'LOBBY') return;

    // Reset player scores
    this.state.players.forEach((p) => {
      p.score = 0;
      p.guessedThisRound = false;
      p.isDrawing = false;
    });

    this.state.currentRound = 1;
    this.drawerOrder = [...this.state.players.map((p) => p.id)].sort(() => Math.random() - 0.5);
    this.drawerIndex = 0;

    this.startRoundCycle();
  }

  private startRoundCycle(): void {
    if (this.drawerIndex >= this.drawerOrder.length) {
      // Completed one full round cycle
      if (this.state.currentRound >= this.state.totalRounds) {
        this.endGame();
        return;
      } else {
        this.state.currentRound += 1;
        this.drawerOrder = [...this.state.players.map((p) => p.id)].sort(() => Math.random() - 0.5);
        this.drawerIndex = 0;
      }
    }

    const drawerId = this.drawerOrder[this.drawerIndex];
    this.state.currentDrawerId = drawerId;
    this.roundGuesserPointsList = [];
    this.revealedIndices = new Set();
    this.state.ops = [];
    this.state.lastGuesserPoints = {};

    this.state.players.forEach((p) => {
      p.isDrawing = p.id === drawerId;
      p.guessedThisRound = false;
    });

    const choices = pickWords(this.state.settings.difficulty, 3, [this.secretWord]);
    this.state.wordChoices = choices;
    this.state.wordCategory = '';
    this.state.maskedWord = '';
    this.state.phase = 'WORD_SELECTION';
    this.state.timeRemaining = 15;

    const drawer = this.state.players.find((p) => p.id === drawerId)!;

    this.addChatMessage({
      senderName: 'System',
      text: `Round ${this.state.currentRound}/${this.state.totalRounds}: ${drawer.name} is choosing a word!`,
      isSystem: true,
    });

    this.emit('room:updated', this.getState());
    this.emit('round:started', { drawerId, round: this.state.currentRound });
    play('round-start');

    // Word selection countdown
    globalTimerManager.setInterval(
      'word-selection-timer',
      () => {
        this.state.timeRemaining -= 1;
        if (this.state.timeRemaining <= 3 && this.state.timeRemaining > 0) {
          play('tick');
        }
        this.emit('room:updated', this.getState());

        if (this.state.timeRemaining <= 0) {
          globalTimerManager.clearInterval('word-selection-timer');
          this.chooseWord(0); // Pick first word automatically on timeout
        }
      },
      1000
    );

    // If bot is drawer, pick a word in 1.5s
    if (drawer.isBot) {
      globalTimerManager.setTimeout('bot-choose-word', () => {
        if (this.state.phase === 'WORD_SELECTION') {
          globalTimerManager.clearInterval('word-selection-timer');
          const randomChoice = Math.floor(Math.random() * choices.length);
          this.chooseWord(randomChoice);
        }
      }, 1500);
    }
  }

  public chooseWord(index: number): void {
    globalTimerManager.clearTimeout('bot-choose-word');
    globalTimerManager.clearInterval('word-selection-timer');

    if (this.state.phase !== 'WORD_SELECTION') return;

    const word = this.state.wordChoices[index] || this.state.wordChoices[0] || 'star';
    this.secretWord = word;
    // Keep only the chosen word so views (drawer banner, round results) show the real secret.
    this.state.wordChoices = [word];
    this.state.wordCategory = getWordCategory(word);
    this.state.maskedWord = maskWord(this.secretWord, this.revealedIndices);

    this.state.phase = 'DRAWING';
    this.state.timeRemaining = this.state.settings.drawTime;
    this.state.drawTimeTotal = this.state.settings.drawTime;

    const drawer = this.state.players.find((p) => p.id === this.state.currentDrawerId)!;

    this.addChatMessage({
      senderName: 'System',
      text: `${drawer.name} is drawing now!`,
      isSystem: true,
    });

    play('go');
    this.emit('room:updated', this.getState());

    // Main drawing countdown
    globalTimerManager.setInterval(
      'drawing-timer',
      () => {
        this.state.timeRemaining -= 1;

        // Reveal hint letters at 50% and 25% remaining time if enabled
        if (this.state.settings.hints) {
          const ratio = this.state.timeRemaining / this.state.drawTimeTotal;
          if ((Math.abs(ratio - 0.5) < 0.02 || Math.abs(ratio - 0.25) < 0.02) && this.secretWord.length > 2) {
            const unrevealed: number[] = [];
            for (let i = 0; i < this.secretWord.length; i++) {
              if (this.secretWord[i] !== ' ' && !this.revealedIndices.has(i)) {
                unrevealed.push(i);
              }
            }
            if (unrevealed.length > 1) {
              const randIdx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
              this.revealedIndices.add(randIdx);
              this.state.maskedWord = maskWord(this.secretWord, this.revealedIndices);
              this.emit('round:hint', { hint: this.state.maskedWord });
            }
          }
        }

        if (this.state.timeRemaining <= 10 && this.state.timeRemaining > 0) {
          play('timer-warning');
        }

        this.emit('room:updated', this.getState());

        if (this.state.timeRemaining <= 0) {
          this.endRound('Time is up!');
        }
      },
      1000
    );

    // Schedule bot guessing and bot drawing
    this.scheduleBotBehaviors();
  }

  private scheduleBotBehaviors(): void {
    const drawer = this.state.players.find((p) => p.id === this.state.currentDrawerId)!;

    if (drawer.isBot) {
      // Bot is drawing: emit procedural strokes progressively
      const proceduralOps = generateProceduralBotStrokes();
      proceduralOps.forEach((op, idx) => {
        globalTimerManager.setTimeout(
          `bot-draw-stroke-${idx}`,
          () => {
            if (this.state.phase === 'DRAWING') {
              this.state.ops.push(op);
              this.emit('stroke:added', op);
              this.emit('room:updated', this.getState());
            }
          },
          (idx + 1) * 2000
        );
      });
    }

    // Schedule guesses for non-drawing bots
    const botGuessers = this.state.players.filter((p) => p.isBot && p.id !== drawer.id);

    botGuessers.forEach((bot) => {
      // Determine if bot guesses correctly based on skill
      const botSkill = bot.skill ?? 0.5;
      const willGuessCorrect = Math.random() < botSkill;

      if (willGuessCorrect) {
        // Schedule correct guess between 15% and 80% of round time
        const delayFraction = 0.15 + (1 - botSkill) * 0.5 + Math.random() * 0.15;
        const delayMs = delayFraction * this.state.drawTimeTotal * 1000;

        globalTimerManager.setTimeout(
          `bot-guess-correct-${bot.id}`,
          () => {
            if (this.state.phase === 'DRAWING' && !bot.guessedThisRound) {
              this.handleCorrectGuess(bot);
            }
          },
          delayMs
        );
      } else {
        // Post wrong guesses randomly
        globalTimerManager.setTimeout(
          `bot-guess-wrong-${bot.id}`,
          () => {
            if (this.state.phase === 'DRAWING' && !bot.guessedThisRound) {
              this.addChatMessage({
                senderName: bot.name,
                text: getRandomWrongGuess(),
              });
            }
          },
          (0.2 + Math.random() * 0.5) * this.state.drawTimeTotal * 1000
        );
      }
    });
  }

  public submitGuess(text: string, senderId: string = this.userPlayerId): void {
    if (this.state.phase !== 'DRAWING') return;

    const player = this.state.players.find((p) => p.id === senderId);
    if (!player || player.isDrawing || player.guessedThisRound) return;

    const evalResult = evaluateGuess(text, this.secretWord);

    if (evalResult.isExact) {
      this.handleCorrectGuess(player);
    } else if (evalResult.isClose) {
      // Private notification for close match
      if (senderId === this.userPlayerId) {
        this.addChatMessage({
          senderName: 'System',
          text: `'${text}' is super close!`,
          isSystem: true,
          isClose: true,
        });
        play('near-miss');
      }
    } else {
      // Public wrong chat message
      this.addChatMessage({
        senderName: player.name,
        text,
      });
      if (senderId === this.userPlayerId) {
        play('wrong');
      }
    }
  }

  private handleCorrectGuess(player: Player): void {
    player.guessedThisRound = true;

    const isFirstGuesser = this.roundGuesserPointsList.length === 0;
    const points = calculateGuesserPoints({
      timeRemaining: this.state.timeRemaining,
      drawTime: this.state.drawTimeTotal,
      isFirstGuesser,
    });

    player.score += points;
    this.roundGuesserPointsList.push(points);
    this.state.lastGuesserPoints[player.id] = points;

    if (player.id === this.userPlayerId) {
      play('correct');
    }

    this.addChatMessage({
      senderName: 'System',
      text: `${player.name} guessed the word! (+${points} pts)`,
      isSystem: true,
      isSuccess: true,
    });

    this.emit('player:guessed', { player, points });
    this.emit('room:updated', this.getState());

    // Check if all non-drawing players have guessed
    const nonDrawers = this.state.players.filter((p) => p.id !== this.state.currentDrawerId);
    const allGuessed = nonDrawers.every((p) => p.guessedThisRound);

    if (allGuessed) {
      this.endRound('Everyone guessed the word!');
    }
  }

  public submitStroke(op: DrawOperation): void {
    if (this.state.phase !== 'DRAWING') return;
    this.state.ops.push(op);
    this.emit('stroke:added', op);
    this.emit('room:updated', this.getState());
  }

  public clearBoard(): void {
    if (this.state.phase !== 'DRAWING') return;
    this.state.ops.push({
      id: `clear-${Date.now()}`,
      type: 'clear',
      tool: 'eraser',
      color: '#000000',
      size: 0,
      points: [],
    });
    this.emit('board:cleared');
    this.emit('room:updated', this.getState());
  }

  private endRound(reason: string): void {
    globalTimerManager.clearAll();

    // Award points to drawer
    const drawer = this.state.players.find((p) => p.id === this.state.currentDrawerId);
    if (drawer) {
      const drawerPts = calculateDrawerPoints(this.roundGuesserPointsList);
      drawer.score += drawerPts;
      this.state.lastGuesserPoints[drawer.id] = drawerPts;
    }

    this.state.phase = 'ROUND_RESULTS';
    this.state.timeRemaining = 6;

    this.addChatMessage({
      senderName: 'System',
      text: `${reason} The secret word was '${this.secretWord.toUpperCase()}'.`,
      isSystem: true,
    });

    play('round-end');
    this.emit('round:ended', { word: this.secretWord, pointsMap: this.state.lastGuesserPoints });
    this.emit('room:updated', this.getState());

    // Timer to transition to next round or game results
    globalTimerManager.setInterval(
      'round-results-timer',
      () => {
        this.state.timeRemaining -= 1;
        this.emit('room:updated', this.getState());

        if (this.state.timeRemaining <= 0) {
          globalTimerManager.clearInterval('round-results-timer');
          this.drawerIndex += 1;
          this.startRoundCycle();
        }
      },
      1000
    );
  }

  private endGame(): void {
    globalTimerManager.clearAll();
    this.state.phase = 'GAME_RESULTS';

    // Rank players by score descending
    const sorted = [...this.state.players].sort((a, b) => b.score - a.score);
    this.state.winnerPlayer = sorted[0];

    play('winner');
    this.emit('game:ended', { winner: sorted[0], leaderboard: sorted });
    this.emit('room:updated', this.getState());
  }

  public playAgain(): void {
    globalTimerManager.clearAll();
    this.state.phase = 'LOBBY';
    this.state.players.forEach((p) => {
      p.score = 0;
      p.guessedThisRound = false;
      p.isDrawing = false;
    });
    this.state.currentRound = 1;
    this.emit('room:updated', this.getState());
  }

  public leaveRoom(): void {
    globalTimerManager.clearAll();
    play('player-leave');
    this.state = this.getInitialState();
    this.emit('room:updated', this.getState());
  }

  public returnToLobby(): void {
    globalTimerManager.clearAll();
    this.secretWord = '';
    this.state.phase = 'LOBBY';
    this.state.currentDrawerId = null;
    this.state.wordChoices = [];
    this.state.wordCategory = '';
    this.state.maskedWord = '';
    this.state.ops = [];
    this.state.players.forEach((p) => {
      p.guessedThisRound = false;
      p.isDrawing = false;
    });
    this.addChatMessage({
      senderName: 'System',
      text: 'The game was stopped. Everyone returned to the lobby.',
      isSystem: true,
    });
    this.emit('room:updated', this.getState());
  }

  private addChatMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    const fullMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    this.state.chatMessages.push(fullMsg);
    // Keep max 80 chat messages in memory
    if (this.state.chatMessages.length > 80) {
      this.state.chatMessages.shift();
    }
    this.emit('chat:message', fullMsg);
  }

  public getSecretWordForDrawer(): string {
    return this.secretWord;
  }
}

export const demoGameService = new DemoService();
