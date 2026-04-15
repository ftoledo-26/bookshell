import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { UsuarioPage } from './pages/usuario/usuario';
import { LoginComponent } from './pages/login/login';
import { ComentarioPage } from './pages/Comentarios/Comentario';

export const routes: Routes = [
	{ path: '', component: Home },
	{ path: 'comentarios/:id', component: ComentarioPage },
	{ path: 'usuario', component: UsuarioPage },
	{ path: 'login', component: LoginComponent },
	{ path: '**', redirectTo: '' }
];