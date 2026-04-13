import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoaderService } from '../services/loader.service';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loader = inject(LoaderService);

  // Skip loader for polling/silent requests
  if (req.headers.has('X-Skip-Loader')) {
    return next(req.clone({ headers: req.headers.delete('X-Skip-Loader') }));
  }

  loader.show();
  return next(req).pipe(
    finalize(() => loader.hide())
  );
};
