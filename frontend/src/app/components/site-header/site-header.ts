import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LoginService } from '../../services/Login.service';

@Component({
	selector: 'app-site-header',
	standalone: true,
	imports: [CommonModule, RouterLink, RouterLinkActive],
	templateUrl: './site-header.html',
	styleUrls: ['./site-header.css']
})
export class SiteHeaderComponent {
	private readonly hostElement = inject(ElementRef<HTMLElement>);
	private readonly loginService = inject(LoginService);

	readonly navItems = [
		{ label: 'Books', path: '/' },
		{ label: 'Profile', path: '/usuario' },
	];
	isAvatarMenuOpen = false;

	toggleAvatarMenu(): void {
		this.isAvatarMenuOpen = !this.isAvatarMenuOpen;
	}

	closeAvatarMenu(): void {
		this.isAvatarMenuOpen = false;
	}

	logout(): void {
		this.closeAvatarMenu();
		this.loginService.logout();
	}

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent): void {
		if (!this.isAvatarMenuOpen) {
			return;
		}

		const target = event.target as Node | null;
		if (target && !this.hostElement.nativeElement.contains(target)) {
			this.closeAvatarMenu();
		}
	}

	@HostListener('document:keydown.escape')
	onEscapeKey(): void {
		this.closeAvatarMenu();
	}
}

