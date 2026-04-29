import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { shareReplay } from 'rxjs/operators';
import { Comentario } from '../models/Comentario';
import { environment } from '../environments/environments';

interface ApiResponse<T> {
  data: T;
}

type RawComment = {
  id: number;
  UsuarioId?: number;
  usuario_id?: number;
  BookId?: number;
  libro_id?: number;
  contenido?: string;
  comentario?: string;
  likes?: number;
  valoracion?: number | null;
  user?: string;
  libro?: string;
  portada?: string;
  rating?: number | null;
  comment?: string | null;
  usuario?: { nombre?: string };
  libroData?: { titulo?: string; portada?: string };
};

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {
<<<<<<< HEAD
  private apiUrl = environment.API_URL + 'reviews';
=======
  private apiUrl = environment.API_URL + 'comentarios';
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
  private comments$?: Observable<Comentario[]>;
  private readonly commentByIdCache = new Map<number, Observable<Comentario>>();

  constructor(private http: HttpClient) {}

<<<<<<< HEAD
  private normalizeComment(input: RawComment): Comentario {
    const normalizedRatingSource = input.rating ?? input.valoracion ?? input.likes;
    const normalizedRating = Number(normalizedRatingSource);
    const normalizedLikes = Number.isFinite(normalizedRating) ? normalizedRating : 0;
    const normalizedContent = input.contenido ?? input.comentario ?? input.comment ?? '';

    return {
      id: input.id,
      UsuarioId: input.UsuarioId ?? input.usuario_id,
      BookId: input.BookId ?? input.libro_id,
      contenido: normalizedContent,
      comentario: normalizedContent,
      likes: Number.isFinite(normalizedLikes) ? Number(normalizedLikes) : 0,
      user: input.user ?? input.usuario?.nombre,
      libro: input.libro ?? input.libroData?.titulo,
      portada: input.portada ?? input.libroData?.portada,
      rating: Number.isFinite(normalizedRating) ? Number(normalizedRating) : null,
      comment: input.comment ?? null
    };
  }

  getComentarios(forceRefresh = false): Observable<Comentario[]> {
    if (!this.comments$ || forceRefresh) {
      this.comments$ = this.http
        .get<ApiResponse<RawComment[]>>(this.apiUrl)
        .pipe(
          map((response: ApiResponse<RawComment[]>) => (response.data ?? []).map((item: RawComment) => this.normalizeComment(item))),
          shareReplay(1)
        );
    }

    return this.comments$;
  }

=======
  getComentarios(forceRefresh = false): Observable<Comentario[]> {
    if (!this.comments$ || forceRefresh) {
      this.comments$ = this.http
        .get<ApiResponse<Comentario[]>>(this.apiUrl)
        .pipe(
          map((response) => response.data ?? []),
          shareReplay(1)
        );
    }

    return this.comments$;
  }

>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
  getComentario(id: number, forceRefresh = false): Observable<Comentario> {
    if (!forceRefresh) {
      const cached = this.commentByIdCache.get(id);
      if (cached) {
        return cached;
      }
    }

    const request$ = this.http
<<<<<<< HEAD
      .get<ApiResponse<RawComment>>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response: ApiResponse<RawComment>) => this.normalizeComment(response.data)),
=======
      .get<ApiResponse<Comentario>>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response) => response.data),
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
        shareReplay(1)
      );

    this.commentByIdCache.set(id, request$);
    return request$;
  }

<<<<<<< HEAD
  getComentariosByBookId(bookId: number, excludeCommentId?: number, bookTitle?: string): Observable<Comentario[]> {
    const normalizedTitle = (bookTitle ?? '').trim().toLowerCase();

    return this.getComentarios().pipe(
      map((comments: Comentario[]) =>
        comments.filter((item: Comentario) => {
          const currentBookId = Number(item.BookId ?? (item as any).libro_id);
          const currentBookTitle = String((item as any).libro ?? (item as any).libroData?.titulo ?? '').trim().toLowerCase();
          const sameBookById = Number.isFinite(currentBookId) && currentBookId === Number(bookId);
          const sameBookByTitle = normalizedTitle.length > 0 && currentBookTitle === normalizedTitle;

          if (!sameBookById && !sameBookByTitle) {
=======
  getComentariosByBookId(bookId: number, excludeCommentId?: number): Observable<Comentario[]> {
    return this.getComentarios().pipe(
      map((comments) =>
        comments.filter((item) => {
          const currentBookId = Number(item.BookId ?? (item as any).libro_id);
          if (currentBookId !== Number(bookId)) {
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
            return false;
          }

          if (excludeCommentId == null) {
            return true;
          }

          return Number(item.id) !== Number(excludeCommentId);
        })
      )
    );
  }

  createComentario(comentario: Comentario): Observable<Comentario> {
    const apiPayload = {
      libro_id: comentario.BookId,
      user_id: comentario.UsuarioId,
      rating: comentario.rating ?? comentario.likes ?? 0,
      comentario: comentario.comentario ?? comentario.contenido ?? ''
    };

    return this.http
      .post<ApiResponse<RawComment> | RawComment>(this.apiUrl, apiPayload)
      .pipe(
        map((response: any) => this.normalizeComment(response?.data ?? response))
      );
  }
}