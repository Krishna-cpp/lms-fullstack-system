import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Lesson } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class LessonService {
    private api = `${environment.apiUrl}/lessons`;

    constructor(private http: HttpClient) { }

    getByCourse(courseId: number): Observable<Lesson[]> {
        return this.http.get<Lesson[]>(`${this.api}/course/${courseId}`);
    }

    create(data: Partial<Lesson>): Observable<Lesson> {
        return this.http.post<Lesson>(this.api, data);
    }

    update(id: number, data: Partial<Lesson>): Observable<Lesson> {
        return this.http.put<Lesson>(`${this.api}/${id}`, data);
    }

    delete(id: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.api}/${id}`);
    }
}
