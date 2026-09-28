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
  size: 15,
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

    expect(requests).toEqual([[0, 15, undefined, undefined]]);
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
    expect(component.filterError()).toContain('valid year');
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

    expect(requests.at(-1)).toEqual([0, 15, 2018, true]);
    expect(component.currentPage()).toBe(0);
    expect(component.filterError()).toBe('');
  });

  it('sends false when filtering for non-winners', () => {
    const requests: unknown[][] = [];
    const component = createComponent((...args) => {
      requests.push(args);
      return of(response);
    });

    component.winnerFilter = 'false';
    component.applyFilters();

    expect(requests.at(-1)).toEqual([0, 15, undefined, false]);
  });

  it('shows the selected winner state using the reference labels', () => {
    const component = createComponent(() => of(response));

    expect(component.winnerFilterLabel('true')).toBe('Yes');
    expect(component.winnerFilterLabel('false')).toBe('No');
    expect(component.winnerFilterLabel('')).toBe('Yes/No');
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

    expect(requests.at(-1)).toEqual([1, 15, undefined, undefined]);
    expect(component.errorMessage()).toContain('load movies');
    expect(component.isLoading()).toBe(false);
  });

  it('renders movie IDs and the reference list columns', () => {
    createComponent(() => of(response));

    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
    const headers = Array.from(table.querySelectorAll('thead th')).map((header) =>
      header.textContent?.trim() ?? '',
    );
    const firstRow = Array.from(table.querySelectorAll('tbody tr:first-child td')).map((cell) =>
      cell.textContent?.trim(),
    );

    expect(headers[0]).toBe('ID');
    expect(headers[1]).toBe('Year');
    expect(headers[2]).toBe('Title');
    expect(headers[3]).toContain('Winner?');
    expect(firstRow).toEqual(['1', '2000', 'Film', 'Yes']);
  });
});
