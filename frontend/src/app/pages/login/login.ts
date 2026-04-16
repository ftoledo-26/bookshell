import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  registerUsername: string = '';
  registerEmail: string = '';
  registerPassword: string = '';
  registerTelefono: string = '';
  registerLocalidad: string = '';

  loginMessage: string = '';
  registerMessage: string = '';

  onLogin() {
    this.loginMessage = `Intentando login con ${this.username}`;
    this.registerMessage = '';
    console.log('Login:', { username: this.username, password: this.password });
  }

  onRegister() {
    this.registerMessage = `Registro de ${this.registerUsername} enviado`;
    this.loginMessage = '';
    console.log('Register:', {
      username: this.registerUsername,
      email: this.registerEmail,
      password: this.registerPassword,
      telefono: this.registerTelefono,
      localidad: this.registerLocalidad
    });
  }
}
