import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Book } from '../../models/Book';
import { Comentario } from '../../models/Comentario';
import { Usuario } from '../../models/Usuario';
import { BookService } from '../../services/Book.service';
import { ComentarioService } from '../../services/Comentario.service';
import { LoginService } from '../../services/Login.service';
import { UsuarioService } from '../../services/Usuario.service';

type ProfileMetric = {
	value: string;
	label: string;
};

type ProfileBook = {
	title: string;
	author: string;
	year: string;
	rating: string;
};

type ProfileActivity = {
	title: string;
	detail: string;
	time: string;
};

type LikedCommentView = {
	id: number;
	bookTitle: string;
	author: string;
	content: string;
	likes: number;
	coverUrl: string;
};

type ProfileTab = 'Profile' | 'Books' | 'Reviews' | 'Likes';

@Component({
	selector: 'app-usuario-page',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './usuario.html',
	styleUrls: ['./usuario.css']
})
export class UsuarioPage implements OnInit {
	private readonly loginService = inject(LoginService);
	private readonly usuarioService = inject(UsuarioService);
	private readonly comentarioService = inject(ComentarioService);
	private readonly bookService = inject(BookService);
	private readonly cdr = inject(ChangeDetectorRef);
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);
	private readonly destroyRef = inject(DestroyRef);
	private currentUserId: number | null = this.loginService.getUserId();
	private viewedUserId: number | null = null;

	user: Usuario = {
		id: 0,
		nombre: 'Cargando...',
		email: '',
		password: '',
		rol: 'usuario',
		foto: '',
		phone: '',
		descripcion: '',
		reviews: [],
		likes: []
	};
	editDraft = {
		nombre: '',
		email: '',
		descripcion: '',
	};
	isEditing = false;
	isLoading = true;
	isSaving = false;
	errorMessage = '';
	successMessage = '';
	activeTab: ProfileTab = 'Profile';
	bookSearchOpen = false;
	bookSearchQuery = '';
	isSearchingBooks = false;
	isSavingBook = false;
	bookSearchResults: Book[] = [];
	selectedBooks: Book[] = [];
	likedComments: LikedCommentView[] = [];
	private profileComments: Comentario[] = [];
	private profileBooks: Book[] = [];

	readonly profileTabs: ProfileTab[] = ['Profile', 'Books', 'Reviews', 'Likes'];
	metrics: ProfileMetric[] = [
		{ value: '0', label: 'Reviews' },
		{ value: '0', label: 'Books' },
		{ value: '0', label: 'Likes' }
	];
	favoriteBooks: ProfileBook[] = [
		{ title: 'Sin libros todavía', author: 'Escribe tu primera review para empezar', year: 'Base de datos', rating: '--' }
	];
	activity: ProfileActivity[] = [
		{ title: 'Sin actividad reciente', detail: 'Cuando publiques reviews aparecerán aquí.', time: 'Ahora' }
	];

	ngOnInit(): void {
		this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
			const rawId = params.get('id');
			const targetUserId = rawId ? Number(rawId) : null;
			this.loadProfile(Number.isFinite(targetUserId ?? NaN) ? targetUserId : null, false);
		});

		// Listen to query params to detect refresh from comment creation
		this.route.queryParams.pipe(
			map((params) => params['refresh']),
			distinctUntilChanged(),
			takeUntilDestroyed(this.destroyRef)
		).subscribe(() => {
			// Re-fetch comments with force refresh when redirected from review creation
			const rawId = this.route.snapshot.paramMap.get('id');
			const targetUserId = rawId ? Number(rawId) : null;
			this.loadProfile(Number.isFinite(targetUserId ?? NaN) ? targetUserId : null, true);
		});
	}

	private loadProfile(targetUserId: number | null, forceRefreshComments = false): void {
		this.isLoading = true;
		this.errorMessage = '';
		this.successMessage = '';
		this.isEditing = false;
		this.bookSearchOpen = false;
		this.bookSearchQuery = '';
		this.bookSearchResults = [];
		this.selectedBooks = [];
		this.likedComments = [];
		this.profileComments = [];
		this.profileBooks = [];

		const authUserId = this.loginService.getUserId();
		this.currentUserId = authUserId;
		const storedUserId = this.loginService.getUserId();
		const storedUsername = (this.loginService.getUsername() ?? '').trim().toLowerCase();
		const requestedUserId = targetUserId ?? storedUserId;
		this.viewedUserId = requestedUserId;

		const user$ = requestedUserId != null
			? this.usuarioService.getUsuario(requestedUserId).pipe(
				catchError(() => this.usuarioService.getUsuarios().pipe(
					map((users) => users.find((item) => item.id === requestedUserId) ?? null),
					catchError(() => of(null))
				))
			)
			: authUserId != null
				? this.usuarioService.getUsuario(authUserId).pipe(
					catchError(() => this.usuarioService.getUsuarios().pipe(
						map((users) => users.find((item) => item.id === authUserId) ?? null),
						catchError(() => of(null))
					))
				)
				: this.usuarioService.getUsuarios().pipe(
					map((users) => {
						if (!storedUsername) {
							return null;
						}

						return users.find((item) => {
							const userName = String(item.nombre ?? '').trim().toLowerCase();
							const userEmail = String(item.email ?? '').trim().toLowerCase();
							return userName === storedUsername || userEmail === storedUsername;
						}) ?? null;
					}),
					catchError(() => of(null))
				);

		user$.pipe(
			switchMap((user) => {
				if (!user) {
					return of({ user: null, comments: [] as Comentario[], books: [] as Book[] });
				}

				this.viewedUserId = user.id;
				this.selectedBooks = this.canEditProfile() ? this.loadSelectedBooks(user.id) : [];

				return this.comentarioService.getComentarios(forceRefreshComments).pipe(
					map((comments) => comments.filter((comment) => this.isCommentFromCurrentUser(comment, user))),
					catchError(() => of([] as Comentario[])),
					switchMap((comments) => this.loadBooksForComments(user, comments))
				);
			}),
			catchError(() => of({ user: null, comments: [] as Comentario[], books: [] as Book[] }))
		).subscribe({
			next: (result) => {
				if (!result.user) {
					this.errorMessage = 'No se pudo identificar el perfil solicitado.';
					this.isLoading = false;
					this.cdr.detectChanges();
					return;
				}

				this.user = result.user;
				this.viewedUserId = result.user.id;
				this.editDraft = {
					nombre: String(result.user.nombre ?? ''),
					email: String(result.user.email ?? ''),
					descripcion: String(result.user.descripcion ?? '')
				};
				this.profileComments = result.comments;
				this.profileBooks = result.books;
				this.metrics = this.buildMetrics(this.profileComments);
				this.favoriteBooks = this.buildFavoriteBooks(this.profileComments, this.profileBooks, this.selectedBooks);
				this.activity = this.buildActivityFeed(this.profileComments, this.profileBooks);
				this.bookSearchOpen = this.canEditProfile() && this.favoriteBooks.length === 1 && this.selectedBooks.length === 0;
				if (this.activeTab === 'Likes') {
					this.loadLikedComments(forceRefreshComments);
				}
				this.isLoading = false;
				this.cdr.detectChanges();
			},
			error: () => {
				this.errorMessage = 'No se pudo cargar el perfil.';
				this.isLoading = false;
				this.cdr.detectChanges();
			}
		});
	}

	canEditProfile(): boolean {
		return this.currentUserId != null && this.viewedUserId != null && Number(this.currentUserId) === Number(this.viewedUserId);
	}

	private loadBooksForComments(user: Usuario, comments: Comentario[]) {
		const bookIds = this.extractDistinctBookIds(comments);

		if (bookIds.length === 0) {
			return of({ user, comments, books: [] as Book[] });
		}

		return forkJoin(bookIds.slice(0, 4).map((bookId) => this.bookService.getBook(bookId).pipe(catchError(() => of(null))))).pipe(
			map((books) => books.filter((book): book is Book => book !== null)),
			map((books) => ({ user, comments, books }))
		);
	}

	private loadSelectedBooks(userId: number): Book[] {
		try {
			const raw = localStorage.getItem(this.profileBooksStorageKey(userId));
			if (!raw) {
				return [];
			}

			const parsed = JSON.parse(raw) as Book[];
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}

	private persistSelectedBooks(userId: number, books: Book[]): void {
		localStorage.setItem(this.profileBooksStorageKey(userId), JSON.stringify(books));
	}

	private profileBooksStorageKey(userId: number): string {
		return `profileBooks:${userId}`;
	}

	private isCommentFromCurrentUser(comment: Comentario, user: Usuario): boolean {
		const raw = comment as any;
		const commentUserId = raw.UsuarioId ?? raw.usuario_id;

		if (commentUserId != null && Number(commentUserId) === Number(user.id)) {
			return true;
		}

		const storedUsername = (this.loginService.getUsername() ?? '').trim().toLowerCase();
		const embeddedUserName = String(raw.user ?? raw.usuario?.nombre ?? raw.usuarioNombre ?? raw.username ?? '').trim().toLowerCase();

		return storedUsername.length > 0 && embeddedUserName.length > 0 && storedUsername === embeddedUserName;
	}

	private extractDistinctBookIds(comments: Comentario[]): number[] {
		const bookIds = comments
			.map((comment) => {
				const raw = comment as any;
				const rawBookId = raw.BookId ?? raw.libro_id;
				if (rawBookId == null) {
					return null;
				}

				const normalizedBookId = Number(rawBookId);
				return Number.isFinite(normalizedBookId) ? normalizedBookId : null;
			})
			.filter((bookId): bookId is number => bookId !== null);

		return Array.from(new Set(bookIds));
	}

	private buildMetrics(comments: Comentario[]): ProfileMetric[] {
		const totalLikes = comments.reduce((sum, comment) => sum + this.resolveCommentLikes(comment), 0);
		const reviewedBooks = this.extractDistinctBookIds(comments).length;

		return [
			{ value: String(comments.length), label: 'Reviews' },
			{ value: String(reviewedBooks), label: 'Books' },
			{ value: String(totalLikes), label: 'Likes' }
		];
	}

	private buildFavoriteBooks(comments: Comentario[], books: Book[], profileBooks: Book[]): ProfileBook[] {
		const sourceBooks = [...profileBooks];

		for (const book of books) {
			if (!sourceBooks.some((item) => item.id === book.id)) {
				sourceBooks.push(book);
			}
		}

		if (comments.length === 0 && sourceBooks.length === 0) {
			return [
				{ title: 'Sin libros todavía', author: 'Usa el buscador para añadir un libro', year: 'Base de datos', rating: '--' }
			];
		}

		const commentsByBook = new Map<number, Comentario[]>();

		for (const comment of comments) {
			const raw = comment as any;
			const rawBookId = raw.BookId ?? raw.libro_id;

			if (rawBookId == null) {
				continue;
			}

			const normalizedBookId = Number(rawBookId);
			if (!Number.isFinite(normalizedBookId)) {
				continue;
			}

			const current = commentsByBook.get(normalizedBookId) ?? [];
			current.push(comment);
			commentsByBook.set(normalizedBookId, current);
		}

		return sourceBooks.map((book) => {
			const bookComments = commentsByBook.get(book.id) ?? [];
			const averageLikes = bookComments.length > 0
				? bookComments.reduce((sum, comment) => sum + this.resolveCommentLikes(comment), 0) / bookComments.length
				: 0;

			return {
				title: book.titulo,
				author: book.autor,
				year: `Libro #${book.id}`,
				rating: `${bookComments.length} reviews · ${averageLikes.toFixed(1)} likes`
			};
		});
	}

	openBookFinder(): void {
		if (!this.canEditProfile()) {
			this.errorMessage = 'Solo puedes añadir libros a tu propio perfil.';
			return;
		}

		this.bookSearchOpen = true;
		this.activeTab = 'Books';
		this.errorMessage = '';
		this.successMessage = '';
		this.cdr.detectChanges();
	}

	closeBookFinder(): void {
		this.bookSearchOpen = false;
		this.bookSearchQuery = '';
		this.bookSearchResults = [];
		this.cdr.detectChanges();
	}

	searchBooks(): void {
		const query = this.bookSearchQuery.trim();

		if (!query) {
			this.errorMessage = 'Escribe al menos un título o autor para buscar.';
			this.bookSearchResults = [];
			return;
		}

		this.isSearchingBooks = true;
		this.errorMessage = '';
		this.successMessage = '';

		this.bookService.searchBook(query).pipe(
			catchError(() => of([] as Book[]))
		).subscribe({
			next: (results) => {
				this.bookSearchResults = results;
				this.isSearchingBooks = false;
				this.cdr.detectChanges();
			},
			error: () => {
				this.errorMessage = 'No se pudieron buscar libros.';
				this.bookSearchResults = [];
				this.isSearchingBooks = false;
				this.cdr.detectChanges();
			}
		});
	}

	addBookToProfile(book: Book): void {
		if (!this.canEditProfile() || !this.currentUserId) {
			this.errorMessage = 'No puedes añadir libros a un perfil que no sea el tuyo.';
			return;
		}

		const alreadyAdded = this.selectedBooks.some((item) => item.id === book.id);
		if (alreadyAdded) {
			this.successMessage = 'Ese libro ya está en tu perfil.';
			return;
		}

		this.isSavingBook = true;
		this.errorMessage = '';
		this.successMessage = '';

		this.selectedBooks = [book, ...this.selectedBooks];
		this.persistSelectedBooks(this.currentUserId, this.selectedBooks);
		this.favoriteBooks = this.buildFavoriteBooks(this.profileComments, this.profileBooks, this.selectedBooks);
		this.successMessage = 'Libro añadido a tu perfil.';
		this.isSavingBook = false;
		this.bookSearchOpen = false;
		this.bookSearchQuery = '';
		this.bookSearchResults = [];
		this.cdr.detectChanges();
	}

	private buildActivityFeed(comments: Comentario[], books: Book[]): ProfileActivity[] {
		if (comments.length === 0) {
			return [
				{ title: 'Sin actividad reciente', detail: 'Cuando publiques reviews aparecerán aquí.', time: 'Ahora' }
			];
		}

		const orderedComments = [...comments].sort((left, right) => Number(right.id) - Number(left.id));
		const bookById = new Map<number, Book>(books.map((book) => [book.id, book]));

		return orderedComments.slice(0, 3).map((comment, index) => {
			const raw = comment as any;
			const rawBookId = raw.BookId ?? raw.libro_id;
			const normalizedBookId = rawBookId != null ? Number(rawBookId) : null;
			const book = normalizedBookId != null && Number.isFinite(normalizedBookId) ? bookById.get(normalizedBookId) : null;

			return {
				title: book?.titulo ?? String(raw.libro ?? raw.libroTitulo ?? 'Review reciente'),
				detail: raw.contenido ?? raw.comment ?? 'Sin contenido',
				time: index === 0 ? 'Ahora' : index === 1 ? 'Hace un momento' : 'Reciente'
			};
		});
	}

	private resolveCommentLikes(comment: Comentario): number {
		return this.comentarioService.getCommentLikeCount(comment);
	}

	private loadLikedComments(forceRefreshComments = false): void {
		if (!this.canEditProfile() || this.currentUserId == null) {
			this.likedComments = [];
			this.cdr.detectChanges();
			return;
		}

		this.comentarioService.getComentarios(forceRefreshComments).subscribe({
			next: (comments) => {
				const likedIds = new Set(this.comentarioService.getLikedCommentIds(this.currentUserId));

				this.likedComments = comments
					.filter((comment) => likedIds.has(comment.id))
					.sort((left, right) => Number(right.id) - Number(left.id))
					.map((comment) => {
						const raw = comment as any;
						return {
							id: comment.id,
							bookTitle: String(raw.libro ?? raw.libroData?.titulo ?? raw.libroTitulo ?? raw.titulo ?? 'Comentario liked'),
							author: String(raw.user ?? raw.usuario?.nombre ?? raw.usuarioNombre ?? raw.username ?? 'Usuario desconocido'),
							content: String(raw.contenido ?? raw.comentario ?? raw.comment ?? ''),
							likes: this.comentarioService.getCommentLikeCount(comment),
							coverUrl: this.normalizeCoverPath(raw.portada ?? raw.libroData?.portada)
						} satisfies LikedCommentView;
					});
				this.cdr.detectChanges();
			},
			error: () => {
				this.likedComments = [];
				this.cdr.detectChanges();
			}
		});
	}

	startEditing(): void {
		if (!this.canEditProfile()) {
			this.errorMessage = 'Solo puedes editar tu propio perfil.';
			return;
		}

		this.editDraft = {
			nombre: String(this.user.nombre ?? ''),
			email: String(this.user.email ?? ''),
			descripcion: String(this.user.descripcion ?? '')
		};
		this.errorMessage = '';
		this.successMessage = '';
		this.isEditing = true;
		this.cdr.detectChanges();
	}

	cancelEditing(): void {
		this.isEditing = false;
		this.errorMessage = '';
		this.successMessage = '';
		this.editDraft = {
			nombre: String(this.user.nombre ?? ''),
			email: String(this.user.email ?? ''),
			descripcion: String(this.user.descripcion ?? '')
		};
		this.cdr.detectChanges();
	}

	saveProfile(): void {
		const nombre = this.editDraft.nombre.trim();
		const email = this.editDraft.email.trim();
		const descripcion = this.editDraft.descripcion?.trim() ?? '';

		if (!nombre || !email) {
			this.errorMessage = 'Nombre y email son obligatorios.';
			return;
		}

		const userId = this.currentUserId ?? this.user.id;
		if (!userId || !this.canEditProfile()) {
			this.errorMessage = 'No se pudo actualizar el perfil porque no tienes permiso para editarlo.';
			return;
		}

		this.isSaving = true;
		this.errorMessage = '';
		this.successMessage = '';

		this.usuarioService.updateUsuario(userId, { nombre, email, descripcion }).subscribe({
			next: (updatedUser) => {
				this.user = updatedUser;
				this.currentUserId = updatedUser.id;
				this.viewedUserId = updatedUser.id;
				localStorage.setItem('username', updatedUser.nombre);
				this.isEditing = false;
				this.successMessage = 'Perfil actualizado correctamente.';
				this.isSaving = false;
				this.cdr.detectChanges();
			},
			error: () => {
				this.errorMessage = 'No se pudo actualizar el perfil.';
				this.isSaving = false;
				this.cdr.detectChanges();
			}
		});
	}

	setActiveTab(tab: ProfileTab): void {
		this.activeTab = tab;
		if (tab === 'Likes') {
			this.loadLikedComments(false);
		}
	}

	openLikedComment(commentId: number): void {
		this.router.navigate(['/comentarios', commentId]);
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

	goToCreateReview(): void {
		if (!this.loginService.getToken()) {
			this.router.navigate(['/login']);
			return;
		}

		this.router.navigate(['/reviews/nueva']);
	}
}