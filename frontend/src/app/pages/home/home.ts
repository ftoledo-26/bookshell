import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Book } from '../../models/Book';
import { BookService } from '../../services/Book.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  books: Book[] = [];
  isLoading = true;
  errorMessage = '';

  private readonly bookService = inject(BookService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bookService.getBooks().subscribe({
      next: (books) => {
        console.log('LIBROS RECIBIDOS:', books);
        this.books = books;
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        console.error('Error al cargar libros:', error);
        this.errorMessage = 'Error al cargar libros';
        this.isLoading = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  friendActivity = [
    { user: 'laura.reads', action: 'reseno', book: 'Dune', score: 4.5 },
    { user: 'martin_libros', action: 'agrego a su lista', book: 'Los miserables', score: null },
    { user: 'sofi.chapter', action: 'termino', book: '1984', score: 5 }
  ];

  popularTags = ['fantasia', 'ciencia ficcion', 'misterio', 'romance historico', 'ensayo'];
}