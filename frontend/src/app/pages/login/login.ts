import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../services/Login.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})



export class LoginComponent {
  private loginService = inject(LoginService);
  private router = inject(Router);

  email: string = '';
  password: string = '';
  errorMessage: string = '';
  
  onSubmit() {
    this.errorMessage = '';

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
}
