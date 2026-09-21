import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MoviesComponent } from './movies';
import { MoviesApiService } from '../core/services/movies-api.service';
import { Movie, PagedResponse } from '../core/models/movie';

const movie: Movie = {
  id: 1,
  year: 2000,
  title: 'Film',
  studios: ['Studio A'],
  producers: ['Producer A'],
  winner: true,
};

const response: PagedResponse<Movie> = {
  content: [movie],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 10,
  first: true,
  last: true,
};

describe('MoviesComponent', () => {
  let fixture: ComponentFixture<MoviesComponent>;

  function createComponent(listMovies: MoviesApiService['listMovies']): MoviesComponent {
    TestBed.configureTestingModule({
      imports: [MoviesComponent],
      providers: [{ provide: MoviesApiService, useValue: { listMovies } }],
    });
    fixture = TestBed.createComponent(MoviesComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('loads the first page on init', () => {
    const requests: unknown[][] = [];
    const component = createComponent((...args) => {
      requests.push(args);
      return of(response);
    });

    expect(requests).toEqual([[0, 10, undefined, undefined]]);
    expect(component.movies()).toEqual([movie]);
    expect(component.totalElements()).toBe(1);
    expect(component.isLoading()).toBe(false);
  });

  it('does not query the API when the year filter is invalid', () => {
    let requestCount = 0;
    const component = createComponent(() => {
      requestCount += 1;
      return of(response);
    });

    component.yearFilter = 'not-a-year';
    component.applyFilters();

    expect(requestCount).toBe(1);
    expect(component.filterError()).toContain('ano válido');
  });

  it('sends valid filters and resets pagination', () => {
    const requests: unknown[][] = [];
    const component = createComponent((...args) => {
      requests.push(args);
      return of({ ...response, number: args[0] as number });
    });

    component.currentPage.set(2);
    component.yearFilter = 2018;
    component.winnerFilter = 'true';
    component.applyFilters();

    expect(requests.at(-1)).toEqual([0, 10, 2018, true]);
    expect(component.currentPage()).toBe(0);
    expect(component.filterError()).toBe('');
  });

  it('requests a selected page and exposes API errors', () => {
    const requests: unknown[][] = [];
    const component = createComponent((...args) => {
      requests.push(args);
      return requests.length === 1
        ? of({ ...response, totalPages: 3 })
        : throwError(() => new Error('network error'));
    });

    component.goToPage(1);

    expect(requests.at(-1)).toEqual([1, 10, undefined, undefined]);
    expect(component.errorMessage()).toContain('carregar');
    expect(component.isLoading()).toBe(false);
  });
});
