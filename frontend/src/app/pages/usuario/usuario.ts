import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, map, of } from 'rxjs';
import { Usuario } from '../../models/Usuario';
import { UsuarioService } from '../../services/Usuario.service';

type ProfileMetric = {
	value: string;
	label: string;
};

type ProfileBook = {
	title: string;
	author: string;
	year: string;
	rating: string;
};

type ProfileActivity = {
	title: string;
	detail: string;
	time: string;
};

type ProfileTab = 'Profile' | 'Books' | 'Reviews' | 'Likes';

@Component({
	selector: 'app-usuario-page',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './usuario.html',
	styleUrls: ['./usuario.css']
})
export class UsuarioPage implements OnInit {
	// Cambia este ID aqui si quieres apuntar a otro usuario de prueba en el futuro.
	private readonly profileUserId = 1;
	private readonly usuarioService = inject(UsuarioService);
	private readonly cdr = inject(ChangeDetectorRef);

	user: Usuario = {
		id: this.profileUserId,
		nombre: 'Cargando...',
		email: '',
		password: '',
		rol: 'usuario',
		foto: ''
	};
	editDraft = {
		nombre: '',
		email: ''
	};
	isEditing = false;
	isLoading = true;
	isSaving = false;
	errorMessage = '';
	successMessage = '';
	activeTab: ProfileTab = 'Profile';

	readonly profileTabs: ProfileTab[] = ['Profile', 'Books', 'Reviews', 'Likes'];
	readonly metrics: ProfileMetric[] = [
		{ value: '0', label: 'Books' },
		{ value: '0', label: 'Following' },
		{ value: '0', label: 'Followers' }
	];
	readonly favoriteBooks: ProfileBook[] = [
		{ title: 'No has elegido favoritos aún', author: 'Añade tus lecturas destacadas', year: '2026', rating: '0.0' },
		{ title: 'Tu próximo libro', author: 'Sugerencias de lectura', year: 'Próximamente', rating: '--' },
		{ title: 'Club de lectura', author: 'Comparte reseñas', year: 'Listo para usar', rating: '--' },
		{ title: 'Lista personal', author: 'Guarda libros', year: 'Sin completar', rating: '--' }
	];
	readonly activity: ProfileActivity[] = [
		{ title: 'No recent activity', detail: 'Todavia no hay actividad para mostrar.', time: 'Ahora' },
		{ title: 'Editar perfil', detail: 'Puedes completar tu biografia y foto de perfil.', time: 'Hoy' },
		{ title: 'Añadir libros', detail: 'Empieza a marcar tus lecturas favoritas.', time: 'Esta semana' }
	];

	ngOnInit(): void {
		this.loadProfile();
	}

	private loadProfile(): void {
		this.isLoading = true;
		this.errorMessage = '';

		this.usuarioService.getUsuarios().pipe(
			map((users) => users.find((item) => item.id === this.profileUserId)),
			catchError(() => this.usuarioService.getUsuario(this.profileUserId).pipe(map((user) => user ? user : null))),
			catchError(() => of(null))
		).subscribe({
			next: (user) => {
				if (!user) {
					this.errorMessage = 'No se pudo cargar el perfil.';
					this.isLoading = false;
					this.cdr.detectChanges();
					return;
				}

				this.user = user;
				this.editDraft = {
					nombre: user.nombre,
					email: user.email
				};
				this.isLoading = false;
				this.cdr.detectChanges();
			},
			error: () => {
				this.errorMessage = 'No se pudo cargar el perfil.';
				this.isLoading = false;
				this.cdr.detectChanges();
			}
		});
	}

	startEditing(): void {
		this.editDraft = {
			nombre: this.user.nombre,
			email: this.user.email
		};
		this.errorMessage = '';
		this.successMessage = '';
		this.isEditing = true;
		this.cdr.detectChanges();
	}

	cancelEditing(): void {
		this.isEditing = false;
		this.errorMessage = '';
		this.successMessage = '';
		this.editDraft = {
			nombre: this.user.nombre,
			email: this.user.email
		};
		this.cdr.detectChanges();
	}

	saveProfile(): void {
		const nombre = this.editDraft.nombre.trim();
		const email = this.editDraft.email.trim();

		if (!nombre || !email) {
			this.errorMessage = 'Nombre y email son obligatorios.';
			return;
		}

		this.isSaving = true;
		this.errorMessage = '';
		this.successMessage = '';

		this.usuarioService.updateUsuario(this.profileUserId, { nombre, email }).subscribe({
			next: (updatedUser) => {
				this.user = updatedUser;
				this.isEditing = false;
				this.successMessage = 'Perfil actualizado correctamente.';
				this.isSaving = false;
				this.cdr.detectChanges();
			},
			error: () => {
				this.errorMessage = 'No se pudo actualizar el perfil.';
				this.isSaving = false;
				this.cdr.detectChanges();
			}
		});
	}

	setActiveTab(tab: ProfileTab): void {
		this.activeTab = tab;
	}
}