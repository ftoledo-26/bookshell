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
	username: string;
	bookTitle: string;
	author: string;
	content: string;
	likes: number;
	coverUrl: string;
};

type RelatedCommentView = {
	id: number;
	username: string;
	content: string;
	likes: number;
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
					if (!comment) {
						return of({
							comment: null,
							book: null,
							users: [] as Usuario[]
						});
					}

					const c = comment as any;
					const userId = c.UsuarioId ?? c.usuario_id;
					const bookId = c.BookId ?? c.libro_id;
					const hasEmbeddedUsername = Boolean(c.usuario?.nombre || c.usuarioNombre || c.username);

					return forkJoin({
						comment: of(comment),
						book:
							bookId != null
								? this.bookService.getBook(Number(bookId)).pipe(timeout(6000), catchError(() => of(null)))
								: of(null),
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
							users: [] as Usuario[]
						})
					),
				finalize(() => {
					this.isLoading = false;
					this.cdr.markForCheck();
				})
			)
			.subscribe({
				next: ({ comment, book, users }) => {
                    if (!comment) {
                        this.errorMessage = 'No se encontró ese comentario...';
                        this.isLoadingRelated = false;
                        this.cdr.markForCheck();
                        return;
                    }
                    this.detail = this.mapCommentDetail(comment, book, users);
					this.loadRelatedComments(this.detail.bookId, comment.id, users);
					this.cdr.markForCheck();
                    },
                    error: () => {
                    this.errorMessage = 'No se pudo cargar el detalle.';
                    this.isLoadingRelated = false;
                    this.cdr.markForCheck();
                    }
			});
	}

	private loadRelatedComments(bookId: number | null, currentCommentId: number, users: Usuario[]): void {
		if (bookId == null) {
			this.relatedComments = [];
			this.isLoadingRelated = false;
			this.cdr.markForCheck();
			return;
		}

		this.isLoadingRelated = true;

		forkJoin({
			relatedComments: this.comentarioService.getComentariosByBookId(bookId, currentCommentId).pipe(
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
			.subscribe(({ relatedComments, users: relatedUsers }) => {
				this.relatedComments = this.mapRelatedComments(relatedComments, relatedUsers);
				this.cdr.markForCheck();
			});
	}

	private mapCommentDetail(comment: Comentario, book: Book | null, users: Usuario[]): CommentDetailView {
		const c = comment as any;
		const userId = c.UsuarioId ?? c.usuario_id;
		const user = users.find((item) => item.id === Number(userId));
		const bookId = c.BookId ?? c.libro_id;

		return {
			id: comment.id,
			bookId: bookId != null ? Number(bookId) : null,
			username: c.usuario?.nombre || c.usuarioNombre || c.username || user?.nombre || 'Usuario desconocido',
			bookTitle: c.libro?.titulo || c.libroTitulo || c.title || c.titulo || book?.titulo || 'Libro sin titulo',
			author: book?.autor || 'Autor no disponible',
			content: comment.contenido,
			likes: comment.likes,
			coverUrl: book?.portada || '/prueba.webp'
		};
	}

	private mapRelatedComments(comments: Comentario[], users: Usuario[]): RelatedCommentView[] {
		return comments.map((comment) => {
			const c = comment as any;
			const userId = c.UsuarioId ?? c.usuario_id;
			const user = users.find((item) => item.id === Number(userId));

			return {
				id: comment.id,
				username: c.usuario?.nombre || c.usuarioNombre || c.username || user?.nombre || 'Usuario desconocido',
				content: comment.contenido,
				likes: comment.likes
			};
		});
	}

	trackByRelatedCommentId(index: number, comment: RelatedCommentView): number {
		return comment.id;
	}

	goHome(): void {
		this.router.navigate(['/']);
	}
}
