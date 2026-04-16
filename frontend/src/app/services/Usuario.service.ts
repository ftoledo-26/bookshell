import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Usuario } from '../models/Usuario';
import { environment } from '../environments/environments';

interface ApiResponse<T> {
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = environment.API_URL + 'usuarios';
  private users$?: Observable<Usuario[]>;
  private readonly userByIdCache = new Map<number, Observable<Usuario>>();

  constructor(private http: HttpClient) {}

  getUsuarios(forceRefresh = false): Observable<Usuario[]> {
    if (!this.users$ || forceRefresh) {
      this.users$ = this.http
        .get<ApiResponse<Usuario[]>>(this.apiUrl)
        .pipe(
          map((response) => response.data ?? []),
          shareReplay(1)
        );
    }

    return this.users$;
  }

  getUsuario(id: number, forceRefresh = false): Observable<Usuario> {
    if (!forceRefresh) {
      const cached = this.userByIdCache.get(id);
      if (cached) {
        return cached;
      }
    }

    const request$ = this.http
      .get<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response: any) => response?.data ?? response),
        shareReplay(1)
      );

    this.userByIdCache.set(id, request$);
    return request$;
  }

  updateUsuario(id: number, payload: Partial<Pick<Usuario, 'nombre' | 'email' | 'password' | 'foto' | 'rol'>>): Observable<Usuario> {
    return this.http
      .put<ApiResponse<Usuario> | { data?: Usuario }>(`${this.apiUrl}/${id}`, payload)
      .pipe(
        map((response: any) => response?.data ?? response),
        map((response) => {
          this.userByIdCache.delete(id);
          this.users$ = undefined;
          return response;
        })
      );
  }
}
