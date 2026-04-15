import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Usuario } from '../../models/Usuario';

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

@Component({
	selector: 'app-usuario-page',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './usuario.html',
	styleUrls: ['./usuario.css']
})
export class UsuarioPage {
	readonly user: Usuario = {
		id: 1,
		nombre: 'opavo',
		email: 'opavo@bookshell.dev',
		password: '',
		rol: 'usuario',
		foto: ''
	};

	readonly profileTabs = ['Profile','Books', 'Reviews', 'Lists', 'Likes'];
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
}