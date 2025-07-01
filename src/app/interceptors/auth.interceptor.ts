import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwt_token = localStorage.getItem('jwt_token');
  console.log('Request intercepted:', req.url);

  if (jwt_token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${jwt_token}`),
    });
    return next(authReq);
  }

  return next(req);
};
