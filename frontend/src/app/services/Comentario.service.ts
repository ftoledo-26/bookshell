import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  constructor(private http: HttpClient) {}

  getComentarios(): Observable<Comentario[]> {
    return this.http
      .get<ApiResponse<Comentario[]>>(this.apiUrl)
      .pipe(map((response) => response.data ?? []));
  }

  getComentario(id: number): Observable<Comentario> {
    return this.http
      .get<ApiResponse<Comentario>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  createComentario(comentario: Comentario): Observable<Comentario> {
    return this.http
      .post<ApiResponse<Comentario>>(this.apiUrl, comentario)
      .pipe(map((response) => response.data));
  }
}