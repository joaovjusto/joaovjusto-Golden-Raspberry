import { Movie } from '../models/movie';
import { formatProducerNames, formatStudioNames, pageNumbers, winnerLabel } from './movie-insights';

describe('movie insights', () => {
  it('formats lists for table cells', () => {
    expect(formatStudioNames(['Studio A', 'Studio B'])).toBe('Studio A, Studio B');
    expect(formatProducerNames(['Producer A'])).toBe('Producer A');
  });

  it('keeps pagination within five visible pages', () => {
    expect(pageNumbers(0, 10)).toEqual([0, 1, 2, 3, 4]);
    expect(pageNumbers(6, 10)).toEqual([4, 5, 6, 7, 8]);
    expect(pageNumbers(0, 2)).toEqual([0, 1]);
  });

  it('labels the winner state', () => {
    const winner: Movie = { id: 1, year: 2000, title: 'Film', studios: [], producers: [], winner: true };
    expect(winnerLabel(winner)).toBe('Sim');
    expect(winnerLabel({ ...winner, winner: false })).toBe('Não');
  });
});
