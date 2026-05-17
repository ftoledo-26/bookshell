import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { MiLibreria } from './mi_libreria';
import { BookService } from '../../services/Book.service';

const mockBookService = {
  getBooks: vi.fn().mockReturnValue(of([])),
  createBook: vi.fn().mockReturnValue(of({ id: 1, titulo: 'Nuevo', autor: 'Autor', descripcion: '', portada: '' }))
};

describe('MiLibreria', () => {
  let component: MiLibreria;
  let fixture: ComponentFixture<MiLibreria>;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [MiLibreria],
      providers: [
        { provide: BookService, useValue: mockBookService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MiLibreria);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('books debería ser un array vacío al inicio', () => {
    expect(component.books).toEqual([]);
  });

  it('addBook() debería mostrar error si el título está vacío', () => {
    component.newBook.titulo = '';
    component.newBook.autor = 'Autor';
    component.addBook();
    expect(component.errorMessage).toBeTruthy();
  });

  it('addBook() debería llamar a createBook() con datos válidos', () => {
    component.newBook.titulo = 'Un libro';
    component.newBook.autor = 'Un autor';
    component.addBook();
    expect(mockBookService.createBook).toHaveBeenCalled();
  });

  it('loadBooks() debería llamar a getBooks()', () => {
    component.loadBooks();
    expect(mockBookService.getBooks).toHaveBeenCalled();
  });
});
