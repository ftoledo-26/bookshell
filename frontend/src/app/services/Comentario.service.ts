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
  private apiUrl = environment.API_URL + 'reviews';
  private comments$?: Observable<Comentario[]>;
  private readonly commentByIdCache = new Map<number, Observable<Comentario>>();
  private readonly commentLikeCountsKey = 'commentLikeCounts';

  constructor(private http: HttpClient) {}

  private readJson<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return fallback;
      }

      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private writeJson(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private likedCommentIdsKey(userId: number): string {
    return `commentLikes:${userId}`;
  }

  private readLikedCommentIds(userId: number): number[] {
    const raw = this.readJson<number[]>(this.likedCommentIdsKey(userId), []);
    return Array.isArray(raw)
      ? raw.map((value) => Number(value)).filter((value) => Number.isFinite(value))
      : [];
  }

  private writeLikedCommentIds(userId: number, ids: number[]): void {
    this.writeJson(this.likedCommentIdsKey(userId), Array.from(new Set(ids)));
  }

  private readLikeCounts(): Record<string, number> {
    return this.readJson<Record<string, number>>(this.commentLikeCountsKey, {});
  }

  private writeLikeCounts(counts: Record<string, number>): void {
    this.writeJson(this.commentLikeCountsKey, counts);
  }

  getCommentLikeCount(comment: Pick<Comentario, 'id' | 'likes'>): number {
    const counts = this.readLikeCounts();
    const storedCount = counts[String(comment.id)];
    if (Number.isFinite(Number(storedCount))) {
      return Number(storedCount);
    }

    const fallback = Number(comment.likes ?? 0);
    return Number.isFinite(fallback) ? fallback : 0;
  }

  isCommentLikedByUser(commentId: number, userId: number | null): boolean {
    if (userId == null) {
      return false;
    }

    return this.readLikedCommentIds(userId).includes(Number(commentId));
  }

  getLikedCommentIds(userId: number | null): number[] {
    if (userId == null) {
      return [];
    }

    return this.readLikedCommentIds(userId);
  }

  toggleCommentLike(comment: Pick<Comentario, 'id' | 'likes'>, userId: number | null): { liked: boolean; likes: number } {
    if (userId == null) {
      return { liked: false, likes: this.getCommentLikeCount(comment) };
    }

    const commentId = Number(comment.id);
    const likedIds = new Set(this.readLikedCommentIds(userId));
    const counts = this.readLikeCounts();
    const currentCount = this.getCommentLikeCount(comment);
    const isLiked = likedIds.has(commentId);

    const nextCount = isLiked ? Math.max(0, currentCount - 1) : currentCount + 1;

    if (isLiked) {
      likedIds.delete(commentId);
    } else {
      likedIds.add(commentId);
    }

    counts[String(commentId)] = nextCount;
    this.writeLikedCommentIds(userId, Array.from(likedIds));
    this.writeLikeCounts(counts);

    return {
      liked: !isLiked,
      likes: nextCount
    };
  }

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
    const ratingValue = comentario.rating ?? comentario.likes ?? 0;
    const textValue = comentario.comentario ?? comentario.contenido ?? comentario.comment ?? '';

    const apiPayload = {
      libro_id: comentario.BookId,
      BookId: comentario.BookId,
      user_id: comentario.UsuarioId,
      usuario_id: comentario.UsuarioId,
      UsuarioId: comentario.UsuarioId,
      rating: ratingValue,
      valoracion: ratingValue,
      likes: ratingValue,
      comment: textValue,
      comentario: textValue,
      contenido: textValue
    };

    return this.http
      .post<ApiResponse<RawComment> | RawComment>(this.apiUrl, apiPayload)
      .pipe(
        map((response: any) => {
          // Invalidate comments cache so next load will fetch fresh data
          this.comments$ = undefined;
          this.commentByIdCache.clear();
          return this.normalizeComment(response?.data ?? response);
        })
      );
  }

  updateComentario(id: number, comentario: Comentario): Observable<Comentario> {
    const ratingValue = comentario.rating ?? comentario.likes ?? 0;
    const textValue = comentario.comentario ?? comentario.contenido ?? comentario.comment ?? '';

    const apiPayload = {
      libro_id: comentario.BookId,
      BookId: comentario.BookId,
      user_id: comentario.UsuarioId,
      usuario_id: comentario.UsuarioId,
      UsuarioId: comentario.UsuarioId,
      rating: ratingValue,
      valoracion: ratingValue,
      likes: ratingValue,
      comment: textValue,
      comentario: textValue,
      contenido: textValue
    };

    return this.http
      .put<ApiResponse<RawComment> | RawComment>(`${this.apiUrl}/${id}`, apiPayload)
      .pipe(
        map((response: any) => {
          this.comments$ = undefined;
          this.commentByIdCache.clear();
          return this.normalizeComment(response?.data ?? response);
        })
      );
  }
}