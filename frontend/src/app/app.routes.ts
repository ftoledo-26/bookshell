import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { UsuarioPage } from './pages/usuario/usuario';
import { ComentarioPage } from './pages/Comentarios/Comentario';

export const routes: Routes = [
	{ path: '', component: Home },
	{ path: 'comentarios/:id', component: ComentarioPage },
	{ path: 'usuario', component: UsuarioPage },
	{ path: '**', redirectTo: '' }
];
