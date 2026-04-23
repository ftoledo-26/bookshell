import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Book } from '../../models/Book';
import { Comentario } from '../../models/Comentario';
import { BookService } from '../../services/Book.service';
import { ComentarioService } from '../../services/Comentario.service';
import { LoginService } from '../../services/Login.service';

@Component({
  selector: 'app-review-create-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-create.html',
  styleUrls: ['./review-create.css']
})
export class ReviewCreatePage implements OnInit {
  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);
  private readonly bookService = inject(BookService);
  private readonly comentarioService = inject(ComentarioService);
  private readonly cdr = inject(ChangeDetectorRef);

  books: Book[] = [];
  selectedBookId: number | null = null;
  rating = 0;
  comentario = '';
  isLoadingBooks = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    if (!this.loginService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadBooks();
  }

  private loadBooks(): void {
    this.isLoadingBooks = true;
    this.errorMessage = '';

    this.bookService.getBooks().pipe(
      catchError(() => of([] as Book[]))
    ).subscribe((books) => {
      this.books = books;
      this.isLoadingBooks = false;
      if (books.length === 0) {
        this.errorMessage = 'No se encontraron libros para reseñar.';
      }
      this.cdr.detectChanges();
    });
  }

  setRating(value: number): void {
    this.rating = value;
  }

  saveReview(): void {
    if (!this.loginService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    const bookId = Number(this.selectedBookId);
    const text = this.comentario.trim();

    if (!Number.isFinite(bookId) || bookId <= 0) {
      this.errorMessage = 'Selecciona un libro para crear la review.';
      return;
    }

    if (this.rating < 1 || this.rating > 5) {
      this.errorMessage = 'Selecciona una valoración de 1 a 5.';
      return;
    }

    if (!text) {
      this.errorMessage = 'Escribe un comentario antes de guardar.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userId = this.loginService.getUserId();
    if (!Number.isFinite(userId) || Number(userId) <= 0) {
      this.errorMessage = 'No se pudo identificar tu usuario. Inicia sesion de nuevo.';
      this.isSaving = false;
      return;
    }

    const payload: Comentario = {
      id: 0,
      UsuarioId: Number(userId),
      BookId: bookId,
      rating: this.rating,
      comentario: text,
      contenido: text
    };

    this.comentarioService.createComentario(payload).subscribe({
      next: () => {
        this.successMessage = 'Review creada correctamente.';
        this.isSaving = false;
        this.router.navigate(['/usuario']);
      },
      error: () => {
        this.errorMessage = 'No se pudo crear la review.';
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/usuario']);
  }
}
