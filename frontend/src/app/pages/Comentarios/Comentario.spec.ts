import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ComentarioPage } from './Comentario';
import { ComentarioService } from '../../services/Comentario.service';
import { BookService } from '../../services/Book.service';
import { UsuarioService } from '../../services/Usuario.service';
import { LoginService } from '../../services/Login.service';

const mockComentarioService = {
  getComentarios: vi.fn().mockReturnValue(of([])),
  getComentario: vi.fn().mockReturnValue(of(null)),
  getCommentLikeCount: vi.fn().mockReturnValue(0),
  getFollowingComentarios: vi.fn().mockReturnValue(of([]))
};

const mockBookService = {
  getBooks: vi.fn().mockReturnValue(of([])),
  getBook: vi.fn().mockReturnValue(of(null))
};

const mockUsuarioService = {
  getUsuarios: vi.fn().mockReturnValue(of([]))
};

const mockLoginService = {
  isLoggedIn: vi.fn().mockReturnValue(false),
  getUserId: vi.fn().mockReturnValue(null),
  getToken: vi.fn().mockReturnValue(null)
};

describe('ComentarioPage', () => {
  let component: ComentarioPage;
  let fixture: ComponentFixture<ComentarioPage>;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ComentarioPage],
      providers: [
        provideRouter([]),
        { provide: ComentarioService, useValue: mockComentarioService },
        { provide: BookService, useValue: mockBookService },
        { provide: UsuarioService, useValue: mockUsuarioService },
        { provide: LoginService, useValue: mockLoginService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComentarioPage);
    component = fixture.componentInstance;
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('relatedComments debería ser un array vacío al inicio', () => {
    expect(component.relatedComments).toEqual([]);
  });

  it('isLoading debería ser true antes de inicializar', () => {
    expect(component.isLoading).toBe(true);
  });

  it('commentDraft debería ser vacío por defecto', () => {
    expect(component.commentDraft).toBe('');
  });
});
