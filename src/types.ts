/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Topic {
  id: string;
  name: string;
  icon: string;
}

export type TaskFormat = 'quiz' | 'input';

export interface Task {
  id: string;
  topicId: string;
  format: TaskFormat;
  typeCode: string; // e.g. 'Q' for Quiz, 'S', 'C', 'R', etc. for SCAMPER
  typeLabel: string; // e.g. "S - Thay thế (Substitute)"
  question: string;
  // Quiz specific fields
  options?: string[];
  correctIndex?: number;
  // SCAMPER input specific fields
  placeholder?: string;
  answers?: string[]; // Standard offline acceptable answers, but AI validation will be smarter
  successMsg: string;
  isAiGenerated?: boolean;
}

export interface ValidationResponse {
  isValid: boolean;
  explanation: string;
  xpEarned: number;
}

export interface VideoPost {
  id: string;
  username: string;
  title: string;
  category: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  bgGradient: string;
}

export interface UserProgress {
  score: number;
  totalWords: number;
  completedTasks: string[]; // Task IDs
  unlockedBadges: string[]; // Badge IDs
  soundEnabled: boolean;
}

export interface XpHistoryPoint {
  date: string;
  xp: number;
}

export interface Badge {
  id: string;
  title: string;
  icon: string;
  description: string;
  xpRequired: number;
}
