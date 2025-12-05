export interface AnswerOption {
  id: string;
  label: string;
  next?: string;
  autoRefine?: boolean;
}

export interface WeightAttribute {
  id: string;
  label: string;
  template: string;
  min: number;
  max: number;
  step: number;
  default: number;
  tags?: string[];
}

export interface RefinementNode {
  id: string;
  question: string;
  answers: AnswerOption[];
  weights?: WeightAttribute[];
}

export interface InterviewNode {
  id: string;
  question: string;
  description?: string;
  answers?: AnswerOption[]; // Optional for weight-only nodes
  refinements?: RefinementNode[];
  weights?: WeightAttribute[];
}



