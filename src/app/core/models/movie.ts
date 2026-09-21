export interface Movie {
  id: number;
  year: number;
  title: string;
  studios: string[];
  producers: string[];
  winner: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface MultipleWinnerYear { year: number; winnerCount: number; }
export interface StudioWinCount { name: string; winCount: number; }
export interface ProducerInterval { producer: string; interval: number; previousWin: number; followingWin: number; }
export interface ProducerIntervals { min: ProducerInterval[]; max: ProducerInterval[]; }
