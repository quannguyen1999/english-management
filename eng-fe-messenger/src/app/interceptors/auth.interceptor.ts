import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError, lastValueFrom } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token'); // or 'token', but be consistent!

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned).pipe(
      catchError((error) => {
        if (error.status === 401) {
          localStorage.clear();
          sessionStorage.clear();
          router.navigate(['/login']);
          window.location.reload();
        }
        return throwError(() => error);
      })
    );
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        localStorage.clear();
        sessionStorage.clear();
        router.navigate(['/login']);
        window.location.reload();
      }
      return throwError(() => error);
    })
  );
};