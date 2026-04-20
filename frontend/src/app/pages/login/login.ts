import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../services/Login.service';
import { UsuarioService } from '../../services/Usuario.service';


type AuthMode = 'login' | 'signin';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})



export class LoginComponent implements OnInit, OnDestroy {
  private loginService = inject(LoginService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  activeMode: AuthMode = 'login';
  isTransitioning = false;
  private transitionTimeoutId: ReturnType<typeof setTimeout> | null = null;

  email: string = '';
  password: string = '';
  registerName: string = '';
  registerEmail: string = '';
  registerPassword: string = '';
  registerConfirmPassword: string = '';
  registerPhone: string = '';

  showPassword: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  ngOnInit(): void {
    this.redirectIfLoggedIn();
  }

  ngOnDestroy(): void {
    if (this.transitionTimeoutId) {
      clearTimeout(this.transitionTimeoutId);
    }
  }

  private redirectIfLoggedIn(): boolean {
    if (this.loginService.isLoggedIn()) {
      this.router.navigate(['/']);
      console.log('Usuario ya autenticado, redirigiendo a home...');
      console.log('Token encontrado:', this.loginService.getToken());
      return true;
    }

    return false;
  }

  private validatePassword(password: string): string | null {
    if (!password) {
      return 'La contraseña es requerida.';
    }

    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }

    if (password.includes(' ')) {
      return 'La contraseña no puede contener espacios.';
    }

    if (!/[A-Z]/.test(password)) {
      return 'La contraseña debe contener al menos una mayúscula.';
    }

    if (!/[a-z]/.test(password)) {
      return 'La contraseña debe contener al menos una minúscula.';
    }

    if (!/[0-9]/.test(password)) {
      return 'La contraseña debe contener al menos un número.';
    }

    if (!/[@\-.*!#$%&_]/.test(password)) {
      return 'La contraseña debe contener al menos un carácter especial (@, -, ., *, !, #, $, %, &, _).';
    }

    return null;
  }

  setMode(mode: AuthMode): void {
    if (this.activeMode === mode) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.showPassword = false;
    this.activeMode = mode;
    this.isTransitioning = true;

    if (this.transitionTimeoutId) {
      clearTimeout(this.transitionTimeoutId);
    }

    this.transitionTimeoutId = setTimeout(() => {
      this.isTransitioning = false;
    }, 220);
  }

  onSubmit(): void {
    if (this.activeMode === 'signin') {
      this.onSignInSubmit();
      return;
    }

    this.onLoginSubmit();
  }

  private onLoginSubmit(): void {
    if (this.redirectIfLoggedIn()) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Completa el email y la contraseña.';
      return;
    }

    this.loginService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/']);
          return;
        }

        this.errorMessage = 'El servidor respondió sin token.';
      },
      error: () => {
        this.errorMessage = 'Usuario o contraseña incorrectos.';
      }
    });
  }

  private onSignInSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const nombre = this.registerName.trim();
    const email = this.registerEmail.trim();
    const password = this.registerPassword;
    const confirmPassword = this.registerConfirmPassword;
    const phone = this.registerPhone.trim();

    if (!nombre || !email || !password || !confirmPassword || !phone) {
      this.errorMessage = 'Completa todos los campos para crear tu cuenta.';
      return;
    }

    const passwordError = this.validatePassword(password);
    if (passwordError) {
      this.errorMessage = passwordError;
      return;
    }

    if (password !== confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.usuarioService.createUsuario({ nombre, email, password, phone }).subscribe({
      next: () => {
        this.successMessage = 'Cuenta creada. Ahora inicia sesión con tus credenciales.';
        this.email = email;
        this.password = '';
        this.registerName = '';
        this.registerEmail = '';
        this.registerPassword = '';
        this.registerConfirmPassword = '';
        this.setMode('login');
      },
      error: () => {
        this.errorMessage = 'No se pudo crear la cuenta. Verifica el correo e intenta de nuevo.';
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
