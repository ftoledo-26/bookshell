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
	username: string;
	bookTitle: string;
	author: string;
	content: string;
	likes: number;
	coverUrl: string;
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
	isLoading = true;
	errorMessage = '';

	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);
	private readonly comentarioService = inject(ComentarioService);
	private readonly bookService = inject(BookService);
	private readonly usuarioService = inject(UsuarioService);

	ngOnInit(): void {
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
		this.errorMessage = '';
		this.detail = null;

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
				})
			)
			.subscribe({
				next: ({ comment, book, users }) => {
                    if (!comment) {
                        this.errorMessage = 'No se encontró ese comentario...';
                        this.cdr.markForCheck(); // 👈 añadir
                        return;
                    }
                    this.detail = this.mapCommentDetail(comment, book, users);
                    this.cdr.markForCheck(); // 👈 añadir
                    },
                    error: () => {
                    this.errorMessage = 'No se pudo cargar el detalle.';
                    this.cdr.markForCheck(); // 👈 añadir
                    }
			});
	}

	private mapCommentDetail(comment: Comentario, book: Book | null, users: Usuario[]): CommentDetailView {
		const c = comment as any;
		const userId = c.UsuarioId ?? c.usuario_id;
		const user = users.find((item) => item.id === Number(userId));

		return {
			id: comment.id,
			username: c.usuario?.nombre || c.usuarioNombre || c.username || user?.nombre || 'Usuario desconocido',
			bookTitle: c.libro?.titulo || c.libroTitulo || c.title || c.titulo || book?.titulo || 'Libro sin titulo',
			author: book?.autor || 'Autor no disponible',
			content: comment.contenido,
			likes: comment.likes,
			coverUrl: book?.portada || '/prueba.webp'
		};
	}

	goHome(): void {
		this.router.navigate(['/']);
	}
}
