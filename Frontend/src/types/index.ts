export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  sampleInput: string;
  sampleOutput: string;
  solutions: Solution[];
  status: "Not Started" | "In Progress" | "Solved";
  createdAt: string;
  updatedAt: string;
}

export interface Solution {
  id: string;
  language: string;
  code: string;
  explanation: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  streak: number;
  totalSolved: number;
  totalPracticeTime: number;
  joinedAt: string;
}