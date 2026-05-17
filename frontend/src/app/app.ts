import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { SiteHeaderComponent } from './components/site-header/site-header';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, SiteHeaderComponent],
	template: `
		@if (showHeader()) {
			<app-site-header />
		}
		<router-outlet />
	`
})
export class App {
	private readonly router = inject(Router);

	private readonly currentUrl = toSignal(
		this.router.events.pipe(
			filter(e => e instanceof NavigationEnd),
			map(e => (e as NavigationEnd).urlAfterRedirects)
		),
		{ initialValue: this.router.url }
	);

	readonly showHeader = computed(() => !this.currentUrl().startsWith('/login'));
}
