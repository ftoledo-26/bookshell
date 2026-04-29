import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, forkJoin, map, of, switchMap, timeout } from 'rxjs';
import { Book } from '../../models/Book';
import { Comentario } from '../../models/Comentario';
import { Usuario } from '../../models/Usuario';
import { BookService } from '../../services/Book.service';
import { ComentarioService } from '../../services/Comentario.service';
import { UsuarioService } from '../../services/Usuario.service';


type CommentDetailView = {
	id: number;
	bookId: number | null;
<<<<<<< HEAD
	bookTitleRaw: string;
=======
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
	username: string;
	bookTitle: string;
	author: string;
	content: string;
	likes: number;
<<<<<<< HEAD
	ratingValue: number;
	ratingCount: number;
	reviewCount: number;
	hasBookRating: boolean;
=======
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
	coverUrl: string;
};

type RelatedCommentView = {
	id: number;
	username: string;
	content: string;
	likes: number;
<<<<<<< HEAD
	hasRating: boolean;
=======
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
};

@Component({
	selector: 'app-comentario-page',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './Comentario.html',
	styleUrls: ['./Comentario.css']
})
export class ComentarioPage implements OnInit {
     private readonly cdr = inject(ChangeDetectorRef);
	detail: CommentDetailView | null = null;
	relatedComments: RelatedCommentView[] = [];
	isLoading = true;
	isLoadingRelated = false;
	errorMessage = '';

	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);
	private readonly comentarioService = inject(ComentarioService);
	private readonly bookService = inject(BookService);
	private readonly usuarioService = inject(UsuarioService);

	ngOnInit(): void {
		window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

		const rawId = this.route.snapshot.paramMap.get('id');
		const commentId = Number(rawId);

		if (!rawId || Number.isNaN(commentId)) {
			this.isLoading = false;
			this.errorMessage = 'El comentario solicitado no es valido.';
			return;
		}

		this.loadCommentDetail(commentId);
	}

	private loadCommentDetail(commentId: number): void {
		this.isLoading = true;
		this.isLoadingRelated = true;
		this.errorMessage = '';
		this.detail = null;
		this.relatedComments = [];

		this.comentarioService
<<<<<<< HEAD
			.getComentarios()
			.pipe(
				timeout(8000),
				map((comments: Comentario[]) => comments.find((item: Comentario) => Number(item.id) === commentId)),
				catchError(() => of(undefined)),
				switchMap((comment: Comentario | undefined) => {
					if (comment) {
						return of(comment);
					}

					return this.comentarioService.getComentario(commentId).pipe(
						timeout(6000),
						catchError(() => of(undefined))
					);
				}),
				switchMap((comment: Comentario | undefined) => {
=======
			.getComentario(commentId)
			.pipe(
				timeout(8000),
				catchError(() =>
					this.comentarioService.getComentarios().pipe(
						timeout(8000),
						map((comments) => comments.find((item) => Number(item.id) === commentId)),
						catchError(() => of(undefined))
					)
				),
				switchMap((comment) => {
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
					if (!comment) {
						return of({
							comment: null,
							book: null,
<<<<<<< HEAD
							books: [] as Book[],
=======
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
							users: [] as Usuario[]
						});
					}

					const c = comment as any;
					const userId = c.UsuarioId ?? c.usuario_id;
					const bookId = c.BookId ?? c.libro_id;
<<<<<<< HEAD
					const bookTitle = String(c.libro ?? c.libroTitulo ?? c.titulo ?? '').trim();
=======
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
					const hasEmbeddedUsername = Boolean(c.usuario?.nombre || c.usuarioNombre || c.username);

					return forkJoin({
						comment: of(comment),
						book:
							bookId != null
								? this.bookService.getBook(Number(bookId)).pipe(timeout(6000), catchError(() => of(null)))
								: of(null),
<<<<<<< HEAD
						books:
							bookId == null && bookTitle.length > 0
								? this.bookService.getBooks().pipe(timeout(6000), catchError(() => of([] as Book[])))
								: of([] as Book[]),
=======
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
						users:
							!hasEmbeddedUsername && userId != null
								? this.usuarioService.getUsuarios().pipe(timeout(6000), catchError(() => of([] as Usuario[])))
								: of([] as Usuario[])
					});
				}),
					catchError(() =>
						of({
							comment: null,
							book: null,
<<<<<<< HEAD
							books: [] as Book[],
=======
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
							users: [] as Usuario[]
						})
					),
				finalize(() => {
					this.isLoading = false;
					this.cdr.markForCheck();
				})
			)
			.subscribe({
<<<<<<< HEAD
				next: (result: { comment: Comentario | null; book: Book | null; books: Book[]; users: Usuario[] }) => {
					const { comment, book, books, users } = result;
=======
				next: ({ comment, book, users }) => {
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
                    if (!comment) {
                        this.errorMessage = 'No se encontró ese comentario...';
                        this.isLoadingRelated = false;
                        this.cdr.markForCheck();
                        return;
                    }
<<<<<<< HEAD
					const resolvedBook = this.resolveBookFromComment(comment, book, books);
					this.detail = this.mapCommentDetail(comment, resolvedBook, users);
					this.loadRelatedComments(this.detail.bookId, this.detail.bookTitleRaw, comment.id, users);
=======
                    this.detail = this.mapCommentDetail(comment, book, users);
					this.loadRelatedComments(this.detail.bookId, comment.id, users);
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
					this.cdr.markForCheck();
                    },
                    error: () => {
                    this.errorMessage = 'No se pudo cargar el detalle.';
                    this.isLoadingRelated = false;
                    this.cdr.markForCheck();
                    }
			});
	}

<<<<<<< HEAD
	private loadRelatedComments(bookId: number | null, bookTitle: string, currentCommentId: number, users: Usuario[]): void {
		if (bookId == null && bookTitle.trim().length === 0) {
=======
	private loadRelatedComments(bookId: number | null, currentCommentId: number, users: Usuario[]): void {
		if (bookId == null) {
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
			this.relatedComments = [];
			this.isLoadingRelated = false;
			this.cdr.markForCheck();
			return;
		}

		this.isLoadingRelated = true;

		forkJoin({
<<<<<<< HEAD
			relatedComments: this.comentarioService.getComentariosByBookId(bookId ?? -1, currentCommentId, bookTitle).pipe(
=======
			relatedComments: this.comentarioService.getComentariosByBookId(bookId, currentCommentId).pipe(
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
				timeout(8000),
				catchError(() => of([] as Comentario[]))
			),
			users: users.length > 0
				? of(users)
				: this.usuarioService.getUsuarios().pipe(timeout(6000), catchError(() => of([] as Usuario[])))
		})
			.pipe(
				finalize(() => {
					this.isLoadingRelated = false;
					this.cdr.markForCheck();
				})
			)
<<<<<<< HEAD
			.subscribe((result: { relatedComments: Comentario[]; users: Usuario[] }) => {
				const { relatedComments, users: relatedUsers } = result;
=======
			.subscribe(({ relatedComments, users: relatedUsers }) => {
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
				this.relatedComments = this.mapRelatedComments(relatedComments, relatedUsers);
				this.cdr.markForCheck();
			});
	}

<<<<<<< HEAD
	private resolveBookFromComment(comment: Comentario, loadedBook: Book | null, books: Book[]): Book | null {
		if (loadedBook) {
			return loadedBook;
		}

		const c = comment as any;
		const bookTitle = String(c.libro ?? c.libroData?.titulo ?? c.libroTitulo ?? c.titulo ?? '').trim().toLowerCase();
		if (!bookTitle) {
			return null;
		}

		return books.find((item) => item.titulo.trim().toLowerCase() === bookTitle) ?? null;
	}

=======
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
	private mapCommentDetail(comment: Comentario, book: Book | null, users: Usuario[]): CommentDetailView {
		const c = comment as any;
		const userId = c.UsuarioId ?? c.usuario_id;
		const user = users.find((item) => item.id === Number(userId));
		const bookId = c.BookId ?? c.libro_id;
<<<<<<< HEAD
		const rawTitle = String(c.libro ?? c.libroTitulo ?? c.title ?? c.titulo ?? book?.titulo ?? '').trim();
		const normalizedLikes = this.resolveCommentLikes(comment);
		const ratingStats = this.getBookRatingStats(book);
		const ratingValue = ratingStats.count > 0 ? ratingStats.average : normalizedLikes;

		return {
			id: comment.id,
			bookId: bookId != null ? Number(bookId) : (book?.id ?? null),
			bookTitleRaw: rawTitle,
			username: c.user || c.nombre || c.usuario?.nombre || c.usuarioNombre || c.username || user?.nombre || 'Usuario desconocido',
			bookTitle: rawTitle || 'Libro sin titulo',
			author: book?.autor || 'Autor no disponible',
			content: c.contenido ?? c.comentario ?? c.comment ?? '',
			likes: normalizedLikes,
			ratingValue: Number.isFinite(ratingValue) ? ratingValue : 0,
			ratingCount: ratingStats.count,
			reviewCount: ratingStats.total,
			hasBookRating: ratingStats.count > 0,
			coverUrl: this.normalizeCoverPath(c.portada || book?.portada)
=======

		return {
			id: comment.id,
			bookId: bookId != null ? Number(bookId) : null,
			username: c.usuario?.nombre || c.usuarioNombre || c.username || user?.nombre || 'Usuario desconocido',
			bookTitle: c.libro?.titulo || c.libroTitulo || c.title || c.titulo || book?.titulo || 'Libro sin titulo',
			author: book?.autor || 'Autor no disponible',
			content: comment.contenido,
			likes: comment.likes,
			coverUrl: book?.portada || '/prueba.webp'
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
		};
	}

	private mapRelatedComments(comments: Comentario[], users: Usuario[]): RelatedCommentView[] {
		return comments.map((comment) => {
			const c = comment as any;
			const userId = c.UsuarioId ?? c.usuario_id;
			const user = users.find((item) => item.id === Number(userId));

			return {
				id: comment.id,
<<<<<<< HEAD
				username: c.user || c.nombre || c.usuario?.nombre || c.usuarioNombre || c.username || user?.nombre || 'Usuario desconocido',
				content: c.contenido ?? c.comentario ?? c.comment ?? '',
				likes: this.resolveCommentLikes(comment),
				hasRating: this.resolveCommentLikes(comment) > 0
=======
				username: c.usuario?.nombre || c.usuarioNombre || c.username || user?.nombre || 'Usuario desconocido',
				content: comment.contenido,
				likes: comment.likes
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
			};
		});
	}

<<<<<<< HEAD
	private buildReviewLikesMap(book: Book | null): Map<number, number> {
		return new Map<number, number>();
	}

	private resolveCommentLikes(comment: Comentario): number {
		const c = comment as any;
		const rawLikes = c.likes ?? c.likes_count ?? c.rating ?? c.valoracion ?? 0;
		const likes = Number(rawLikes);
		return Number.isFinite(likes) ? likes : 0;
	}

	private getBookRatingStats(book: Book | null): { average: number; count: number; total: number } {
		const reviews = book?.reviews ?? [];
		const ratings = reviews
			.map((review) => (review as any).rating)
			.filter((value) => value != null)
			.map((value) => Number(value))
			.filter((value) => Number.isFinite(value));

		if (ratings.length === 0) {
			return { average: 0, count: 0, total: reviews.length };
		}

		const total = ratings.reduce((sum, value) => sum + value, 0);
		return {
			average: Number((total / ratings.length).toFixed(1)),
			count: ratings.length,
			total: reviews.length
		};
	}

	private normalizeCoverPath(rawCover?: string): string {
		const raw = String(rawCover ?? '').trim();
		if (!raw) {
			return '/prueba.webp';
		}

		const lowered = raw.toLowerCase();
		if (lowered === 'default.png' || lowered === 'default.jpg' || lowered === '/default.jpg' || lowered === '/default.png') {
			return '/default.png';
		}

		if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) {
			return raw;
		}

		return `/${raw}`;
	}

=======
>>>>>>> d4152f23f0aec8dabcc646bacdf83f51a6eddf0a
	trackByRelatedCommentId(index: number, comment: RelatedCommentView): number {
		return comment.id;
	}

	goHome(): void {
		this.router.navigate(['/']);
	}
}
