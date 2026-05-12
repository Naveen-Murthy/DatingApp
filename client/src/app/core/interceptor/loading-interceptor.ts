import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BusyService } from '../services/busy-service';
import { delay, finalize, of, tap } from 'rxjs';

const cache = new Map<string, HttpResponse<any>>();

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);

  // const generateCacheKey = (url: string, params: HttpParams): string => {
  //   const paramString = params
  //     .keys()
  //     .map((key) => `${key}==${params.get(key)}`)
  //     .join('&');

  //   return paramString ? `${url}?${paramString}` : url;
  // };
  // const cacheKey = generateCacheKey(req.url, req.params);

  // Instead of using the above logic, we can use Built-in Angular way to get URL + Params
  const cacheKey = req.urlWithParams;

  const invalidateCache = (urlPattern: string) => {
    cache.forEach((value, key) => {
      if (key.includes(urlPattern)) {
        cache.delete(key);
      }
    });
  };

  if (req.method === 'GET') {
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      return of(cachedResponse);
    }
  }

  if (req.method == 'POST' && req.url.includes('/likes')) {
    invalidateCache('/likes');
  }
  if (req.method == 'POST' && req.url.includes('/messages')) {
    invalidateCache('/messages');
  }

  busyService.busy();

  return next(req).pipe(
    delay(500),
    tap((response) => {
      if (response instanceof HttpResponse && req.method === 'GET') {
        cache.set(cacheKey, response);
      }
    }),
    finalize(() => {
      busyService.idle();
    }),
  );
};
