import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Book } from '../../models/Book';
import { BookService } from '../../services/Book.service';
import { CommonModule } from '@angular/common';
import { Comentario } from '../../models/Comentario';
import { ComentarioService } from '../../services/Comentario.service';
import { forkJoin } from 'rxjs';

type TimelineComment = Comentario & {
  username: string;
  bookTitle: string;
  createdAt: string;
};

type RecommendedBook = {
  id: number;
  title: string;
  cover: string;
  username: string;
  day: string;
};

type FeaturedReview = {
  id: number;
  title: string;
  year: string;
  username: string;
  likes: number;
  score: string;
  content: string;
  cover: string;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  books: Book[] = [];
  comments: Comentario[] = [];
  timelineComments: TimelineComment[] = [];
  recommendedBooks: RecommendedBook[] = [];
  featuredReviews: FeaturedReview[] = [];
  isLoading = true;
  errorMessage = '';

  private readonly bookService = inject(BookService);
  private readonly comentarioService = inject(ComentarioService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadHomeData();
  }

  loadHomeData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      books: this.bookService.getBooks(),
      comments: this.comentarioService.getComentarios()
    }).subscribe({
      next: ({ books, comments }) => {
        this.books = books;
        this.comments = comments;
        this.timelineComments = this.mapTimelineComments(comments, books);
        this.recommendedBooks = this.mapRecommendedBooks(books, comments);
        this.featuredReviews = this.mapFeaturedReviews(this.timelineComments);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar inicio:', error);
        this.errorMessage = 'Error al cargar comentarios y libros';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mapTimelineComments(comments: Comentario[], books: Book[]): TimelineComment[] {
    const bookById = new Map<number, string>(books.map((book) => [book.id, book.titulo]));
    const timeLabels = ['Hace 5 min', 'Hace 22 min', 'Hace 1 h', 'Hace 3 h', 'Ayer'];

    return comments.map((comment, index) => ({
      ...comment,
      username: `lector_${comment.UsuarioId}`,
      bookTitle: bookById.get(comment.BookId) ?? `Libro #${comment.BookId}`,
      createdAt: timeLabels[index % timeLabels.length]
    }));
  }

  private mapRecommendedBooks(books: Book[], comments: Comentario[]): RecommendedBook[] {
    const dayLabels = ['Apr 07', 'Apr 06', 'Apr 05', 'Apr 04'];

    return books.slice(0, 8).map((book, index) => {
      const relatedComment = comments.find((comment) => comment.BookId === book.id);

      return {
        id: book.id,
        title: book.titulo,
        cover: book.portada,
        username: relatedComment ? `lector_${relatedComment.UsuarioId}` : `booklover${index + 10}`,
        day: dayLabels[index % dayLabels.length]
      };
    });
  }

  private mapFeaturedReviews(items: TimelineComment[]): FeaturedReview[] {
    return items.slice(0, 6).map((item, index) => ({
      id: item.id,
      title: item.bookTitle,
      year: '2026',
      username: item.username,
      likes: item.likes,
      score: this.getScore(item.likes, index),
      content: item.contenido,
      cover: this.books.find((book) => book.id === item.BookId)?.portada ?? ''
    }));
  }

  private getScore(likes: number, index: number): string {
    const score = 3.5 + ((likes + index) % 3) * 0.5;
    return `${score.toFixed(1)} / 5`;
  }
}