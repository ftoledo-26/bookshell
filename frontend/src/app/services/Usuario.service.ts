import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Usuario } from '../models/Usuario';
import { environment } from '../environments/environments';

interface ApiResponse<T> {
  data: T;
}

type RawUsuario = Partial<Usuario> & { name?: string };

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrlGet = environment.API_URL + 'usuarios';
  private apiUrlUpdate = environment.API_URL + 'users';
  private apiUrlCreate = environment.API_URL + 'register';
  private users$?: Observable<Usuario[]>;
  private readonly userByIdCache = new Map<number, Observable<Usuario>>();

  constructor(private http: HttpClient) {}

  private normalizeUsuario(input: RawUsuario | null | undefined): Usuario {
    const raw = input ?? {};

    return {
      id: Number(raw.id ?? 0),
      nombre: String(raw.nombre ?? raw.name ?? ''),
      email: String(raw.email ?? ''),
      password: String(raw.password ?? ''),
      rol: String(raw.rol ?? 'usuario'),
      foto: String(raw.foto ?? ''),
      phone: String(raw.phone ?? '')
    };
  }

  getUsuarios(forceRefresh = false): Observable<Usuario[]> {
    if (!this.users$ || forceRefresh) {
      this.users$ = this.http
        .get<ApiResponse<RawUsuario[]> | RawUsuario[]>(this.apiUrlGet)
        .pipe(
          map((response: any) => {
            const rawUsers: RawUsuario[] = response?.data ?? response ?? [];
            return Array.isArray(rawUsers) ? rawUsers.map((item) => this.normalizeUsuario(item)) : [];
          }),
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
      .get<ApiResponse<RawUsuario> | RawUsuario>(`${this.apiUrlGet}/${id}`)
      .pipe(
        map((response: any) => this.normalizeUsuario(response?.data ?? response)),
        shareReplay(1)
      );

    this.userByIdCache.set(id, request$);
    return request$;
  }

  updateUsuario(id: number, payload: Partial<Pick<Usuario, 'nombre' | 'email' | 'password' | 'foto' | 'rol'>>): Observable<Usuario> {
    const apiPayload: Record<string, unknown> = {};

    if (payload.nombre != null) {
      apiPayload['name'] = payload.nombre;
    }

    if (payload.email != null) {
      apiPayload['email'] = payload.email;
    }

    if (payload.password != null) {
      apiPayload['password'] = payload.password;
    }

    if (payload.foto != null) {
      apiPayload['foto'] = payload.foto;
    }

    if (payload.rol != null) {
      apiPayload['rol'] = payload.rol;
    }

    return this.http
      .put<ApiResponse<RawUsuario> | { data?: RawUsuario }>(`${this.apiUrlUpdate}/${id}`, apiPayload)
      .pipe(
        map((response: any) => this.normalizeUsuario(response?.data ?? response)),
        map((response) => {
          this.userByIdCache.delete(id);
          this.users$ = undefined;
          return response;
        })
      );
  }

  createUsuario(payload: Pick<Usuario, 'nombre' | 'email' | 'password' | 'phone'>): Observable<Usuario> {
    const apiPayload = {
      name: payload.nombre,
      email: payload.email,
      password: payload.password,
      phone: payload.phone
    };

    return this.http
      .post<ApiResponse<RawUsuario> | { data?: RawUsuario }>(this.apiUrlCreate, apiPayload)
      .pipe(
        map((response: any) => this.normalizeUsuario(response?.data ?? response)),
        map((response) => {
          this.users$ = undefined;
          return response;
        })
      );
  }
}
