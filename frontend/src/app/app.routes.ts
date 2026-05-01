import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { UsuarioPage } from './pages/usuario/usuario';
import { LoginComponent } from './pages/login/login';
import { ComentarioPage } from './pages/Comentarios/Comentario';
import { MiLibreria } from './pages/mi_libreria/mi_libreria';
import { ReviewCreatePage } from './pages/review-create';
import { authGuard } from './guards';

export const routes: Routes = [
	{ path: '', component: Home, canActivate: [authGuard] },
	{ path: 'comentarios/:id', component: ComentarioPage, canActivate: [authGuard] },
	{ path: 'usuario/:id', component: UsuarioPage, canActivate: [authGuard] },
	{ path: 'usuario', component: UsuarioPage, canActivate: [authGuard] },
	{ path: 'reviews/nueva', component: ReviewCreatePage, canActivate: [authGuard] },
	{ path: 'login', component: LoginComponent },
	{ path: 'mi_libreria', component: MiLibreria, canActivate: [authGuard] },
	{ path: '**', redirectTo: '' }
];