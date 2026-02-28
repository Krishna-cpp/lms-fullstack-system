import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../core/services/quiz.service';
import { Quiz, QuizQuestion } from '../../shared/models';

@Component({
    selector: 'app-quiz-attempt',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <nav class="navbar">
      <span class="navbar-brand">Acad<span style="color:var(--color-accent)">emia</span></span>
      <ul class="navbar-links">
        <li><a routerLink="/dashboard">Dashboard</a></li>
      </ul>
    </nav>

    <div class="quiz-container page-enter">
      <div class="spinner" *ngIf="loading"></div>

      <div *ngIf="!loading && quizzes.length === 0" class="empty-quiz">
        <h2>No Quizzes Available</h2>
        <p>There are no quizzes for this lesson yet.</p>
        <a routerLink="/dashboard" class="btn btn-outline">Back to Dashboard</a>
      </div>

      <div *ngIf="!loading && currentQuiz && !finished" class="quiz-card">
        <!-- Progress Bar -->
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" [style.width.%]="progressPercent"></div>
        </div>
        <div class="quiz-meta">
          <span class="quiz-title">{{ currentQuiz.title }}</span>
          <span class="quiz-counter">{{ currentIndex + 1 }} / {{ currentQuiz.questions?.length ?? 0 }}</span>
        </div>

        <!-- Question -->
        <div class="question-block" *ngIf="currentQuestion">
          <h2 class="question-text">{{ currentQuestion.question_text }}</h2>

          <div class="options-grid">
            <button
              class="option-btn"
              *ngFor="let opt of options"
              [class.selected]="selectedAnswer === opt.key"
              [class.correct]="answered && opt.key === currentQuestion.correct_option"
              [class.wrong]="answered && selectedAnswer === opt.key && opt.key !== currentQuestion.correct_option"
              (click)="selectAnswer(opt.key)"
              [disabled]="answered">
              <span class="option-key">{{ opt.key.toUpperCase() }}</span>
              <span class="option-text">{{ opt.value }}</span>
            </button>
          </div>

          <div class="answer-feedback" *ngIf="answered">
            <span *ngIf="selectedAnswer === currentQuestion.correct_option" class="feedback-correct">✓ Correct!</span>
            <span *ngIf="selectedAnswer !== currentQuestion.correct_option" class="feedback-wrong">
              ✗ Incorrect. The answer was <strong>{{ currentQuestion.correct_option.toUpperCase() }}</strong>.
            </span>
          </div>

          <div class="quiz-actions">
            <button class="btn btn-primary" *ngIf="!answered" (click)="submitAnswer()" [disabled]="!selectedAnswer">
              Submit Answer
            </button>
            <button class="btn btn-primary" *ngIf="answered" (click)="nextQuestion()">
              {{ isLastQuestion ? 'Finish Quiz' : 'Next Question →' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Results Screen -->
      <div *ngIf="finished" class="results-card">
        <div class="results-icon">🎓</div>
        <h2 class="results-title">Quiz Complete!</h2>
        <div class="score-display">
          <span class="score-number">{{ score }}</span>
          <span class="score-total">/ {{ totalQuestions }}</span>
        </div>
        <p class="score-percent">{{ scorePercent }}% Score</p>
        <div class="results-actions">
          <a routerLink="/dashboard" class="btn btn-primary">Back to Dashboard</a>
          <button class="btn btn-outline" (click)="restart()">Retry Quiz</button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .quiz-container {
      max-width: 720px; margin: 60px auto; padding: 0 24px;
    }
    .empty-quiz { text-align: center; padding: 80px 0; }
    .empty-quiz h2 { font-family: var(--font-heading); color: var(--color-ivory); margin-bottom: 12px; }
    .empty-quiz p { color: var(--color-text-muted); margin-bottom: 24px; }

    .quiz-card {
      background: var(--color-card-dark); border: 1px solid var(--color-border);
      border-radius: var(--radius-lg); overflow: hidden;
    }
    .quiz-progress-bar { height: 4px; background: rgba(255,255,255,0.08); }
    .quiz-progress-fill { height: 100%; background: var(--color-accent); transition: width 0.5s ease; }
    .quiz-meta {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 28px; border-bottom: 1px solid var(--color-border);
    }
    .quiz-title { font-family: var(--font-heading); font-size: 1rem; color: var(--color-ivory); }
    .quiz-counter { color: var(--color-text-muted); font-size: 0.85rem; }

    .question-block { padding: 36px 28px; }
    .question-text { font-family: var(--font-heading); font-size: 1.6rem; color: var(--color-ivory); margin-bottom: 32px; line-height: 1.4; }

    .options-grid { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .option-btn {
      display: flex; align-items: center; gap: 16px;
      padding: 16px 20px; background: rgba(255,255,255,0.04);
      border: 1.5px solid var(--color-border); border-radius: var(--radius-sm);
      color: var(--color-ivory-dim); font-family: var(--font-body); font-size: 0.95rem;
      cursor: pointer; transition: var(--transition); text-align: left;
    }
    .option-btn:hover:not(:disabled) { border-color: var(--color-accent); color: var(--color-ivory); background: rgba(212,130,10,0.06); }
    .option-btn.selected { border-color: var(--color-accent); background: rgba(212,130,10,0.1); color: var(--color-ivory); }
    .option-btn.correct { border-color: var(--color-sage); background: rgba(122,158,126,0.15); color: var(--color-sage); }
    .option-btn.wrong { border-color: var(--color-error); background: rgba(224,82,82,0.1); color: var(--color-error); }
    .option-key {
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.8rem; flex-shrink: 0;
    }
    .option-btn.selected .option-key { background: var(--color-accent); color: #fff; }
    .option-btn.correct .option-key { background: var(--color-sage); color: #fff; }
    .option-btn.wrong .option-key { background: var(--color-error); color: #fff; }

    .answer-feedback { margin-bottom: 20px; font-size: 1rem; font-weight: 600; }
    .feedback-correct { color: var(--color-sage); }
    .feedback-wrong { color: var(--color-error); }
    .quiz-actions { display: flex; justify-content: flex-end; }

    .results-card {
      background: var(--color-card-dark); border: 1px solid var(--color-border);
      border-radius: var(--radius-lg); padding: 60px; text-align: center;
    }
    .results-icon { font-size: 4rem; margin-bottom: 20px; }
    .results-title { font-family: var(--font-heading); font-size: 2.5rem; color: var(--color-ivory); margin-bottom: 32px; }
    .score-display { display: flex; align-items: baseline; justify-content: center; gap: 4px; margin-bottom: 8px; }
    .score-number { font-family: var(--font-heading); font-size: 5rem; font-weight: 900; color: var(--color-accent); }
    .score-total { font-family: var(--font-heading); font-size: 2rem; color: var(--color-text-muted); }
    .score-percent { color: var(--color-text-muted); margin-bottom: 40px; font-size: 1.1rem; }
    .results-actions { display: flex; gap: 16px; justify-content: center; }
  `],
})
export class QuizAttemptComponent implements OnInit {
    quizzes: Quiz[] = [];
    currentQuiz: Quiz | null = null;
    currentIndex = 0;
    selectedAnswer: string | null = null;
    answered = false;
    score = 0;
    totalQuestions = 0;
    finished = false;
    loading = true;

    options: { key: string; value: string }[] = [];

    get currentQuestion(): QuizQuestion | null {
        return this.currentQuiz?.questions?.[this.currentIndex] ?? null;
    }
    get progressPercent(): number {
        const total = this.currentQuiz?.questions?.length ?? 1;
        return ((this.currentIndex) / total) * 100;
    }
    get isLastQuestion(): boolean {
        return this.currentIndex === (this.currentQuiz?.questions?.length ?? 1) - 1;
    }
    get scorePercent(): number {
        return this.totalQuestions > 0 ? Math.round((this.score / this.totalQuestions) * 100) : 0;
    }

    constructor(private route: ActivatedRoute, private quizSvc: QuizService) { }

    ngOnInit(): void {
        const lessonId = Number(this.route.snapshot.paramMap.get('id'));
        this.quizSvc.getByLesson(lessonId).subscribe({
            next: (quizzes) => {
                this.quizzes = quizzes;
                if (quizzes.length > 0) {
                    this.currentQuiz = quizzes[0];
                    this.totalQuestions = quizzes[0].questions?.length ?? 0;
                    this.buildOptions();
                }
                this.loading = false;
            },
            error: () => { this.loading = false; },
        });
    }

    buildOptions(): void {
        const q = this.currentQuestion;
        if (!q) return;
        this.options = [
            { key: 'a', value: q.option_a },
            { key: 'b', value: q.option_b },
            { key: 'c', value: q.option_c },
            { key: 'd', value: q.option_d },
        ];
    }

    selectAnswer(key: string): void {
        if (!this.answered) this.selectedAnswer = key;
    }

    submitAnswer(): void {
        if (!this.selectedAnswer || !this.currentQuestion) return;
        this.answered = true;
        if (this.selectedAnswer === this.currentQuestion.correct_option) {
            this.score++;
        }
    }

    nextQuestion(): void {
        if (this.isLastQuestion) {
            this.finished = true;
        } else {
            this.currentIndex++;
            this.selectedAnswer = null;
            this.answered = false;
            this.buildOptions();
        }
    }

    restart(): void {
        this.currentIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.answered = false;
        this.finished = false;
        this.buildOptions();
    }
}
