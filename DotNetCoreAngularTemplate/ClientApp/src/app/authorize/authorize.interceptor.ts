import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class AuthorizeInterceptor implements HttpInterceptor {
  intercept(httpRequest: HttpRequest<any>, httpHandler: HttpHandler): Observable<HttpEvent<any>> {
    if (localStorage.getItem('token') != null) {
      const clonedRequest = httpRequest.clone({
        headers: httpRequest.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'))
      });
      return httpHandler.handle(clonedRequest).pipe();
    }
    else {
      return httpHandler.handle(httpRequest.clone());
    }
  }
}
