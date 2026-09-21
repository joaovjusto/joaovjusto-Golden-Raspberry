import { CommonModule } from '@angular/common';
import type { ɵLocalizeFn } from '@angular/localize';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import {
  Movie,
  MultipleWinnerYear,
  ProducerInterval,
  ProducerIntervals,
  StudioWinCount,
} from '../core/models/movie';
import { MoviesApiService } from '../core/services/movies-api.service';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';

declare const $localize: ɵLocalizeFn;

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    HlmButtonImports,
    HlmCardImports,
    HlmInputImports,
    HlmTableImports,
  ],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  private readonly moviesApi = inject(MoviesApiService);
  private panelRequestsCompleted = 0;
  private panelRequestsFailed = 0;

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly multipleWinnerYears = signal<MultipleWinnerYear[]>([]);
  readonly topStudios = signal<StudioWinCount[]>([]);
  readonly shortestIntervals = signal<ProducerInterval[]>([]);
  readonly longestIntervals = signal<ProducerInterval[]>([]);
  readonly winnersByYear = signal<Movie[]>([]);
  readonly searchedYear = signal<number | null>(null);
  readonly isSearchingYear = signal(false);
  yearInput = '';

  ngOnInit(): void {
    this.panelRequestsCompleted = 0;
    this.panelRequestsFailed = 0;
    this.errorMessage.set('');

    this.loadYearsWithMultipleWinners();
    this.loadStudiosWithWinCount();
    this.loadProducerIntervals();
  }

  searchWinners(): void {
    const year = Number(this.yearInput);
    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      this.errorMessage.set(
        $localize`:@@invalidYearError:Informe um ano válido entre 1900 e 2100.`,
      );
      return;
    }

    this.errorMessage.set('');
    this.isSearchingYear.set(true);
    this.moviesApi.getWinnersByYear(year).subscribe({
      next: (movies) => {
        this.winnersByYear.set(movies);
        this.searchedYear.set(year);
        this.isSearchingYear.set(false);
      },
      error: () => {
        this.errorMessage.set(
          $localize`:@@yearSearchError:Não foi possível buscar vencedores para este ano.`,
        );
        this.isSearchingYear.set(false);
      },
    });
  }

  private loadYearsWithMultipleWinners(): void {
    this.moviesApi
      .getYearsWithMultipleWinners()
      .pipe(
        catchError(() => {
          this.multipleWinnerYears.set([]);
          this.panelRequestsFailed += 1;
          this.completePanelRequest();
          return of({ years: [] as MultipleWinnerYear[] });
        }),
      )
      .subscribe({
        next: ({ years }) => {
          this.multipleWinnerYears.set(years);
          this.completePanelRequest();
        },
      });
  }

  private loadStudiosWithWinCount(): void {
    this.moviesApi
      .getStudiosWithWinCount()
      .pipe(
        catchError(() => {
          this.topStudios.set([]);
          this.panelRequestsFailed += 1;
          this.completePanelRequest();
          return of({ studios: [] as StudioWinCount[] });
        }),
      )
      .subscribe({
        next: ({ studios }) => {
          this.topStudios.set(studios.slice(0, 3));
          this.completePanelRequest();
        },
      });
  }

  private loadProducerIntervals(): void {
    this.moviesApi
      .getProducerIntervals()
      .pipe(
        catchError(() => {
          this.shortestIntervals.set([]);
          this.longestIntervals.set([]);
          this.panelRequestsFailed += 1;
          this.completePanelRequest();
          return of({
            min: [] as ProducerInterval[],
            max: [] as ProducerInterval[],
          } satisfies ProducerIntervals);
        }),
      )
      .subscribe({
        next: ({ min, max }) => {
          this.shortestIntervals.set(min);
          this.longestIntervals.set(max);
          this.completePanelRequest();
        },
      });
  }

  private completePanelRequest(): void {
    this.panelRequestsCompleted += 1;

    if (this.panelRequestsCompleted === 3) {
      this.isLoading.set(false);

      if (this.panelRequestsFailed > 0) {
        this.errorMessage.set(
          $localize`:@@dashboardPartialError:Alguns dados do dashboard não puderam ser carregados. Tente novamente.`,
        );
      }
    }
  }
}
