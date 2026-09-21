import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MoviesApiService } from './movies-api.service';

describe('MoviesApiService', () => {
  let service: MoviesApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MoviesApiService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(MoviesApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('builds movie queries with filters', () => {
    service.listMovies(2, 10, 1980, true).subscribe();
    const request = http.expectOne((request) => request.url.endsWith('/api/movies'));
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('size')).toBe('10');
    expect(request.request.params.get('year')).toBe('1980');
    expect(request.request.params.get('winner')).toBe('true');
    request.flush({ content: [], totalElements: 0, totalPages: 0 });
  });
});
