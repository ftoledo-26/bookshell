import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Usuario } from "../models/Usuario";
import { environment } from "../environments/environments";

interface ApiResponse<T> {
    data: T;
}

@Injectable({
    providedIn: 'root'
})

export class UsuarioService {
    private apiUrl = environment.API_URL+'login';

    constructor(private http: HttpClient) {}

    login(email: string, password: string): Observable<Usuario> {
        const usuario = { email, password };
        return this.http
            .post<ApiResponse<Usuario>>(this.apiUrl, usuario)
            .pipe(map((response) => response.data));
    }

    

    
    

}
