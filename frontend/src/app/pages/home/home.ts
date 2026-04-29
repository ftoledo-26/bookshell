import {
<<<<<<< HEAD
  Component, OnInit, inject, ElementRef, ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy
=======
  Component, OnInit, OnDestroy, inject,
  ChangeDetectorRef, HostListener,
  ChangeDetectionStrategy  // ← añadir
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
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
<<<<<<< HEAD
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home implements OnInit {
  @ViewChild('recommendedStrip')
  private recommendedStripRef?: ElementRef<HTMLDivElement>;

=======
  changeDetection: ChangeDetectionStrategy.OnPush  // ← clave
})
export class Home implements OnInit, OnDestroy {
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
  books: Book[] = [];
  recommendedBooks: RecommendedBook[] = [];
<<<<<<< HEAD
  reviews: FeaturedReview[] = [];
=======
  featuredReviews: FeaturedReview[] = [];//Comentarios
  displayedReviews: FeaturedReview[] = [];
  private readonly reviewBatchSize = 3;
  private readonly scrollThresholdPx = 320;
  private visibleReviewCount = 0;
  private isLoadingMoreReviews = false;
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
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
<<<<<<< HEAD
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
=======
      next: ({ books, comments, users }) => {
        this.books = books;
        this.comments = comments;
        this.timelineComments = this.mapTimelineComments(comments, books, users);
        this.recommendedBooks = this.mapRecommendedBooks(books, comments, users);
        this.featuredReviews = this.mapFeaturedReviews(this.timelineComments);
        this.visibleReviewCount = this.reviewBatchSize;
        this.updateVisibleReviews();
        this.ensureViewportHasScrollableContent();
        this.isLoading = false;
        this.cdr.markForCheck(); // Marcar para verificación de cambios
        if (books.length === 0 && comments.length === 0) {
          this.errorMessage = 'No se pudieron cargar datos ahora. Intenta de nuevo en unos segundos.';
        }
        this.cdr.detectChanges();
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
      },
      error: (error: unknown) => {
        console.error('Error al cargar inicio:', error);
        this.errorMessage = 'Error al cargar comentarios y libros';
        this.isLoading = false;
<<<<<<< HEAD
        this.cdr.markForCheck();
=======
        this.cdr.detectChanges();
        this.cdr.markForCheck(); // Marcar para verificación de cambios en caso de error
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
      }
    });
  }

  private mapTimelineComments(comments: Comentario[], books: Book[], users: Usuario[]): TimelineComment[] {
<<<<<<< HEAD
    const userById = new Map<number, string>(users.map((user) => [user.id, user.nombre]));
    const bookById = new Map<number, string>(books.map((book) => [book.id, book.titulo]));

    return comments.map((comment) => {
=======
    const timeLabels = ['Hace 5 min', 'Hace 22 min', 'Hace 1 h', 'Hace 3 h', 'Ayer'];
    const userById = new Map<number, string>(users.map((user) => [user.id, user.nombre]));
    const bookById = new Map<number, string>(books.map((book) => [book.id, book.titulo]));

    return comments.map((comment, index) => {
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
      const c = comment as any;
      const userId = c.UsuarioId ?? c.usuario_id;
      const bookId = c.BookId ?? c.libro_id;
      
      // Intentar obtener nombre de usuario desde diferentes posibles estructuras
      const userName = 
<<<<<<< HEAD
        c.user ||
        c.nombre ||
=======
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
        c.usuario?.nombre ||
        c.usuarioNombre ||
        c.username ||
        (userId != null ? userById.get(Number(userId)) : undefined) ||
        (userId != null ? String(userId) : 'Sin usuario');
      
      // Intentar obtener título del libro desde diferentes posibles estructuras
      const bookTitle = 
        c.libro?.titulo ||
<<<<<<< HEAD
        c.libro ||
        c.libroData?.titulo ||
=======
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
        c.libroTitulo ||
        c.title ||
        c.titulo ||
        (bookId != null ? bookById.get(Number(bookId)) : undefined) ||
        (bookId != null ? String(bookId) : 'Sin titulo');
<<<<<<< HEAD

      const commentText = c.contenido ?? c.comentario ?? c.comment ?? '';
      const likes = Number(c.likes ?? c.rating ?? c.valoracion ?? 0);
      const cover = c.portada || c.libro?.portada || '';

      return {
        ...comment,
        contenido: commentText,
        likes: Number.isFinite(likes) ? likes : 0,
        username: userName || (userId != null ? String(userId) : 'Sin usuario'),
        bookTitle: bookTitle || (bookId != null ? String(bookId) : 'Sin titulo'),
        cover
=======

      return {
        ...comment,
        username: userName || (userId != null ? String(userId) : 'Sin usuario'),
        bookTitle: bookTitle || (bookId != null ? String(bookId) : 'Sin titulo'),
        createdAt: timeLabels[index % timeLabels.length]
      };
    });
  }

  private mapRecommendedBooks(books: Book[], comments: Comentario[], users: Usuario[]): RecommendedBook[] {
    const dayLabels = ['Apr 07', 'Apr 06', 'Apr 05', 'Apr 04'];
    const userById = new Map<number, string>(users.map((user) => [user.id, user.nombre]));

    return books.slice(0, 8).map((book, index) => {
      const relatedComment = comments.find((comment) => comment.BookId === book.id);
      const rc = relatedComment as any;
      const relatedUserId = rc?.UsuarioId ?? rc?.usuario_id;
      const userName = rc?.usuario?.nombre || rc?.usuarioNombre || rc?.username || (relatedUserId != null ? userById.get(Number(relatedUserId)) : undefined) || (relatedUserId != null ? String(relatedUserId) : 'Sin usuario');

      return {
        id: book.id,
        title: book.titulo,
        cover: book.portada,
        username: userName,
        day: dayLabels[index % dayLabels.length]
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
      };
    });
  }

<<<<<<< HEAD
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
=======
  private mapFeaturedReviews(items: TimelineComment[]): FeaturedReview[] {
    const shuffledItems = this.shuffleArray(items);
    const coverByBookId = new Map<number, string>(this.books.map((book) => [book.id, book.portada]));

    return shuffledItems.map((item, index) => ({
      id: item.id,
      titulo: item.bookTitle,
      year: '2026',
      username: item.username,
      likes: item.likes,
      score: this.getScore(item.likes, index),
      content: item.contenido,
      cover: coverByBookId.get(item.BookId) ?? ''
    }));
  }

private scrollTimeout: ReturnType<typeof setTimeout> | null = null; // ← para throttle

  // Throttle del scroll: en vez de dispararse 60 veces/seg, espera 80ms
  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.scrollTimeout) return;
    this.scrollTimeout = setTimeout(() => {
      this.loadMoreReviewsIfNeeded();
      this.scrollTimeout = null;
    }, 80);
  }
  ngOnDestroy(): void {
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
  }
  private loadMoreReviewsIfNeeded(): void {
    if (this.isLoading || this.isLoadingMoreReviews) {
      return;
    }

    if (this.displayedReviews.length >= this.featuredReviews.length) {
      return;
    }

    const pageBottom = window.scrollY + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;
    const reachedBottom = pageBottom >= pageHeight - this.scrollThresholdPx;

    if (!reachedBottom) {
      return;
    }

    this.isLoadingMoreReviews = true;
    this.visibleReviewCount += this.reviewBatchSize;
    this.updateVisibleReviews();
    this.isLoadingMoreReviews = false;
    this.ensureViewportHasScrollableContent();
  }

  private ensureViewportHasScrollableContent(): void {
    const canScroll = document.documentElement.scrollHeight > window.innerHeight + 8;
    const hasMore = this.displayedReviews.length < this.featuredReviews.length;
    if (!canScroll && hasMore) {
      this.visibleReviewCount += this.reviewBatchSize;
      this.updateVisibleReviews();
      this.cdr.markForCheck(); // ← markForCheck en vez de detectChanges
    }
  }

  private updateVisibleReviews(): void {
    this.displayedReviews = this.featuredReviews.slice(0, this.visibleReviewCount);
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
  }

  private shuffleArray<T>(items: T[]): T[] {
    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

<<<<<<< HEAD
  openReviewDetail(reviewId: number): void {
    this.router.navigate(['/comentarios', reviewId]);
  }

  goToCreateReview(): void {
    const hasToken = localStorage.getItem('token');

    if (!hasToken) {
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/reviews/nueva']);
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
=======
  private getScore(likes: number, index: number): string {
    const score = 3.5 + ((likes + index) % 3) * 0.5;
    return `${score.toFixed(1)} / 5`;
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
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
}