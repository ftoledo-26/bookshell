import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {environment} from "../environments/environments";
import {tap} from "rxjs/operators";

type LoginResponse = {
    access_token?: string,
    token?: string,
    user: { id: number, name?: string, username?: string, foto?: string }
};

@Injectable({providedIn: 'root'})
export class LoginService {
    private apiUrl = environment.API_URL+'login';

    constructor(private http: HttpClient, private router: Router) {}

    login(email: string, password: string) {
        return this.http.post<LoginResponse>(this.apiUrl, { email, password }).pipe(
            tap((response: LoginResponse) => {
                const token = response.access_token ?? response.token;
                const username = response.user.name ?? response.user.username;
                const userId = response.user.id;

                if (token) {
                    localStorage.setItem('token', token);
                }

                if (Number.isFinite(userId)) {
                    localStorage.setItem('userId', String(userId));
                }

                if (username) {
                    localStorage.setItem('username', username);
                }

                if (response.user.foto) {
                    localStorage.setItem('foto', response.user.foto);
                }
            }
        ));
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('foto');
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getUserId(): number | null {
        const rawUserId = localStorage.getItem('userId');

        if (!rawUserId) {
            return null;
        }

        const userId = Number(rawUserId);
        return Number.isFinite(userId) ? userId : null;
    }

    getUsername(): string | null {
        return localStorage.getItem('username');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
}