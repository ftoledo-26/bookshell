import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { shareReplay } from "rxjs/operators";
import { Book } from "../models/Book";
import { environment } from "../environments/environments";

shareReplay({ bufferSize: 1, refCount: true });


interface ApiResponse<T> {
    data: T;
}

@Injectable({
    providedIn: 'root'
})

export class BookService {
    private apiUrl = environment.API_URL+'libros';
    private books$?: Observable<Book[]>;
    private readonly bookByIdCache = new Map<number, Observable<Book>>();

    constructor(private http: HttpClient) {}

    private normalizeCoverPath(portada?: string): string {
        const raw = String(portada ?? '').trim();
        if (!raw) {
            return '/prueba.webp';
        }

        const lowered = raw.toLowerCase();

        // Keep a single canonical default image path present in /public.
        if (lowered === 'default.png' || lowered === 'default.jpg' || lowered === '/default.jpg' || lowered === '/default.png') {
            return '/default.png';
        }

        if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) {
            return raw;
        }

        return `/${raw}`;
    }

    private normalizeBook(book: Book): Book {
        return {
            ...book,
            portada: this.normalizeCoverPath(book.portada)
        };
    }

    getBooks(forceRefresh = false): Observable<Book[]> {
        if (!this.books$ || forceRefresh) {
            this.books$ = this.http
                .get<ApiResponse<Book[]>>(this.apiUrl)
                .pipe(
                    map((response) => (response.data ?? []).map((book) => this.normalizeBook(book))),
                    shareReplay(1)
                );
        }

        return this.books$;
    }

    getBook(id: number, forceRefresh = false): Observable<Book> {
        if (!forceRefresh) {
            const cached = this.bookByIdCache.get(id);
            if (cached) {
                return cached;
            }
        }

        const request$ = this.http
            .get<ApiResponse<Book>>(`${this.apiUrl}/${id}`)
            .pipe(
                map((response) => this.normalizeBook(response.data)),
                shareReplay(1)
            );

        this.bookByIdCache.set(id, request$);
        return request$;
    }

    createBook(book: Book): Observable<Book> {
        return this.http
            .post<ApiResponse<Book>>(this.apiUrl, book)
            .pipe(map((response) => response.data));
    }

    searchBook(query: string): Observable<Book[]>{
        return this.http
            .get<ApiResponse<Book[]>>(`${this.apiUrl}/search?query=${query}`)
            .pipe(map((response) => response.data ?? []));
    }
    

}