import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { LoginComponent } from '../app/pages/login/login';
import { LoginService } from '../app/services/Login.service';
import { UsuarioService } from '../app/services/Usuario.service';

const mockLoginService = {
  isLoggedIn: vi.fn().mockReturnValue(false),
  login: vi.fn(),
  getToken: vi.fn().mockReturnValue(null)
};

const mockUsuarioService = {
  getUsuarios: vi.fn()
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

  it('debería iniciar en modo login con campos vacíos', () => {
    expect(component.activeMode).toBe('login');
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
  });

  it('debería alternar la visibilidad de la contraseña', () => {
    expect(component.showPassword).toBe(false);

    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(true);

    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(false);
  });

  it('debería limpiar mensajes al cambiar de modo', () => {
    component.errorMessage = 'Error previo';
    component.successMessage = 'Éxito previo';

    component.setMode('signin');

    expect(component.activeMode).toBe('signin');
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
  });

  it('no debería hacer nada al cambiar al mismo modo', () => {
    component.errorMessage = 'Error previo';
    component.setMode('login');

    expect(component.errorMessage).toBe('Error previo');
  });

  it('debería mostrar error y activar submitError si los campos están vacíos', () => {
    component.email = '';
    component.password = '';

    component.onSubmit();

    expect(component.errorMessage).toBe('Completa el email y la contraseña.');
    expect(component.submitError).toBe(true);
  });

  it('debería desactivar submitError tras 1 segundo', async () => {
    component.onSubmit();
    expect(component.submitError).toBe(true);

    await new Promise(resolve => setTimeout(resolve, 1100));
    expect(component.submitError).toBe(false);
  });
});
