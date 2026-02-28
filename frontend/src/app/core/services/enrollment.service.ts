import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Enrollment } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
    private api = `${environment.apiUrl}/enrollments`;

    constructor(private http: HttpClient) { }

    enroll(courseId: number): Observable<Enrollment> {
        return this.http.post<Enrollment>(this.api, { course_id: courseId });
    }

    getMyEnrollments(): Observable<Enrollment[]> {
        return this.http.get<Enrollment[]>(`${this.api}/my`);
    }

    getCourseEnrollments(courseId: number): Observable<Enrollment[]> {
        return this.http.get<Enrollment[]>(`${this.api}/course/${courseId}`);
    }

    updateProgress(courseId: number, progress: number): Observable<Enrollment> {
        return this.http.patch<Enrollment>(`${this.api}/progress`, { course_id: courseId, progress });
    }
}
