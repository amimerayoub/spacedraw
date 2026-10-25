export interface WordCategory {
  easy: string[];
  medium: string[];
  hard: string[];
}

export const WORD_BANK: Record<string, WordCategory> = {
  animals: {
    easy: ['cat', 'dog', 'lion', 'bear', 'duck', 'frog', 'fish', 'bird', 'owl', 'wolf'],
    medium: ['penguin', 'elephant', 'dolphin', 'giraffe', 'kangaroo', 'octopus', 'flamingo', 'cheetah', 'hamster', 'peacock'],
    hard: ['chameleon', 'platypus', 'salamander', 'armadillo', 'porcupine', 'woodpecker', 'hedgehog', 'stingray', 'barracuda', 'komodo dragon']
  },
  space: {
    easy: ['star', 'moon', 'sun', 'mars', 'comet', 'rocket', 'alien', 'earth', 'ring', 'ufo'],
    medium: ['astronaut', 'telescope', 'satellite', 'asteroid', 'galaxy', 'meteor', 'black hole', 'spacesuit', 'orbit', 'nebula'],
    hard: ['supernova', 'constellation', 'solar flare', 'space station', 'lightyear', 'event horizon', 'exoplanet', 'quasar', 'interstellar', 'cosmic ray']
  },
  objects: {
    easy: ['book', 'phone', 'clock', 'chair', 'key', 'cup', 'lamp', 'pen', 'door', 'box'],
    medium: ['umbrella', 'scissors', 'backpack', 'guitar', 'camera', 'headphones', 'compass', 'typewriter', 'microscope', 'flashlight'],
    hard: ['accordion', 'kaleidoscope', 'hourglass', 'metronome', 'stethoscope', 'projector', 'gramophone', 'periscope', 'thermometer', 'sundial']
  },
  places: {
    easy: ['park', 'house', 'beach', 'farm', 'zoo', 'school', 'shop', 'bank', 'ship', 'cave'],
    medium: ['castle', 'hospital', 'airport', 'museum', 'pyramid', 'volcano', 'island', 'stadium', 'lighthouse', 'aquarium'],
    hard: ['amphitheater', 'observatory', 'cathedral', 'skyscraper', 'archipelago', 'planetarium', 'spaceport', 'monastery', 'colosseum', 'labyrinth']
  },
  actions: {
    easy: ['run', 'jump', 'sing', 'swim', 'read', 'cook', 'fly', 'dance', 'sleep', 'draw'],
    medium: ['climb', 'juggle', 'skate', 'paint', 'surf', 'balance', 'whistle', 'whisper', 'sneeze', 'sculpt'],
    hard: ['paraglide', 'somersault', 'bungee jump', 'teleport', 'eavesdrop', 'snorkel', 'levitate', 'moonwalk', 'ventriloquise', 'photobomb']
  },
  fantasy: {
    easy: ['dragon', 'ghost', 'magic', 'witch', 'crown', 'sword', 'shield', 'giant', 'demon', 'fairy'],
    medium: ['unicorn', 'wizard', 'vampire', 'mermaid', 'phoenix', 'monster', 'centaur', 'spellbook', 'potion', 'werewolf'],
    hard: ['gargoyle', 'necromancer', 'excalibur', 'basilisk', 'griffin', 'cauldron', 'valkyrie', 'leprechaun', 'minotaur', 'doppelganger']
  }
};

export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export function pickWords(difficulty: Difficulty, count: number = 3, excluding: string[] = []): string[] {
  const allCandidates: string[] = [];
  const excludedSet = new Set(excluding.map(w => w.toLowerCase()));

  for (const category of Object.values(WORD_BANK)) {
    if (difficulty === 'mixed') {
      allCandidates.push(...category.easy, ...category.medium, ...category.hard);
    } else {
      allCandidates.push(...category[difficulty]);
    }
  }

  const validCandidates = allCandidates.filter(w => !excludedSet.has(w.toLowerCase()));
  const shuffled = [...validCandidates].sort(() => Math.random() - 0.5);

  const selected = shuffled.slice(0, count);

  // Fallback if not enough candidates
  while (selected.length < count && allCandidates.length > 0) {
    const randomWord = allCandidates[Math.floor(Math.random() * allCandidates.length)];
    if (!selected.includes(randomWord)) {
      selected.push(randomWord);
    }
  }

  return selected;
}

export function getWordCategory(word: string): string {
  const normalized = word.toLowerCase();
  for (const [category, lists] of Object.entries(WORD_BANK)) {
    if (lists.easy.includes(normalized) || lists.medium.includes(normalized) || lists.hard.includes(normalized)) {
      return category;
    }
  }
  return 'mixed';
}

export function maskWord(word: string, revealedIndices: Set<number> = new Set()): string {
  if (!word) return '';
  return word
    .split('')
    .map((char, index) => {
      if (char === ' ') return '  ';
      if (revealedIndices.has(index)) return char.toUpperCase();
      return '_';
    })
    .join(' ');
}
