import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, catchError, forkJoin, map, of, switchMap, distinctUntilChanged } from 'rxjs';
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

type BookState = 'favorito' | 'leido' | 'leyendo' | 'abandonado';

type ProfileBookComment = {
	id: number;
	author: string;
	content: string;
	rating: number | null;
	likes: number;
};

type ProfileBookEntry = Book & {
	state: BookState;
};

type ProfileBook = {
	id: number;
	title: string;
	author: string;
	description: string;
	coverUrl: string;
	state: BookState;
	stateLabel: string;
	commentCount: number;
	averageRating?: string;
	comments: ProfileBookComment[];
};

type ActionMenuState = {
	kind: 'book' | 'comment';
	id: number;
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

type EmbeddedUserReview = {
	id?: number;
	libro?: string;
	portada?: string;
	rating?: number | null;
	comentario?: string;
	comment?: string | null;
	likes?: number;
	user?: string;
	username?: string;
	usuario?: { nombre?: string };
	libroData?: { titulo?: string; portada?: string };
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
	profileIsEditable = false;

	// ============ Centralized Helper Methods ============

	private clearMessages(): void {
		this.errorMessage = '';
		this.successMessage = '';
	}

	private setMessage(type: 'error' | 'success', message: string, autoDetect = true): void {
		if (type === 'error') {
			this.errorMessage = message;
			this.successMessage = '';
		} else {
			this.successMessage = message;
			this.errorMessage = '';
		}
		if (autoDetect) this.cdr.detectChanges();
	}

	private requireEditPermission(action: string = 'hacer esto'): boolean {
		if (!this.canEditProfile() || !this.currentUserId) {
			this.setMessage('error', `No puedes ${action} en un perfil que no sea el tuyo.`);
			return false;
		}
		return true;
	}

	private removeFromArray<T extends { id: number }>(array: T[], id: number): T[] {
		return array.filter((item) => item.id !== id);
	}

	private removeNumberFromArray(array: number[], id: number): number[] {
		return array.filter((item) => item !== id);
	}

	private updateInArray<T extends { id: number }>(array: T[], id: number, updater: (item: T) => T): T[] {
		return array.map((item) => item.id === id ? updater(item) : item);
	}

	private withLoadingFlag<T>(flag: keyof this, operation: () => Observable<T>, onSuccess?: (result: any) => void, onError?: (err: any) => void): void {
		const loadingFlagName = flag as string;
		(this as any)[loadingFlagName] = true;
		this.clearMessages();

		operation().subscribe({
			next: (result) => {
				(this as any)[loadingFlagName] = false;
				onSuccess?.(result);
				this.cdr.detectChanges();
			},
			error: (err) => {
				(this as any)[loadingFlagName] = false;
				onError?.(err) || this.setMessage('error', 'Operación fallida', false);
				this.cdr.detectChanges();
			}
		});
	}

	// ============ End Centralized Helpers ============

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
	selectedBooks: ProfileBookEntry[] = [];
	likedComments: LikedCommentView[] = [];
	bookSearchStates: Record<number, BookState> = {};
	activeActionMenu: ActionMenuState | null = null;
	actionMenuVisible: ActionMenuState | null = null;
	private actionMenuCloseTimer: ReturnType<typeof setTimeout> | null = null;
	previewedBook: ProfileBook | null = null;
	previewDrawerVisible = false;
	previewMode: 'view' | 'edit' = 'view';
	previewBookState: BookState = 'favorito';
	hiddenProfileBookIds: number[] = [];
	private previewCloseTimer: ReturnType<typeof setTimeout> | null = null;
	private profileComments: Comentario[] = [];
	private allComments: Comentario[] = [];
	private profileBooks: Book[] = [];
	readonly bookStateOptions: Array<{ value: BookState; label: string }> = [
		{ value: 'favorito', label: 'Favorito' },
		{ value: 'leido', label: 'Leído' },
		{ value: 'leyendo', label: 'Leyendo' },
		{ value: 'abandonado', label: 'Abandonado' }
	];

	readonly profileTabs: ProfileTab[] = ['Profile', 'Books', 'Reviews', 'Likes'];
	metrics: ProfileMetric[] = [
		{ value: '0', label: 'Reviews' },
		{ value: '0', label: 'Books' },
		{ value: '0', label: 'Likes' }
	];
	favoriteBooks: ProfileBook[] = [
		{
			id: 0,
			title: 'Sin libros todavía',
			author: 'Usa el buscador para añadir un libro',
			description: '',
			coverUrl: '/prueba.webp',
			state: 'favorito',
			stateLabel: 'Favorito',
			commentCount: 0,
			comments: []
		}
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
		this.clearMessages();
		this.isEditing = false;
		this.bookSearchOpen = false;
		this.bookSearchQuery = '';
		this.bookSearchResults = [];
		this.selectedBooks = [];
		this.likedComments = [];
		this.bookSearchStates = {};
		this.activeActionMenu = null;
		this.actionMenuVisible = null;
		this.previewedBook = null;
		this.previewDrawerVisible = false;
		this.previewMode = 'view';
		this.previewBookState = 'favorito';
		this.hiddenProfileBookIds = [];
		if (this.previewCloseTimer) {
			clearTimeout(this.previewCloseTimer);
			this.previewCloseTimer = null;
		}
		if (this.actionMenuCloseTimer) {
			clearTimeout(this.actionMenuCloseTimer);
			this.actionMenuCloseTimer = null;
		}
		this.profileComments = [];
		this.allComments = [];
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
					return of({ user: null, comments: [] as Comentario[], books: [] as Book[], allComments: [] as Comentario[] });
				}

				this.viewedUserId = user.id;
				this.profileIsEditable = this.canEditProfile();
				this.selectedBooks = this.profileIsEditable ? this.loadSelectedBooks(user.id) : [];
				this.hiddenProfileBookIds = this.profileIsEditable ? this.loadHiddenBookIds(user.id) : [];
				const embeddedReviews = this.getEmbeddedUserReviews(user);

				if (embeddedReviews.length > 0) {
					return this.bookService.getBooks(forceRefreshComments).pipe(
						catchError(() => of([] as Book[])),
						map((books) => this.buildProfileReviewState(user, embeddedReviews, books))
					);
				}

				return this.comentarioService.getComentarios(forceRefreshComments).pipe(
					catchError(() => of([] as Comentario[])),
					map((comments) => ({
						allComments: comments,
						comments: comments.filter((comment) => this.isCommentFromCurrentUser(comment, user))
					})),
					switchMap(({ allComments, comments }) =>
						this.loadBooksForComments(user, comments).pipe(
							map((result) => ({
								...result,
								allComments
							}))
						)
					)
				);
			}),
			catchError(() => of({ user: null, comments: [] as Comentario[], books: [] as Book[], allComments: [] as Comentario[] }))
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
				this.allComments = result.allComments;
				this.profileBooks = result.books;
				this.metrics = this.buildMetrics(this.profileComments);
				this.favoriteBooks = this.buildFavoriteBooks(this.profileComments, this.profileBooks, this.selectedBooks, this.hiddenProfileBookIds);
				this.activity = this.buildActivityFeed(this.profileComments, this.profileBooks);
				this.bookSearchOpen = this.canEditProfile() && this.favoriteBooks.length === 1 && this.selectedBooks.length === 0;
								this.bookSearchOpen = this.profileIsEditable && this.favoriteBooks.length === 1 && this.selectedBooks.length === 0;
								this.profileIsEditable = this.canEditProfile();
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

	private getEmbeddedUserReviews(user: Usuario): EmbeddedUserReview[] {
		const rawReviews = (user as any).reviews;

		if (!Array.isArray(rawReviews)) {
			return [];
		}

		return rawReviews.filter((review): review is EmbeddedUserReview => Boolean(review && (review.libro || review.comentario || review.comment)));
	}

	private buildProfileReviewState(user: Usuario, reviews: EmbeddedUserReview[], books: Book[]): { user: Usuario; comments: Comentario[]; books: Book[]; allComments: Comentario[] } {
		const groupedBooks = new Map<string, Book & { reviews: NonNullable<Book['reviews']> }>();
		const comments: Comentario[] = [];
		let syntheticBookId = -1;

		for (const review of reviews) {
			const title = String(review.libro ?? review.libroData?.titulo ?? '').trim();
			if (!title) {
				continue;
			}

			const titleKey = title.toLowerCase();
			const matchedBook = books.find((book) => String(book.titulo ?? '').trim().toLowerCase() === titleKey) ?? null;
			let bookEntry = groupedBooks.get(titleKey);

			if (!bookEntry) {
				const bookId = matchedBook?.id ?? syntheticBookId--;
				bookEntry = {
					id: bookId,
					titulo: matchedBook?.titulo ?? title,
					autor: matchedBook?.autor ?? 'Autor no disponible',
					descripcion: matchedBook?.descripcion ?? String(review.comentario ?? review.comment ?? ''),
					portada: this.normalizeCoverPath(review.portada ?? matchedBook?.portada),
					reviews: []
				};
				groupedBooks.set(titleKey, bookEntry);
			}

			const bookId = bookEntry.id;
			const content = String(review.comentario ?? review.comment ?? '').trim();
			const rating = Number(review.rating ?? 0);

			bookEntry.reviews.push({
				id: Number(review.id ?? bookId),
				user: String(user.nombre ?? 'Usuario desconocido'),
				rating: Number.isFinite(rating) ? rating : null,
				comment: content || null
			});

			comments.push({
				id: Number(review.id ?? bookId),
				UsuarioId: user.id,
				BookId: bookId,
				contenido: content,
				comentario: content,
				likes: Number(review.likes ?? 0) || 0,
				user: String(user.nombre ?? 'Usuario desconocido'),
				libro: title,
				portada: this.normalizeCoverPath(review.portada ?? matchedBook?.portada),
				rating: Number.isFinite(rating) ? rating : null,
				comment: content || null
			});
		}

		return {
			user,
			comments,
			books: Array.from(groupedBooks.values()),
			allComments: comments
		};
	}

	private loadSelectedBooks(userId: number): ProfileBookEntry[] {
		try {
			const raw = localStorage.getItem(this.profileBooksStorageKey(userId));
			if (!raw) {
				return [];
			}

			const parsed = JSON.parse(raw) as Array<Partial<ProfileBookEntry>>;
			if (!Array.isArray(parsed)) {
				return [];
			}

			return parsed
				.map((entry) => this.normalizeStoredBookEntry(entry))
				.filter((entry): entry is ProfileBookEntry => entry !== null);
		} catch {
			return [];
		}
	}

	private persistSelectedBooks(userId: number, books: ProfileBookEntry[]): void {
		localStorage.setItem(this.profileBooksStorageKey(userId), JSON.stringify(books));
	}

	private loadHiddenBookIds(userId: number): number[] {
		try {
			const raw = localStorage.getItem(this.hiddenBooksStorageKey(userId));
			if (!raw) {
				return [];
			}

			const parsed = JSON.parse(raw) as unknown[];
			if (!Array.isArray(parsed)) {
				return [];
			}

			return parsed
				.map((value) => Number(value))
				.filter((value) => Number.isFinite(value));
		} catch {
			return [];
		}
	}

	private persistHiddenBookIds(userId: number, bookIds: number[]): void {
		localStorage.setItem(this.hiddenBooksStorageKey(userId), JSON.stringify(Array.from(new Set(bookIds))));
	}

	private hiddenBooksStorageKey(userId: number): string {
		return `profileHiddenBooks:${userId}`;
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

	private buildFavoriteBooks(profileComments: Comentario[], books: Book[], profileBooks: ProfileBookEntry[], hiddenBookIds: number[]): ProfileBook[] {
		const hiddenSet = new Set(hiddenBookIds.map((value) => Number(value)).filter((value) => Number.isFinite(value)));
		const sourceBooks = new Map<number, ProfileBookEntry>();

		for (const book of books) {
			if (hiddenSet.has(book.id)) {
				continue;
			}

			sourceBooks.set(book.id, {
				...book,
				state: 'favorito'
			});
		}

		for (const book of profileBooks) {
			if (hiddenSet.has(book.id)) {
				continue;
			}

			sourceBooks.set(book.id, book);
		}

		if (profileComments.length === 0 && sourceBooks.size === 0) {
			return [
				{
					id: 0,
					title: 'Sin libros todavía',
					author: 'Usa el buscador para añadir un libro',
					description: '',
					coverUrl: '/prueba.webp',
					state: 'favorito',
					stateLabel: this.getBookStateLabel('favorito'),
					commentCount: 0,
					comments: []
				}
			];
		}

		const commentsByBook = new Map<number, Comentario[]>();

		for (const comment of profileComments) {
			const raw = comment as any;
			const rawBookId = raw.BookId ?? raw.libro_id;

			if (rawBookId == null) {
				continue;
			}

			const normalizedBookId = Number(rawBookId);
			if (!Number.isFinite(normalizedBookId)) {
				continue;
			}

			if (hiddenSet.has(normalizedBookId)) {
				continue;
			}

			const current = commentsByBook.get(normalizedBookId) ?? [];
			current.push(comment);
			commentsByBook.set(normalizedBookId, current);
		}

		return Array.from(sourceBooks.values()).map((book) => {
			const bookComments = commentsByBook.get(book.id) ?? [];
			const ratedComments = bookComments
				.map((comment) => this.resolveCommentRating(comment))
				.filter((value) => value > 0);
			const averageRating = ratedComments.length > 0
				? Number((ratedComments.reduce((sum, value) => sum + value, 0) / ratedComments.length).toFixed(1))
				: null;
			const sortedComments = [...bookComments]
				.sort((left, right) => Number(right.id) - Number(left.id))
				.map((comment) => {
					const raw = comment as any;
					return {
						id: comment.id,
						author: String(raw.user ?? raw.usuario?.nombre ?? raw.usuarioNombre ?? raw.username ?? 'Usuario desconocido'),
						content: String(raw.contenido ?? raw.comentario ?? raw.comment ?? ''),
						rating: this.resolveCommentRating(comment) > 0 ? this.resolveCommentRating(comment) : null,
						likes: this.resolveCommentLikes(comment)
					};
				});

			return {
				id: book.id,
				title: book.titulo,
				author: book.autor,
				description: String(book.descripcion ?? ''),
				coverUrl: this.normalizeCoverPath(book.portada),
				state: book.state,
				stateLabel: this.getBookStateLabel(book.state),
				commentCount: bookComments.length,
				averageRating: averageRating != null ? `${averageRating.toFixed(1)} / 5` : undefined,
				comments: sortedComments
			};
		});
	}

	openBookFinder(): void {
		if (!this.requireEditPermission('añadir libros')) {
			return;
		}

		this.bookSearchOpen = true;
		this.activeTab = 'Books';
		this.clearMessages();
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
			this.setMessage('error', 'Escribe al menos un título o autor para buscar.');
			this.bookSearchResults = [];
			return;
		}

		this.withLoadingFlag('isSearchingBooks', () =>
			this.bookService.searchBook(query).pipe(
				catchError(() => of([] as Book[]))
			),
			(results) => {
				this.bookSearchResults = results;
				for (const book of results) {
					if (this.bookSearchStates[book.id] == null) {
						this.bookSearchStates[book.id] = 'favorito';
					}
				}
			},
			() => {
				this.setMessage('error', 'No se pudieron buscar libros.', false);
				this.bookSearchResults = [];
			}
		);
	}

	addBookToProfile(book: Book, state: BookState = this.bookSearchStates[book.id] ?? 'favorito'): void {
		if (!this.requireEditPermission('añadir libros')) {
			return;
		}

		const normalizedState = this.normalizeBookState(state);
		const nextEntry: ProfileBookEntry = {
			...book,
			state: normalizedState
		};
		const existingIndex = this.selectedBooks.findIndex((item) => item.id === book.id);

		this.isSavingBook = true;
		this.clearMessages();

		if (existingIndex >= 0) {
			this.selectedBooks = this.updateInArray(this.selectedBooks, book.id, () => nextEntry);
			this.successMessage = 'Estado del libro actualizado.';
		} else {
			this.selectedBooks = [nextEntry, ...this.selectedBooks];
			this.successMessage = 'Libro añadido a tu perfil.';
		}

		if (this.currentUserId) this.persistSelectedBooks(this.currentUserId, this.selectedBooks);
		this.hiddenProfileBookIds = this.removeNumberFromArray(this.hiddenProfileBookIds, book.id);
		if (this.currentUserId) this.persistHiddenBookIds(this.currentUserId, this.hiddenProfileBookIds);
		this.favoriteBooks = this.buildFavoriteBooks(this.profileComments, this.profileBooks, this.selectedBooks, this.hiddenProfileBookIds);
		if (this.previewedBook?.id === book.id) {
			this.previewedBook = null;
		}
		this.activeActionMenu = null;
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

	private resolveCommentRating(comment: Comentario): number {
		const raw = (comment as any).rating ?? (comment as any).valoracion;
		const rating = Number(raw);
		return Number.isFinite(rating) ? rating : 0;
	}

	private normalizeBookState(state: unknown): BookState {
		const normalized = String(state ?? '').trim().toLowerCase();
		if (normalized === 'leido' || normalized === 'leyendo' || normalized === 'abandonado' || normalized === 'favorito') {
			return normalized;
		}

		return 'favorito';
	}

	private getBookStateLabel(state: BookState): string {
		switch (state) {
			case 'leido':
				return 'Leído';
			case 'leyendo':
				return 'Leyendo';
			case 'abandonado':
				return 'Abandonado';
			default:
				return 'Favorito';
		}
	}

	private normalizeStoredBookEntry(entry: Partial<ProfileBookEntry>): ProfileBookEntry | null {
		if (entry.id == null || entry.titulo == null || entry.autor == null) {
			return null;
		}

		return {
			id: Number(entry.id),
			titulo: String(entry.titulo),
			autor: String(entry.autor),
			descripcion: String(entry.descripcion ?? ''),
			portada: String(entry.portada ?? ''),
			genero: entry.genero,
			reviews: entry.reviews,
			state: this.normalizeBookState(entry.state)
		};
	}

	private loadLikedComments(forceRefreshComments = false): void {
		if (!this.canEditProfile() || this.currentUserId == null) {
			this.likedComments = [];
			this.cdr.detectChanges();
			return;
		}

		this.withLoadingFlag('likedComments' as any, () => this.comentarioService.getComentarios(forceRefreshComments),
			(comments: any[]) => {
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
			},
			() => {
				this.likedComments = [];
			}
		);
	}

	startEditing(): void {
		if (!this.requireEditPermission('editar el perfil')) {
			return;
		}

		this.editDraft = {
			nombre: String(this.user.nombre ?? ''),
			email: String(this.user.email ?? ''),
			descripcion: String(this.user.descripcion ?? '')
		};
		this.clearMessages();
		this.isEditing = true;
		this.cdr.detectChanges();
	}

	cancelEditing(): void {
		this.isEditing = false;
		this.clearMessages();
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
			this.setMessage('error', 'No se pudo actualizar el perfil porque no tienes permiso para editarlo.');
			return;
		}

		this.isSaving = true;
		this.clearMessages();

		this.usuarioService.updateUsuario(userId, { nombre, email, descripcion }).subscribe({
			next: (updatedUser) => {
				this.user = updatedUser;
				this.currentUserId = updatedUser.id;
					this.profileIsEditable = this.canEditProfile();
				this.viewedUserId = updatedUser.id;
				localStorage.setItem('username', updatedUser.nombre);
				this.isEditing = false;
				this.setMessage('success', 'Perfil actualizado correctamente.', false);
				this.isSaving = false;
				this.cdr.detectChanges();
			},
			error: () => {
				this.setMessage('error', 'No se pudo actualizar el perfil.', false);
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

	trackByBookCommentId(index: number, comment: ProfileBookComment): number {
		return comment.id;
	}

	trackByMetricLabel(index: number, metric: ProfileMetric): string {
		return metric.label;
	}

	trackByTab(index: number, tab: ProfileTab): ProfileTab {
		return tab;
	}

	trackByBookId(index: number, book: ProfileBook): number {
		return book.id;
	}

	trackByBookSearchResultId(index: number, book: Book): number {
		return book.id;
	}

	trackByActivityItem(index: number, item: ProfileActivity): string {
		return `${item.title}-${item.time}`;
	}

	trackByLikedCommentId(index: number, comment: LikedCommentView): number {
		return comment.id;
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

	private runDelayedClose(
		currentTimer: ReturnType<typeof setTimeout> | null,
		onClose: () => void,
		delay: number
	): ReturnType<typeof setTimeout> {
		if (currentTimer) {
			clearTimeout(currentTimer);
		}

		return setTimeout(() => {
			onClose();
			this.cdr.detectChanges();
		}, delay);
	}

	toggleActionMenu(kind: 'book' | 'comment', id: number): void {
		const isOpen = this.activeActionMenu?.kind === kind && this.activeActionMenu?.id === id;

		if (isOpen) {
			this.actionMenuVisible = { kind, id };
			this.actionMenuCloseTimer = this.runDelayedClose(this.actionMenuCloseTimer, () => {
				this.activeActionMenu = null;
				this.actionMenuVisible = null;
				this.actionMenuCloseTimer = null;
			}, 140);
			this.cdr.detectChanges();
			return;
		}

		if (this.actionMenuCloseTimer) {
			clearTimeout(this.actionMenuCloseTimer);
			this.actionMenuCloseTimer = null;
		}

		this.activeActionMenu = { kind, id };
		this.actionMenuVisible = { kind, id };
		this.cdr.detectChanges();
	}

	isActionMenuOpen(kind: 'book' | 'comment', id: number): boolean {
		return this.activeActionMenu?.kind === kind && this.activeActionMenu?.id === id;
	}

	closeActionMenus(): void {
		const currentMenu = this.activeActionMenu;
		if (!currentMenu) {
			this.actionMenuVisible = null;
			return;
		}

		this.actionMenuVisible = { ...currentMenu };
		this.actionMenuCloseTimer = this.runDelayedClose(this.actionMenuCloseTimer, () => {
			this.activeActionMenu = null;
			this.actionMenuVisible = null;
			this.actionMenuCloseTimer = null;
		}, 140);
	}

	openBookPreview(book: ProfileBook, mode: 'view' | 'edit' = 'view'): void {
		if (this.previewCloseTimer) {
			clearTimeout(this.previewCloseTimer);
			this.previewCloseTimer = null;
		}

		this.previewedBook = book;
		this.previewMode = mode;
		this.previewBookState = book.state;
		this.previewDrawerVisible = true;
		this.closeActionMenus();
		this.cdr.detectChanges();
	}

	openBookPreviewFromComment(book: ProfileBook): void {
		this.openBookPreview(book, 'view');
	}

	closeBookPreview(): void {
		this.previewMode = 'view';
		this.previewBookState = 'favorito';
		this.previewDrawerVisible = false;
		this.previewCloseTimer = this.runDelayedClose(this.previewCloseTimer, () => {
			this.previewedBook = null;
			this.previewCloseTimer = null;
		}, 240);
	}

	applyPreviewBookState(): void {
		if (!this.previewedBook || !this.currentUserId) {
			return;
		}

		const normalizedState = this.normalizeBookState(this.previewBookState);
		this.selectedBooks = this.updateInArray(this.selectedBooks, this.previewedBook.id, (book) => ({
			...book,
			state: normalizedState
		}));
		if (this.currentUserId) this.persistSelectedBooks(this.currentUserId, this.selectedBooks);
		this.favoriteBooks = this.buildFavoriteBooks(this.profileComments, this.profileBooks, this.selectedBooks, this.hiddenProfileBookIds);
		this.previewedBook = this.favoriteBooks.find((book) => book.id === this.previewedBook?.id) ?? null;
		if (this.previewedBook) {
			this.previewBookState = this.previewedBook.state;
		}
		this.successMessage = 'Estado del libro actualizado.';
		this.closeActionMenus();
		this.cdr.detectChanges();
	}

	openCommentDetail(commentId: number): void {
		this.closeActionMenus();
		this.router.navigate(['/comentarios', commentId]);
	}

	getBookById(bookId: number): ProfileBook | null {
		return this.favoriteBooks.find((book) => book.id === bookId) ?? null;
	}

	deleteBook(bookId: number): void {
		if (!this.requireEditPermission('eliminar libros')) {
			return;
		}

		if (!confirm('¿Estás seguro de que quieres eliminar este libro de tu perfil?')) {
			return;
		}

		this.clearMessages();

		// Remove the book from selectedBooks
		this.selectedBooks = this.removeFromArray(this.selectedBooks, bookId);
		this.hiddenProfileBookIds = [...new Set([...this.hiddenProfileBookIds, bookId])];
		
		// Persist the changes
		if (this.currentUserId) {
			this.persistSelectedBooks(this.currentUserId, this.selectedBooks);
			this.persistHiddenBookIds(this.currentUserId, this.hiddenProfileBookIds);
		}
		
		// Rebuild the favorite books list
		this.favoriteBooks = this.buildFavoriteBooks(this.profileComments, this.profileBooks, this.selectedBooks, this.hiddenProfileBookIds);
		if (this.previewedBook?.id === bookId) {
			this.closeBookPreview();
		}
		this.closeActionMenus();
		
		this.successMessage = 'Libro eliminado de tu perfil.';
		this.cdr.detectChanges();
	}

	deleteComment(commentId: number): void {
		if (!this.requireEditPermission('eliminar comentarios')) {
			return;
		}

		if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
			return;
		}

		this.clearMessages();

		this.withLoadingFlag('isSaving' as any, () => this.comentarioService.deleteComentario(commentId),
			() => {
				// Remove the comment from allComments
				this.allComments = this.removeFromArray(this.allComments, commentId);
				this.profileComments = this.removeFromArray(this.profileComments, commentId);

				// Rebuild the favorite books list
				this.favoriteBooks = this.buildFavoriteBooks(this.profileComments, this.profileBooks, this.selectedBooks, this.hiddenProfileBookIds);
				this.closeActionMenus();

				this.setMessage('success', 'Comentario eliminado correctamente.', false);
			},
			() => {
				this.setMessage('error', 'No se pudo eliminar el comentario. Intenta de nuevo.', false);
			}
		);
	}
}