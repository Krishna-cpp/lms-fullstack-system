import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Certificate } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class CertificateService {
    private api = `${environment.apiUrl}/certificates`;

    constructor(private http: HttpClient) { }

    getMyCertificates(): Observable<Certificate[]> {
        return this.http.get<Certificate[]>(`${this.api}/my`);
    }

    issue(courseId: number, score?: number): Observable<Certificate> {
        return this.http.post<Certificate>(this.api, { course_id: courseId, score });
    }
}
