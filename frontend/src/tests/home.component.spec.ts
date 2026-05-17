import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Home } from '../app/pages/home/home';
import { BookService } from '../app/services/Book.service';
import { ComentarioService } from '../app/services/Comentario.service';
import { UsuarioService } from '../app/services/Usuario.service';

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
    mockBookService.getBooks.mockReturnValue(of([]));
    mockComentarioService.getComentarios.mockReturnValue(of([]));
    mockUsuarioService.getUsuarios.mockReturnValue(of([]));

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

  it('debería terminar sin errores cuando los servicios devuelven vacío', () => {
    expect(component.isLoading).toBe(false);
    expect(component.recommendedBooks).toEqual([]);
    expect(component.reviews).toEqual([]);
  });

  it('debería llamar a los tres servicios al inicializarse', () => {
    expect(mockBookService.getBooks).toHaveBeenCalledOnce();
    expect(mockComentarioService.getComentarios).toHaveBeenCalledOnce();
    expect(mockUsuarioService.getUsuarios).toHaveBeenCalledOnce();
  });

  it('debería mapear libros correctamente desde el servicio', async () => {
    const fakeBooks = [
      { id: 1, titulo: 'El Gran Gatsby', autor: 'F. Scott Fitzgerald', portada: 'gatsby.webp', descripcion: 'Clásico americano' },
      { id: 2, titulo: '1984', autor: 'George Orwell', portada: '1984.webp', descripcion: 'Distopía' }
    ];
    mockBookService.getBooks.mockReturnValue(of(fakeBooks));

    component.loadHomeData();
    fixture.detectChanges();

    expect(component.recommendedBooks.length).toBe(2);
    const gatsby = component.recommendedBooks.find(b => b.id === 1);
    expect(gatsby?.title).toBe('El Gran Gatsby');
    expect(gatsby?.author).toBe('F. Scott Fitzgerald');
    expect(component.recommendedBooks.find(b => b.id === 2)).toBeTruthy();
  });

  it('trackByBookId debería devolver el id del libro', () => {
    const book = { id: 42, title: 'Test', author: 'Autor', cover: '', description: '' };
    expect(component.trackByBookId(0, book)).toBe(42);
  });

  it('trackByReviewId debería devolver el id de la review', () => {
    const review = {
      id: 7, titulo: 'Libro X', year: '2026',
      username: 'user1', likes: 3, score: '4.0 / 5',
      hasRating: true, content: 'Muy buena', cover: ''
    };
    expect(component.trackByReviewId(0, review)).toBe(7);
  });
});
