import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { UsuarioPage } from './pages/usuario/usuario';

export const routes: Routes = [
	{ path: '', component: Home },
	{ path: 'usuario', component: UsuarioPage },
	{ path: '**', redirectTo: '' }
];
