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

    getBooks(forceRefresh = false): Observable<Book[]> {
        if (!this.books$ || forceRefresh) {
            this.books$ = this.http
                .get<ApiResponse<Book[]>>(this.apiUrl)
                .pipe(
                    map((response) => response.data ?? []),
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
                map((response) => response.data),
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