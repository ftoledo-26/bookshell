import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { catchError, of, Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { Usuario } from '../../models/Usuario';
import { LoginService } from '../../services/Login.service';
import { UsuarioService } from '../../services/Usuario.service';

@Component({
	selector: 'app-site-header',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
	templateUrl: './site-header.html',
	styleUrls: ['./site-header.css']
})
export class SiteHeaderComponent {
	private readonly hostElement = inject(ElementRef<HTMLElement>);
	private readonly loginService = inject(LoginService);
	private readonly usuarioService = inject(UsuarioService);
	private readonly router = inject(Router);

	readonly navItems = [
		{ label: 'Books', path: '/' },
		{ label: 'Profile', path: '/usuario' },
	];
	isAvatarMenuOpen = false;
	isSearchOpen = false;
	searchQuery = '';
	isSearchingUsers = false;
	searchResults: Usuario[] = [];
	searchError = '';
	private readonly searchInput$ = new Subject<string>();
	private readonly searchCache = new Map<string, Usuario[]>();
	private readonly maxCacheEntries = 20;
	private activeSearchSub?: Subscription;
	private readonly searchInputSub: Subscription;

	constructor() {
		this.searchInputSub = this.searchInput$.pipe(
			debounceTime(250),
			distinctUntilChanged()
		).subscribe((query) => {
			this.executeSearch(query);
		});
	}

	toggleAvatarMenu(): void {
		this.isAvatarMenuOpen = !this.isAvatarMenuOpen;
	}

	toggleSearch(): void {
		this.isSearchOpen = !this.isSearchOpen;
		if (!this.isSearchOpen) {
			this.closeSearch();
		}
	}

	closeAvatarMenu(): void {
		this.isAvatarMenuOpen = false;
	}

	closeSearch(): void {
		this.isSearchOpen = false;
		this.searchQuery = '';
		this.searchResults = [];
		this.searchError = '';
		this.isSearchingUsers = false;
		this.activeSearchSub?.unsubscribe();
	}

	searchUsers(): void {
		const query = this.searchQuery.trim();
		this.searchInput$.next(query);
	}

	onSearchInputChange(): void {
		const query = this.searchQuery.trim();
		this.searchError = '';

		if (query.length === 0) {
			this.searchResults = [];
			this.isSearchingUsers = false;
			this.activeSearchSub?.unsubscribe();
			return;
		}

		this.searchInput$.next(query);
	}

	private executeSearch(query: string): void {
		const normalizedQuery = query.trim().toLowerCase();

		if (!normalizedQuery) {
			this.searchResults = [];
			this.searchError = 'Escribe un nombre para buscar.';
			this.isSearchingUsers = false;
			return;
		}

		const cachedResults = this.searchCache.get(normalizedQuery);
		if (cachedResults) {
			this.searchResults = cachedResults;
			this.isSearchingUsers = false;
			return;
		}

		this.activeSearchSub?.unsubscribe();

		this.isSearchingUsers = true;
		this.searchError = '';

		this.activeSearchSub = this.usuarioService.searchUsuarios(query).pipe(
			catchError(() => {
				this.searchError = 'No se pudieron buscar usuarios.';
				return of([] as Usuario[]);
			})
		).subscribe({
			next: (users) => {
				this.searchResults = users;
				this.setCache(normalizedQuery, users);
				this.isSearchingUsers = false;
			}
		});
	}

	private setCache(query: string, users: Usuario[]): void {
		if (!this.searchCache.has(query) && this.searchCache.size >= this.maxCacheEntries) {
			const firstKey = this.searchCache.keys().next().value;
			if (firstKey) {
				this.searchCache.delete(firstKey);
			}
		}

		this.searchCache.set(query, users);
	}

	openUserProfile(userId: number): void {
		this.closeSearch();
		this.closeAvatarMenu();
		this.router.navigate(['/usuario', userId]);
	}

	logout(): void {
		this.closeAvatarMenu();
		this.closeSearch();
		this.loginService.logout();
	}

	ngOnDestroy(): void {
		this.activeSearchSub?.unsubscribe();
		this.searchInputSub.unsubscribe();
	}

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent): void {
		if (!this.isAvatarMenuOpen && !this.isSearchOpen) {
			return;
		}

		const target = event.target as Node | null;
		if (target && !this.hostElement.nativeElement.contains(target)) {
			this.closeAvatarMenu();
			this.closeSearch();
		}
	}

	@HostListener('document:keydown.escape')
	onEscapeKey(): void {
		this.closeAvatarMenu();
		this.closeSearch();
	}
}

