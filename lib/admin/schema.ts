export interface SiteConfig {
  schemaVersion: number;
  content: {
    heroTitle: string;
    heroSubtitle: string;
    playButtonText: string;
    createRoomButtonText: string;
    features: Array<{ id: string; title: string; description: string; icon: string }>;
    pages: {
      about: string;
      privacy: string;
      rules: string;
      credits: string;
    };
  };
  gameRules: {
    rounds: number;
    drawTime: number;
    botCount: number;
    hints: boolean;
    wordChoicesCount: number;
    scoring: {
      guesserBase: number;
      guesserTimeFactor: number;
      firstGuesserBonus: number;
      drawerMultiplier: number;
      drawerCap: number;
    };
    chatCooldownMs: number;
  };
  flags: {
    chat: boolean;
    practice: boolean;
    sound: boolean;
    bots: boolean;
    hints: boolean;
    fillTool: boolean;
    eyedropper: boolean;
    maintenance: {
      on: boolean;
      message: string;
      endsAt: string | null;
    };
  };
  theme: {
    density: 'comfortable' | 'compact';
    tokens: Record<string, string>;
  };
  moderation: {
    blocklist: {
      nicknames: string[];
      chatWords: string[];
      gameWords: string[];
    };
  };
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  schemaVersion: 1,
  content: {
    heroTitle: 'SpaceDraw',
    heroSubtitle: 'A minimalist drawing and guessing game. Express your creativity, guess secret words, and compete in real-time.',
    playButtonText: 'Play Now',
    createRoomButtonText: 'Create Room',
    features: [
      {
        id: 'f1',
        title: 'Monochrome Design System',
        description: 'High contrast, glassmorphic aesthetics, and clean typography built strictly in black, white, and neutral tones.',
        icon: 'palette',
      },
      {
        id: 'f2',
        title: 'Simulated Multiplayer & Bots',
        description: 'Play instantly with realistic AI bot players that guess, chat, and draw with customizable difficulty settings.',
        icon: 'users',
      },
      {
        id: 'f3',
        title: 'Precision Drawing Engine',
        description: 'Smooth quadratic curves, high-DPI scaling, eraser destination-out mode, undo/redo stacks, and responsive sizing.',
        icon: 'zap',
      },
    ],
    pages: {
      about: 'SpaceDraw is a real-time drawing and guessing multiplayer game designed with a cinematic, glassmorphic monochrome interface.',
      rules: '1. The artist picks a word and draws it. 2. Guessers type guesses in live chat. 3. Fast correct guesses earn higher points.',
      privacy: 'All profiles and game rooms are simulated locally in your browser. No personal data is transmitted.',
      credits: 'Designed for Google AI Studio SpaceDraw Platform. Built with Next.js, Web Audio API, and Tailwind CSS.',
    },
  },
  gameRules: {
    rounds: 3,
    drawTime: 60,
    botCount: 3,
    hints: true,
    wordChoicesCount: 3,
    scoring: {
      guesserBase: 100,
      guesserTimeFactor: 400,
      firstGuesserBonus: 50,
      drawerMultiplier: 0.5,
      drawerCap: 250,
    },
    chatCooldownMs: 400,
  },
  flags: {
    chat: true,
    practice: true,
    sound: true,
    bots: true,
    hints: true,
    fillTool: true,
    eyedropper: true,
    maintenance: {
      on: false,
      message: 'SpaceDraw is undergoing scheduled maintenance. Please check back shortly.',
      endsAt: null,
    },
  },
  theme: {
    density: 'comfortable',
    tokens: {
      bgPrimary: '#000000',
      bgSecondary: '#0D0D0D',
      bgTertiary: '#171717',
      textPrimary: '#FFFFFF',
      textSecondary: '#A3A3A3',
    },
  },
  moderation: {
    blocklist: {
      nicknames: ['admin', 'owner', 'root', 'system'],
      chatWords: ['badword1', 'badword2'],
      gameWords: [],
    },
  },
};

