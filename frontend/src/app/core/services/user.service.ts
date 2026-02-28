import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class UserService {
    private api = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<User[]> {
        return this.http.get<User[]>(this.api);
    }

    getById(id: number): Observable<User> {
        return this.http.get<User>(`${this.api}/${id}`);
    }

    update(id: number, data: { name?: string; avatar_url?: string | null }): Observable<User> {
        return this.http.put<User>(`${this.api}/${id}`, data);
    }
}
