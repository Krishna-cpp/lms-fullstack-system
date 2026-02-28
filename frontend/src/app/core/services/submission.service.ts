import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Submission } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class SubmissionService {
    private api = `${environment.apiUrl}/submissions`;

    constructor(private http: HttpClient) { }

    submit(assignmentId: number, file: File): Observable<Submission> {
        const formData = new FormData();
        formData.append('assignment_id', String(assignmentId));
        formData.append('file', file);
        return this.http.post<Submission>(this.api, formData);
    }

    getByAssignment(assignmentId: number): Observable<Submission[]> {
        return this.http.get<Submission[]>(`${this.api}/assignment/${assignmentId}`);
    }
}
