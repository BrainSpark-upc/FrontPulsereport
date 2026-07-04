import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { TokenStorage } from "./token.storage";

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenStorage = inject(TokenStorage);
  const router = inject(Router);

  const isAuthenticationCall = request.url.includes("/authentication/");
  const token = tokenStorage.getToken();

  const outgoing =
    token && !isAuthenticationCall
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(outgoing).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isAuthenticationCall
      ) {
        tokenStorage.clear();
        router.navigate(["/sign-in"]);
      }
      return throwError(() => error);
    }),
  );
};
