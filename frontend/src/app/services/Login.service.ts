import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {environment} from "../environments/environments";
import {tap} from "rxjs/operators";

@Injectable({providedIn: 'root'})
export class LoginService {
    private apiUrl = environment.API_URL+'/login';

    constructor(private http: HttpClient, private router: Router) {}

    login(email: string, password: string) {
        return this.http.post<{ token: string}>(this.apiUrl, { email, password }).pipe(
            tap(response => {
                localStorage.setItem('token', response.token);
                this.router.navigate(['/']);
            }
        ));
    }

    logout() {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    register(email: string, password: string, name: string, numero_tel: string, ) {
        
    }
}