import {
  Component, OnInit, inject, ElementRef, ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Book } from '../../models/Book';
import { BookService } from '../../services/Book.service';
import { CommonModule } from '@angular/common';
import { Comentario } from '../../models/Comentario';
import { ComentarioService } from '../../services/Comentario.service';
import { Usuario } from '../../models/Usuario';
import { UsuarioService } from '../../services/Usuario.service';
import { catchError, forkJoin, of, timeout } from 'rxjs';
import { Router } from '@angular/router';

type TimelineComment = Comentario & {
  username: string;
  bookTitle: string;
  cover?: string;
};

type RecommendedBook = {
  id: number;
  title: string;
  cover: string;
};

type FeaturedReview = {
  id: number;
  titulo: string;
  year: string;
  username: string;
  likes: number;
  score: string;
  hasRating: boolean;
  content: string;
  cover: string;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home implements OnInit {
  @ViewChild('recommendedStrip')
  private recommendedStripRef?: ElementRef<HTMLDivElement>;

  books: Book[] = [];
  recommendedBooks: RecommendedBook[] = [];
  reviews: FeaturedReview[] = [];
  isLoading = true;
  errorMessage = '';

  private isRecommendedSwiping = false;
  private recommendedTouchStartX = 0;
  private recommendedTouchStartY = 0;
  private recommendedScrollStartLeft = 0;

  private readonly bookService = inject(BookService);
  private readonly comentarioService = inject(ComentarioService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadHomeData();
  }

  loadHomeData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      books: this.bookService.getBooks().pipe(
        timeout(10000),
        catchError(() => of([] as Book[]))
      ),
      comments: this.comentarioService.getComentarios().pipe(
        timeout(10000),
        catchError(() => of([] as Comentario[]))
      ),
      users: this.usuarioService.getUsuarios().pipe(
        timeout(10000),
        catchError(() => of([] as Usuario[]))
      )
    }).subscribe({
      next: (result: { books: Book[]; comments: Comentario[]; users: Usuario[] }) => {
        const { books, comments, users } = result;
        this.books = books;
        const timelineComments = this.mapTimelineComments(comments, books, users);
        this.recommendedBooks = this.mapRecommendedBooks(books);
        this.reviews = this.mapFeaturedReviews(timelineComments);
        this.isLoading = false;
        if (books.length === 0 && comments.length === 0) {
          this.errorMessage = 'No se pudieron cargar datos ahora. Intenta de nuevo en unos segundos.';
        }
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        console.error('Error al cargar inicio:', error);
        this.errorMessage = 'Error al cargar comentarios y libros';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private mapTimelineComments(comments: Comentario[], books: Book[], users: Usuario[]): TimelineComment[] {
    const userById = new Map<number, string>(users.map((user) => [user.id, user.nombre]));
    const bookById = new Map<number, string>(books.map((book) => [book.id, book.titulo]));

    return comments.map((comment) => {
      const c = comment as any;
      const userId = c.UsuarioId ?? c.usuario_id;
      const bookId = c.BookId ?? c.libro_id;
      
      // Intentar obtener nombre de usuario desde diferentes posibles estructuras
      const userName = 
        c.user ||
        c.nombre ||
        c.usuario?.nombre ||
        c.usuarioNombre ||
        c.username ||
        (userId != null ? userById.get(Number(userId)) : undefined) ||
        (userId != null ? String(userId) : 'Sin usuario');
      
      // Intentar obtener título del libro desde diferentes posibles estructuras
      const bookTitle = 
        c.libro?.titulo ||
        c.libro ||
        c.libroData?.titulo ||
        c.libroTitulo ||
        c.title ||
        c.titulo ||
        (bookId != null ? bookById.get(Number(bookId)) : undefined) ||
        (bookId != null ? String(bookId) : 'Sin titulo');

      const commentText = c.contenido ?? c.comentario ?? c.comment ?? '';
      const likes = Number(c.likes ?? c.rating ?? 0);
      const cover = c.portada || c.libro?.portada || '';

      return {
        ...comment,
        contenido: commentText,
        likes: Number.isFinite(likes) ? likes : 0,
        username: userName || (userId != null ? String(userId) : 'Sin usuario'),
        bookTitle: bookTitle || (bookId != null ? String(bookId) : 'Sin titulo'),
        cover
      };
    });
  }

  private mapRecommendedBooks(books: Book[]): RecommendedBook[] {
    return books.slice(0, 8).map((book) => ({
      id: book.id,
      title: book.titulo,
      cover: book.portada
    }));
  }

  private mapFeaturedReviews(items: TimelineComment[]): FeaturedReview[] {
    const shuffledItems = this.shuffleArray(items);
    const coverByBookId = new Map<number, string>(this.books.map((book) => [book.id, book.portada]));

    return shuffledItems.map((item) => {
      const rawLikes = Number(item.likes ?? 0);
      const hasRating = (item as any).rating != null || rawLikes > 0;

      return {
        id: item.id,
        titulo: item.bookTitle,
        year: '2026',
        username: item.username,
        likes: Number.isFinite(rawLikes) ? rawLikes : 0,
        score: hasRating ? `${rawLikes.toFixed(1)} / 5` : 'Sin rating',
        hasRating,
        content: item.contenido ?? item.comentario ?? item.comment ?? '',
        cover: coverByBookId.get(Number(item.BookId)) ?? item.cover ?? ''
      };
    });
  }

  private shuffleArray<T>(items: T[]): T[] {
    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  openReviewDetail(reviewId: number): void {
    this.router.navigate(['/comentarios', reviewId]);
  }

  trackByBookId(index: number, book: RecommendedBook): number {
    return book.id;
  }

  trackByReviewId(index: number, review: FeaturedReview): number {
    return review.id;
  }

  onRecommendedTouchStart(event: TouchEvent): void {
    const strip = this.recommendedStripRef?.nativeElement;
    const touch = event.touches[0];

    if (!strip || !touch) {
      return;
    }

    this.isRecommendedSwiping = true;
    this.recommendedTouchStartX = touch.clientX;
    this.recommendedTouchStartY = touch.clientY;
    this.recommendedScrollStartLeft = strip.scrollLeft;
  }

  onRecommendedTouchMove(event: TouchEvent): void {
    const strip = this.recommendedStripRef?.nativeElement;
    const touch = event.touches[0];

    if (!this.isRecommendedSwiping || !strip || !touch) {
      return;
    }

    const deltaX = touch.clientX - this.recommendedTouchStartX;
    const deltaY = touch.clientY - this.recommendedTouchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      strip.scrollLeft = this.recommendedScrollStartLeft - deltaX;
      event.preventDefault();
    }
  }

  onRecommendedTouchEnd(): void {
    this.isRecommendedSwiping = false;
  }
}