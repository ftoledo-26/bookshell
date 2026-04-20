import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Book } from "../models/Book";
import { environment } from "../environments/environments";

interface ApiResponse<T> {
    data: T;
}

@Injectable({
    providedIn: 'root'
})

export class BookService {
    private apiUrl = environment.API_URL+'libros';

    constructor(private http: HttpClient) {}

    getBooks(): Observable<Book[]> {
        return this.http
            .get<ApiResponse<Book[]>>(this.apiUrl)
            .pipe(map((response) => response.data ?? []));
    }

    getBook(id: number): Observable<Book> {
        return this.http
            .get<ApiResponse<Book>>(`${this.apiUrl}/${id}`)
            .pipe(map((response) => response.data));
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