export function validateSiteConfig(config: any): { valid: boolean; errors: string[]; sanitized: SiteConfig } {
  const errors: string[] = [];

  if (!config || typeof config !== 'object') {
    return { valid: false, errors: ['Config must be an object'], sanitized: DEFAULT_SITE_CONFIG };
  }

  const schemaVersion = typeof config.schemaVersion === 'number' ? config.schemaVersion : 1;

  const sanitized: SiteConfig = {
    schemaVersion,
    content: {
      heroTitle: String(config.content?.heroTitle || DEFAULT_SITE_CONFIG.content.heroTitle).trim().slice(0, 50),
      heroSubtitle: String(config.content?.heroSubtitle || DEFAULT_SITE_CONFIG.content.heroSubtitle).trim().slice(0, 200),
      playButtonText: String(config.content?.playButtonText || DEFAULT_SITE_CONFIG.content.playButtonText).trim().slice(0, 30),
      createRoomButtonText: String(config.content?.createRoomButtonText || DEFAULT_SITE_CONFIG.content.createRoomButtonText).trim().slice(0, 30),
      features: Array.isArray(config.content?.features) ? config.content.features.slice(0, 6) : DEFAULT_SITE_CONFIG.content.features,
      pages: {
        about: String(config.content?.pages?.about || DEFAULT_SITE_CONFIG.content.pages.about),
        privacy: String(config.content?.pages?.privacy || DEFAULT_SITE_CONFIG.content.pages.privacy),
        rules: String(config.content?.pages?.rules || DEFAULT_SITE_CONFIG.content.pages.rules),
        credits: String(config.content?.pages?.credits || DEFAULT_SITE_CONFIG.content.pages.credits),
      },
    },
    gameRules: {
      rounds: Math.max(2, Math.min(8, typeof config.gameRules?.rounds === 'number' ? config.gameRules.rounds : DEFAULT_SITE_CONFIG.gameRules.rounds)),
      drawTime: Math.max(30, Math.min(180, typeof config.gameRules?.drawTime === 'number' ? config.gameRules.drawTime : DEFAULT_SITE_CONFIG.gameRules.drawTime)),
      botCount: Math.max(0, Math.min(7, typeof config.gameRules?.botCount === 'number' ? config.gameRules.botCount : DEFAULT_SITE_CONFIG.gameRules.botCount)),
      hints: Boolean(config.gameRules?.hints ?? DEFAULT_SITE_CONFIG.gameRules.hints),
      wordChoicesCount: 3,
      scoring: {
        guesserBase: Number(config.gameRules?.scoring?.guesserBase) || 100,
        guesserTimeFactor: Number(config.gameRules?.scoring?.guesserTimeFactor) || 400,
        firstGuesserBonus: Number(config.gameRules?.scoring?.firstGuesserBonus) || 50,
        drawerMultiplier: Number(config.gameRules?.scoring?.drawerMultiplier) || 0.5,
        drawerCap: Number(config.gameRules?.scoring?.drawerCap) || 250,
      },
      chatCooldownMs: Number(config.gameRules?.chatCooldownMs) || 400,
    },
    flags: {
      chat: Boolean(config.flags?.chat ?? true),
      practice: Boolean(config.flags?.practice ?? true),
      sound: Boolean(config.flags?.sound ?? true),
      bots: Boolean(config.flags?.bots ?? true),
      hints: Boolean(config.flags?.hints ?? true),
      fillTool: Boolean(config.flags?.fillTool ?? true),
      eyedropper: Boolean(config.flags?.eyedropper ?? true),
      maintenance: {
        on: Boolean(config.flags?.maintenance?.on ?? false),
        message: String(config.flags?.maintenance?.message || DEFAULT_SITE_CONFIG.flags.maintenance.message),
        endsAt: config.flags?.maintenance?.endsAt ? String(config.flags.maintenance.endsAt) : null,
      },
    },
    theme: {
      density: config.theme?.density === 'compact' ? 'compact' : 'comfortable',
      tokens: config.theme?.tokens || DEFAULT_SITE_CONFIG.theme.tokens,
    },
    moderation: {
      blocklist: {
        nicknames: Array.isArray(config.moderation?.blocklist?.nicknames) ? config.moderation.blocklist.nicknames : DEFAULT_SITE_CONFIG.moderation.blocklist.nicknames,
        chatWords: Array.isArray(config.moderation?.blocklist?.chatWords) ? config.moderation.blocklist.chatWords : DEFAULT_SITE_CONFIG.moderation.blocklist.chatWords,
        gameWords: Array.isArray(config.moderation?.blocklist?.gameWords) ? config.moderation.blocklist.gameWords : DEFAULT_SITE_CONFIG.moderation.blocklist.gameWords,
      },
    },
  };

  return { valid: errors.length === 0, errors, sanitized };
}
