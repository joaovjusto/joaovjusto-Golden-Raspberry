import { Movie } from '../models/movie';

export function formatStudioNames(studios: string[]): string {
  return studios.join(', ');
}

export function formatProducerNames(producers: string[]): string {
  return producers.join(', ');
}

export function pageNumbers(currentPage: number, totalPages: number): number[] {
  const firstPage = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
  return Array.from({ length: Math.min(totalPages, 5) }, (_, index) => firstPage + index);
}

export function winnerLabel(movie: Movie): string {
  return movie.winner ? 'Sim' : 'Não';
}
