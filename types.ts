export type ViewState = 'dashboard' | 'report' | 'annotation';

export interface ExamRecord {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  score: number | null;
  status: 'completed' | 'processing';
  icon: 'description' | 'image';
  iconColorClass: string;
  iconBgClass: string;
}

export interface RadarData {
  subject: string;
  A: number;
  fullMark: number;
}

export type CommentType = 'positive' | 'negative';

export interface GradeComment {
  title: string;
  content: string;
  type: CommentType;
}

export interface AnnotationItem {
  originalText: string;
  comment: string;
}

export interface GradeResponse {
  totalScore: number;
  rankPercentile: number;
  dimensions: RadarData[];
  comments: GradeComment[];
  advice: string;
  annotations: AnnotationItem[];
}
