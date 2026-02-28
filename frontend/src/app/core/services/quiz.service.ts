import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Quiz } from '../../shared/models';

export interface QuizSubmission {
    quiz_id: number;
    answers: { question_id: number; selected_option: string }[];
}

export interface QuizResult {
    score: number;
    total: number;
    percentage: number;
    correct: number[];
    wrong: number[];
}

@Injectable({ providedIn: 'root' })
export class QuizService {
    private api = `${environment.apiUrl}/quizzes`;

    constructor(private http: HttpClient) { }

    getByLesson(lessonId: number): Observable<Quiz[]> {
        return this.http.get<Quiz[]>(`${this.api}/lesson/${lessonId}`);
    }

    create(data: { lesson_id: number; title: string; questions: any[] }): Observable<Quiz> {
        return this.http.post<Quiz>(this.api, data);
    }

    submit(submission: QuizSubmission): Observable<QuizResult> {
        return this.http.post<QuizResult>(`${this.api}/submit`, submission);
    }
}
