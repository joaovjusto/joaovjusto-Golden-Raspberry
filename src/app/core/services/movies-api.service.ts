import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie, MultipleWinnerYear, PagedResponse, ProducerIntervals, StudioWinCount } from '../models/movie';

@Injectable({ providedIn: 'root' })
export class MoviesApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = 'https://challenge.outsera.tech/api/movies';

  listMovies(page: number, size: number, year?: number, winner?: boolean): Observable<PagedResponse<Movie>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (year) params = params.set('year', year);
    if (winner !== undefined) params = params.set('winner', winner);
    return this.http.get<PagedResponse<Movie>>(this.endpoint, { params });
  }

  getYearsWithMultipleWinners(): Observable<{ years: MultipleWinnerYear[] }> {
    return this.http.get<{ years: MultipleWinnerYear[] }>(`${this.endpoint}/yearsWithMultipleWinners`);
  }

  getStudiosWithWinCount(): Observable<{ studios: StudioWinCount[] }> {
    return this.http.get<{ studios: StudioWinCount[] }>(`${this.endpoint}/studiosWithWinCount`);
  }

  getProducerIntervals(): Observable<ProducerIntervals> {
    return this.http.get<ProducerIntervals>(`${this.endpoint}/maxMinWinIntervalForProducers`);
  }

  getWinnersByYear(year: number): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.endpoint}/winnersByYear`, { params: new HttpParams().set('year', year) });
  }
}
