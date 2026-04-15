import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.http
      .get<ApiResponse<Usuario[]>>(this.apiUrl)
      .pipe(map((response) => response.data ?? []));
  }
}
