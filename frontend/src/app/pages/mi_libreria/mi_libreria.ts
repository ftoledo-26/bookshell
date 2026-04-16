import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Book } from '../../models/Book';
import { BookService } from '../../services/Book.service';

@Component({
  selector: 'app-mi-libreria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi_libreria.html',
  styleUrls: ['./mi_libreria.css'],
})
export class MiLibreria implements OnInit {
  books: Book[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  newBook: Omit<Book, 'id'> = {
    titulo: '',
    autor: '',
    descripcion: '',
    portada: ''
  };

  private readonly bookService = inject(BookService);

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los libros. Intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }

  addBook(): void {
    if (!this.newBook.titulo.trim() || !this.newBook.autor.trim()) {
      this.errorMessage = 'Debe completar el título y el autor.';
      this.successMessage = '';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.bookService.createBook(this.newBook as Book).subscribe({
      next: (book) => {
        this.books = [book, ...this.books];
        this.successMessage = 'Libro guardado en tu librería.';
        this.newBook = {
          titulo: '',
          autor: '',
          descripcion: '',
          portada: ''
        };
      },
      error: () => {
        this.errorMessage = 'No se pudo guardar el libro. Revisa los datos e intenta otra vez.';
      }
    });
  }
}
