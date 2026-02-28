import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, _state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const requiredRoles: string[] = route.data['roles'] ?? [];
    const user = auth.currentUser();

    if (!user) {
        router.navigate(['/login']);
        return false;
    }
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        router.navigate(['/dashboard']);
        return false;
    }
    return true;
};
