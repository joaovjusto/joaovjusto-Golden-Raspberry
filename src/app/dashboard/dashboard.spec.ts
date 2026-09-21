import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard';
import { MoviesApiService } from '../core/services/movies-api.service';

const yearsResponse = { years: [{ year: 1985, winnerCount: 2 }] };
const studiosResponse = { studios: [{ name: 'Studio A', winCount: 4 }] };
const intervalsResponse = {
  min: [{ producer: 'Producer A', interval: 1, previousWin: 2000, followingWin: 2001 }],
  max: [{ producer: 'Producer B', interval: 20, previousWin: 1980, followingWin: 2000 }],
};

function createApi(overrides: Partial<MoviesApiService> = {}): Partial<MoviesApiService> {
  return {
    getYearsWithMultipleWinners: () => of(yearsResponse),
    getStudiosWithWinCount: () => of(studiosResponse),
    getProducerIntervals: () => of(intervalsResponse),
    getWinnersByYear: () => of([]),
    ...overrides,
  };
}

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;

  function createComponent(api: Partial<MoviesApiService>): DashboardComponent {
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: MoviesApiService, useValue: api }],
    });
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('loads all dashboard panels', () => {
    const component = createComponent(createApi());

    expect(component.isLoading()).toBe(false);
    expect(component.multipleWinnerYears()).toEqual(yearsResponse.years);
    expect(component.topStudios()).toEqual(studiosResponse.studios);
    expect(component.shortestIntervals()).toEqual(intervalsResponse.min);
    expect(component.longestIntervals()).toEqual(intervalsResponse.max);
  });

  it('keeps the other panels available when one endpoint fails', () => {
    const component = createComponent(createApi({
      getStudiosWithWinCount: () => throwError(() => new Error('network error')),
    }));

    expect(component.isLoading()).toBe(false);
    expect(component.multipleWinnerYears()).toEqual(yearsResponse.years);
    expect(component.topStudios()).toEqual([]);
    expect(component.errorMessage()).toContain('Alguns dados');
  });

  it('rejects invalid years without making a request', () => {
    let requestCount = 0;
    const component = createComponent(createApi({
      getWinnersByYear: () => {
        requestCount += 1;
        return of([]);
      },
    }));

    component.yearInput = 'abc';
    component.searchWinners();

    expect(requestCount).toBe(0);
    expect(component.errorMessage()).toContain('ano válido');
  });

  it('shows winners returned for a valid year', () => {
    const winners = [{ id: 1, year: 2000, title: 'Film', studios: [], producers: [], winner: true }];
    let requestedYear = 0;
    const component = createComponent(createApi({
      getWinnersByYear: (year: number) => {
        requestedYear = year;
        return of(winners);
      },
    }));

    component.yearInput = '2000';
    component.searchWinners();

    expect(requestedYear).toBe(2000);
    expect(component.winnersByYear()).toEqual(winners);
    expect(component.searchedYear()).toBe(2000);
    expect(component.isSearchingYear()).toBe(false);
  });
});
