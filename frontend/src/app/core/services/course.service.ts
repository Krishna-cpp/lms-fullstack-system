import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Course } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class CourseService {
    private api = `${environment.apiUrl}/courses`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Course[]> {
        return this.http.get<Course[]>(this.api);
    }

    getById(id: number): Observable<Course> {
        return this.http.get<Course>(`${this.api}/${id}`);
    }

    create(data: Partial<Course>): Observable<Course> {
        return this.http.post<Course>(this.api, data);
    }

    update(id: number, data: Partial<Course>): Observable<Course> {
        return this.http.put<Course>(`${this.api}/${id}`, data);
    }

    delete(id: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.api}/${id}`);
    }
}
