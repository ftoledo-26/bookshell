import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
	selector: 'app-site-header',
	standalone: true,
	imports: [CommonModule, RouterLink, RouterLinkActive],
	templateUrl: './site-header.html',
	styleUrls: ['./site-header.css']
})
export class SiteHeaderComponent {
	readonly navItems = [
		{ label: 'Books', path: '/' },
		{ label: 'Profile', path: '/usuario' },
		{ label: 'Mi libreria', path: '/mi_libreria' },
	];
}