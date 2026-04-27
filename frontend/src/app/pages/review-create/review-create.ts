import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly bookSearchInput$ = new Subject<string>();

  books: Book[] = [];
  selectedBookId: number | null = null;
  selectedBook: Book | null = null;
  rating = 0;
  comentario = '';
  isLoadingBooks = true;
  isSaving = false;
  isSearchingBooks = false;
  errorMessage = '';
  successMessage = '';
  bookSearchQuery = '';
  bookSearchResults: Book[] = [];

  ngOnInit(): void {
    if (!this.loginService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.setupLiveBookSearch();
    this.loadBooks();
  }

  private setupLiveBookSearch(): void {
    this.bookSearchInput$.pipe(
      map((value) => value.trim()),
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((query) => {
        if (query.length < 2) {
          return of({ query, results: [] as Book[], failed: false });
        }

        this.isSearchingBooks = true;
        this.errorMessage = '';

        return this.bookService.searchBook(query).pipe(
          map((results) => ({ query, results, failed: false })),
          catchError(() => of({ query, results: [] as Book[], failed: true }))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ query, results, failed }) => {
      if (query.length < 2) {
        this.bookSearchResults = [];
        this.isSearchingBooks = false;
        this.cdr.detectChanges();
        return;
      }

      this.bookSearchResults = results;
      this.isSearchingBooks = false;
      this.errorMessage = failed ? 'No se pudieron buscar libros.' : '';
      this.cdr.detectChanges();
    });
  }

  private loadBooks(): void {
    this.isLoadingBooks = true;
    this.errorMessage = '';

    this.bookService.getBooks().pipe(
      catchError(() => of([] as Book[]))
    ).subscribe((books) => {
      this.books = books;
      this.isLoadingBooks = false;
      this.cdr.detectChanges();
    });
  }

  searchBooks(): void {
    const query = this.bookSearchQuery.trim();

    if (!query) {
      this.errorMessage = 'Escribe al menos un título o autor para buscar.';
      this.bookSearchResults = [];
      this.cdr.detectChanges();
      return;
    }

    this.isSearchingBooks = true;
    this.errorMessage = '';

    this.bookService.searchBook(query).pipe(
      catchError(() => of([] as Book[]))
    ).subscribe({
      next: (results) => {
        this.bookSearchResults = results;
        this.isSearchingBooks = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudieron buscar libros.';
        this.bookSearchResults = [];
        this.isSearchingBooks = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchInput(value: string): void {
    this.bookSearchQuery = value;
    this.bookSearchInput$.next(value);
  }

  selectBook(book: Book): void {
    this.selectedBook = book;
    this.selectedBookId = book.id;
    this.bookSearchQuery = '';
    this.bookSearchResults = [];
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  clearBookSelection(): void {
    this.selectedBook = null;
    this.selectedBookId = null;
    this.bookSearchQuery = '';
    this.bookSearchResults = [];
    this.cdr.detectChanges();
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

    if (!Number.isFinite(bookId) || bookId <= 0 || !this.selectedBook) {
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
      likes: this.rating,
      user: this.loginService.getUsername() ?? undefined,
      comment: text,
      comentario: text,
      contenido: text
    };

    this.comentarioService.createComentario(payload).subscribe({
      next: (createdReview) => {
        const createdId = Number(createdReview?.id ?? 0);

        // Some backend store implementations persist the row but ignore rating/comment on create.
        // Force a follow-up update on the same record to guarantee final values.
        if (Number.isFinite(createdId) && createdId > 0) {
          this.comentarioService.updateComentario(createdId, payload).subscribe({
            next: () => {
              this.successMessage = 'Review creada correctamente.';
              this.isSaving = false;
              this.router.navigate(['/usuario'], { queryParams: { refresh: Date.now() } });
            },
            error: () => {
              this.errorMessage = 'La review se creó, pero no se pudieron actualizar puntuación/comentario.';
              this.isSaving = false;
              this.cdr.detectChanges();
            }
          });
          return;
        }

        this.successMessage = 'Review creada correctamente.';
        this.isSaving = false;
        // Force reload of usuario profile to show new comment immediately
        this.router.navigate(['/usuario'], { queryParams: { refresh: Date.now() } });
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
