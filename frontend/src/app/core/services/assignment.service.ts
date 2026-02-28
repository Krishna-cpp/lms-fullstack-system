import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Assignment } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
    private api = `${environment.apiUrl}/assignments`;

    constructor(private http: HttpClient) { }

    getByLesson(lessonId: number): Observable<Assignment[]> {
        return this.http.get<Assignment[]>(`${this.api}/lesson/${lessonId}`);
    }

    create(data: Partial<Assignment>): Observable<Assignment> {
        return this.http.post<Assignment>(this.api, data);
    }
}
