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
  private apiUrl = environment.API_URL + 'reviews';
  private comments$?: Observable<Comentario[]>;
  private readonly commentByIdCache = new Map<number, Observable<Comentario>>();

  constructor(private http: HttpClient) {}

  private normalizeComment(input: RawComment): Comentario {
    const normalizedLikes = input.likes ?? (input.rating != null ? Number(input.rating) : 0);
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
      rating: input.rating ?? null,
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

  getComentario(id: number, forceRefresh = false): Observable<Comentario> {
    if (!forceRefresh) {
      const cached = this.commentByIdCache.get(id);
      if (cached) {
        return cached;
      }
    }

    const request$ = this.http
      .get<ApiResponse<RawComment>>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response: ApiResponse<RawComment>) => this.normalizeComment(response.data)),
        shareReplay(1)
      );

    this.commentByIdCache.set(id, request$);
    return request$;
  }

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
    return this.http
      .post<ApiResponse<Comentario>>(this.apiUrl, comentario)
      .pipe(map((response: ApiResponse<Comentario>) => response.data));
  }
}