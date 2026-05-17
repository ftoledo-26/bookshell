import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { LoginComponent } from './login';
import { LoginService } from '../../services/Login.service';
import { UsuarioService } from '../../services/Usuario.service';

const mockLoginService = {
  isLoggedIn: vi.fn().mockReturnValue(false),
  getToken: vi.fn().mockReturnValue(null),
  login: vi.fn().mockReturnValue(of({ access_token: 'test-token', user: { id: 1, name: 'test' } }))
};

const mockUsuarioService = {
  getUsuarios: vi.fn().mockReturnValue(of([])),
  createUsuario: vi.fn().mockReturnValue(of({}))
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockLoginService.isLoggedIn.mockReturnValue(false);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: LoginService, useValue: mockLoginService },
        { provide: UsuarioService, useValue: mockUsuarioService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('activeMode debería ser "login" por defecto', () => {
    expect(component.activeMode).toBe('login');
  });

  it('setMode() debería cambiar el modo activo a "signin"', () => {
    component.setMode('signin');
    expect(component.activeMode).toBe('signin');
  });

  it('togglePasswordVisibility() debería alternar showPassword', () => {
    expect(component.showPassword).toBe(false);
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(true);
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(false);
  });

  it('onSubmit() debería mostrar error si email y password están vacíos', () => {
    component.email = '';
    component.password = '';
    component.onSubmit();
    expect(component.errorMessage).toBeTruthy();
  });

  it('onSubmit() debería llamar a login() cuando hay credenciales', () => {
    component.email = 'user@example.com';
    component.password = 'ValidPass1!';
    component.onSubmit();
    expect(mockLoginService.login).toHaveBeenCalledWith('user@example.com', 'ValidPass1!');
  });
});
