export enum SegmentType {
  START_PAD = 'START_PAD',
  BASIC_SPIKE = 'BASIC_SPIKE',
  DOUBLE_SPIKE = 'DOUBLE_SPIKE',
  TRIPLE_SPIKE = 'TRIPLE_SPIKE',
  PLATFORM_JUMP = 'PLATFORM_JUMP',
  STAIRS_UP = 'STAIRS_UP',
  STAIRS_DOWN = 'STAIRS_DOWN',
  GHOST_JUMP = 'GHOST_JUMP',
  SHIP_GATE = 'SHIP_GATE',
  SHIP_STRAIGHT = 'SHIP_STRAIGHT',
  REST_AREA = 'REST_AREA'
}

export enum Difficulty {
  EASY = 'Easy',
  NORMAL = 'Normal',
  HARD = 'Hard',
  HARDER = 'Harder',
  INSANE = 'Insane'
}

export interface LevelSegment {
  type: SegmentType;
  count?: number; // Repetition or height
  yOffset?: number; // Vertical shift preference
}

export interface GeneratedLevel {
  name: string;
  description: string;
  data: string; // The raw GD level string
  segments: LevelSegment[];
}

export interface GDObject {
  id: number;
  x: number;
  y: number;
  [key: number]: string | number; // Extra properties
}
