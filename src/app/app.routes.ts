import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
	{ path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(({ DashboardComponent }) => DashboardComponent) },
	{ path: 'movies', loadComponent: () => import('./movies/movies').then(({ MoviesComponent }) => MoviesComponent) },
	{ path: '**', redirectTo: 'dashboard' },
];
