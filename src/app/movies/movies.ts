import { CommonModule } from '@angular/common';
import type { ɵLocalizeFn } from '@angular/localize';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Movie, PagedResponse } from '../core/models/movie';
import { MoviesApiService } from '../core/services/movies-api.service';
import {
  formatProducerNames,
  formatStudioNames,
  pageNumbers,
  winnerLabel,
} from '../core/services/movie-insights';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmSelectImports } from '@spartan-ng/helm/select';

declare const $localize: ɵLocalizeFn;

@Component({
  selector: 'app-movies',
  imports: [
    CommonModule,
    FormsModule,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmInputImports,
    HlmSelectImports,
    HlmTableImports,
  ],
  templateUrl: './movies.html',
})
export class MoviesComponent implements OnInit {
  private readonly moviesApi = inject(MoviesApiService);
  private readonly pageSize = 15;

  readonly movies = signal<Movie[]>([]);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly currentPage = signal(0);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly filterError = signal('');
  readonly pageNumbers = pageNumbers;
  readonly studioNames = formatStudioNames;
  readonly producerNames = formatProducerNames;
  readonly winnerLabel = winnerLabel;
  readonly winnerFilterLabel = (value: unknown): string => {
    switch (String(value ?? '')) {
      case 'true':
        return $localize`:@@yesLabel:Yes`;
      case 'false':
        return $localize`:@@noLabel:No`;
      default:
        return $localize`:@@yesNoPlaceholder:Yes/No`;
    }
  };

  yearFilter: string | number | null = '';
  winnerFilter = '';

  ngOnInit(): void {
    this.loadMovies();
  }

  applyFilters(): void {
    const sanitizedYear = this.sanitizedYear();

    if (sanitizedYear && !this.isValidYear(sanitizedYear)) {
      this.filterError.set($localize`:@@invalidYearError:Enter a valid year between 1900 and 2100.`);
      return;
    }

    this.filterError.set('');
    this.currentPage.set(0);
    this.loadMovies();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
    this.loadMovies();
  }

  private loadMovies(): void {
    const sanitizedYear = this.sanitizedYear();

    if (sanitizedYear && !this.isValidYear(sanitizedYear)) {
      this.filterError.set($localize`:@@invalidYearError:Enter a valid year between 1900 and 2100.`);
      this.isLoading.set(false);
      return;
    }

    const year = sanitizedYear ? Number(sanitizedYear) : undefined;
    const winner = this.winnerFilter === '' ? undefined : this.winnerFilter === 'true';

    this.filterError.set('');
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.moviesApi.listMovies(this.currentPage(), this.pageSize, year, winner).subscribe({
      next: (response: PagedResponse<Movie>) => {
        this.movies.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          $localize`:@@moviesLoadError:Could not load movies. Please try again.`,
        );
        this.isLoading.set(false);
      },
    });
  }

  private sanitizedYear(): string {
    return String(this.yearFilter ?? '').trim();
  }

  private isValidYear(value: string): boolean {
    const year = Number(value);
    return Number.isInteger(year) && year >= 1900 && year <= 2100;
  }
}
