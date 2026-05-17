import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { LoginService } from '../app/services/Login.service';

describe('LoginService', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('isLoggedIn() debería devolver false sin token', () => {
    localStorage.removeItem('token');
    expect(service.isLoggedIn()).toBe(false);
  });

  it('isLoggedIn() debería devolver true con token en localStorage', () => {
    localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiJ9.fake.token');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('getToken() debería devolver null sin token', () => {
    localStorage.removeItem('token');
    expect(service.getToken()).toBeNull();
  });

  it('getToken() debería devolver el token almacenado', () => {
    localStorage.setItem('token', 'mi-token-de-prueba');
    expect(service.getToken()).toBe('mi-token-de-prueba');
  });

  it('getUserId() debería devolver null sin userId', () => {
    localStorage.removeItem('userId');
    expect(service.getUserId()).toBeNull();
  });

  it('getUserId() debería devolver el id numérico', () => {
    localStorage.setItem('userId', '5');
    expect(service.getUserId()).toBe(5);
  });

  it('login() debería guardar token y userId en localStorage', () => {
    service.login('test@example.com', 'Password1!').subscribe();

    const req = httpMock.expectOne(req => req.url.includes('login'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@example.com', password: 'Password1!' });

    req.flush({
      access_token: 'nuevo-token-jwt',
      user: { id: 99, name: 'testuser' }
    });

    expect(localStorage.getItem('token')).toBe('nuevo-token-jwt');
    expect(localStorage.getItem('userId')).toBe('99');
    expect(localStorage.getItem('username')).toBe('testuser');
  });
});
