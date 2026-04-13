// import { HttpInterceptorFn } from '@angular/common/http';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {

//   // Don't add token to login requests
//   if (req.url.includes('/auth/login')) {
//     return next(req);
//   }
//   const userStr = localStorage.getItem('currentUser');
//   if (!userStr) {
//     return next(req);
//   }
//   try {
//     const user = JSON.parse(userStr);
//     if (!user.token) {
//       return next(req);
//     }
//     const clonedReq = req.clone();
//     return next(clonedReq);
//   } catch (error) {
//     return next(req);
//   }
// };

// import { HttpInterceptorFn } from '@angular/common/http';
// import { isPlatformBrowser } from '@angular/common';
// import { inject, PLATFORM_ID } from '@angular/core';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   // Don't add token to login requests
//   if (req.url.includes('/auth/login')) {
//     return next(req);
//   }

//   const platformId = inject(PLATFORM_ID);

//   // Guard against SSR - localStorage is only available in the browser
//   if (!isPlatformBrowser(platformId)) {
//     return next(req);
//   }

//   const userStr = localStorage.getItem('currentUser');
//   if (!userStr) {
//     return next(req);
//   }

//   try {
//     const user = JSON.parse(userStr);
//     if (!user.token) {
//       return next(req);
//     }
//     const clonedReq = req.clone();
//     return next(clonedReq);
//   } catch (error) {
//     return next(req);
//   }
// };

import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);

  /* Skip interceptor for auth-related APIs */
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  /* SSR safety check */
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  try {
    const token = authService.getToken();
    const tempUid = authService.getTempUid();

    /* If no token AND no temp user, pass request */
    if (!token && !tempUid) {
      return next(req);
    }

    /* Build headers dynamically */
    let headers: { [key: string]: string } = {};

    /* Attach Bearer Token */
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    /* Attach temp_uid for multi-step registration APIs */
    if (tempUid) {
      headers['X-Temp-UID'] = tempUid;
    }

    /* Clone request with headers */
    const clonedReq = req.clone({
      setHeaders: headers,
    });

    return next(clonedReq);
  } catch (error) {
    console.error('Interceptor error:', error);
    return next(req);
  }
};
