import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Home } from './home';
import { BookService } from '../../services/Book.service';
import { ComentarioService } from '../../services/Comentario.service';
import { UsuarioService } from '../../services/Usuario.service';

const mockBookService = {
  getBooks: vi.fn().mockReturnValue(of([]))
};

const mockComentarioService = {
  getComentarios: vi.fn().mockReturnValue(of([])),
  getCommentLikeCount: vi.fn().mockReturnValue(0)
};

const mockUsuarioService = {
  getUsuarios: vi.fn().mockReturnValue(of([]))
};

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        { provide: BookService, useValue: mockBookService },
        { provide: ComentarioService, useValue: mockComentarioService },
        { provide: UsuarioService, useValue: mockUsuarioService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('isLoading debería ser false tras la carga inicial', () => {
    expect(component.isLoading).toBe(false);
  });

  it('recommendedBooks debería ser vacío si el servicio devuelve vacío', () => {
    expect(component.recommendedBooks).toEqual([]);
  });

  it('debería llamar a getBooks() al inicializarse', () => {
    expect(mockBookService.getBooks).toHaveBeenCalled();
  });

  it('trackByBookId debería devolver el id del libro', () => {
    const book = { id: 5, title: 'Test', author: 'Autor', cover: '', description: '' };
    expect(component.trackByBookId(0, book)).toBe(5);
  });
});
