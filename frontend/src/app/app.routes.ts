import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },

    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    },

    // Student routes
    {
        path: 'dashboard',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['student'] },
        loadComponent: () => import('./pages/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent),
    },
    {
        path: 'courses',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/course-browse/course-browse.component').then(m => m.CourseBrowseComponent),
    },
    {
        path: 'courses/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/course-view/course-view.component').then(m => m.CourseViewComponent),
    },
    {
        path: 'quiz/:id',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['student'] },
        loadComponent: () => import('./pages/quiz-attempt/quiz-attempt.component').then(m => m.QuizAttemptComponent),
    },
    {
        path: 'assignments/:id',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['student'] },
        loadComponent: () => import('./pages/assignment-submit/assignment-submit.component').then(m => m.AssignmentSubmitComponent),
    },
    {
        path: 'certificates',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['student'] },
        loadComponent: () => import('./pages/certificates/certificates.component').then(m => m.CertificatesComponent),
    },

    // Instructor routes
    {
        path: 'instructor',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['instructor', 'admin'] },
        loadComponent: () => import('./pages/instructor-dashboard/instructor-dashboard.component').then(m => m.InstructorDashboardComponent),
    },
    {
        path: 'instructor/courses/new',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['instructor', 'admin'] },
        loadComponent: () => import('./pages/create-course/create-course.component').then(m => m.CreateCourseComponent),
    },

    { path: '**', redirectTo: '/login' },
];
