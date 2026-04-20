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

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {
  private apiUrl = environment.API_URL + 'comentarios';
  private comments$?: Observable<Comentario[]>;
  private readonly commentByIdCache = new Map<number, Observable<Comentario>>();

  constructor(private http: HttpClient) {}

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

  getComentario(id: number, forceRefresh = false): Observable<Comentario> {
    if (!forceRefresh) {
      const cached = this.commentByIdCache.get(id);
      if (cached) {
        return cached;
      }
    }

    const request$ = this.http
      .get<ApiResponse<Comentario>>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response) => response.data),
        shareReplay(1)
      );

    this.commentByIdCache.set(id, request$);
    return request$;
  }

  getComentariosByBookId(bookId: number, excludeCommentId?: number): Observable<Comentario[]> {
    return this.getComentarios().pipe(
      map((comments) =>
        comments.filter((item) => {
          const currentBookId = Number(item.BookId ?? (item as any).libro_id);
          if (currentBookId !== Number(bookId)) {
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
      .pipe(map((response) => response.data));
  }
}