import { ASSET_MANIFEST } from '../assets';
import { DrawOperation } from '../canvas/drawing-model';

export interface BotPlayer {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  score: number;
  guessedThisRound: boolean;
  isHost: boolean;
  isDrawing: boolean;
  skill: number; // 0.3 to 0.9
}

const BOT_NAMES = [
  'PixelMaster',
  'ArtisticDoodle',
  'SketchQueen',
  'DoodleWizard',
  'PaintBot',
  'CanvasCruiser',
  'ColorCrafter',
  'ScribblePro',
];

const BOT_WRONG_GUESSES = [
  'is it a house?',
  'looks like a circle',
  'maybe a star?',
  'a dog or cat?',
  'pizza?',
  'rocket ship!',
  'castle?',
  'car?',
  'tree?',
  'apple?',
];

export function createBotPlayers(count: number, existingNames: string[] = []): BotPlayer[] {
  const bots: BotPlayer[] = [];
  const usedAvatars = new Set<string>();
  const usedNames = new Set(existingNames.map((n) => n.toLowerCase()));

  for (let i = 0; i < count; i++) {
    const availableNames = BOT_NAMES.filter((n) => !usedNames.has(n.toLowerCase()));
    const name = availableNames.length > 0 ? availableNames[i % availableNames.length] : `Bot_${i + 1}`;
    usedNames.add(name.toLowerCase());

    const availableAvatars = ASSET_MANIFEST.avatars.filter((a) => !usedAvatars.has(a));
    const avatar = availableAvatars.length > 0
      ? availableAvatars[Math.floor(Math.random() * availableAvatars.length)]
      : ASSET_MANIFEST.avatars[i % ASSET_MANIFEST.avatars.length];
    usedAvatars.add(avatar);

    // Skill between 0.4 and 0.85
    const skill = 0.4 + Math.random() * 0.45;

    bots.push({
      id: `bot-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      avatar,
      isBot: true,
      score: 0,
      guessedThisRound: false,
      isHost: false,
      isDrawing: false,
      skill,
    });
  }

  return bots;
}

export function getRandomWrongGuess(): string {
  return BOT_WRONG_GUESSES[Math.floor(Math.random() * BOT_WRONG_GUESSES.length)];
}

export function generateProceduralBotStrokes(): DrawOperation[] {
  const strokeCount = 4 + Math.floor(Math.random() * 4);
  const colors = ['#000000', '#404040', '#808080', '#3B82F6', '#EF4444', '#22C55E', '#EAB308'];
  const sizes = [0.008, 0.014, 0.022];
  const ops: DrawOperation[] = [];

  for (let i = 0; i < strokeCount; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const points: [number, number][] = [];

    const pointCount = 12 + Math.floor(Math.random() * 15);
    const startX = 0.2 + Math.random() * 0.6;
    const startY = 0.2 + Math.random() * 0.6;
    const radius = 0.1 + Math.random() * 0.25;

    for (let j = 0; j < pointCount; j++) {
      const angle = (j / pointCount) * Math.PI * 2;
      const r = radius + (Math.random() - 0.5) * 0.05;
      const x = Math.max(0.05, Math.min(0.95, startX + Math.cos(angle) * r));
      const y = Math.max(0.05, Math.min(0.95, startY + Math.sin(angle) * r));
      points.push([x, y]);
    }

    ops.push({
      id: `bot-op-${i}-${Date.now()}`,
      type: 'stroke',
      tool: 'brush',
      color,
      size,
      points,
    });
  }

  return ops;
}
