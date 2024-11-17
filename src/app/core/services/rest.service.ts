import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Toastr } from './toastrService';

@Injectable({
  providedIn: 'root',
})
export class RestService {
  showToaster: boolean | undefined = true;

  constructor(private http: HttpClient, private toast: Toastr) {}

  request<TRequest, TResponse>(options: {
    method: string;
    url: string;
    body?: TRequest;
    headers?: HttpHeaders;
    params?: HttpParams;
    withoutBody?: boolean;
    showToaster?: boolean;

    isFormData?: boolean;
  }): Observable<TResponse> {
    const {
      method,
      url,
      showToaster,
      body,
      headers,
      params,
      withoutBody,
      isFormData,
    } = options;

    this.showToaster = showToaster;
    const requestOptions = { headers, params };
    let data;

    if (body !== undefined && !withoutBody) {
      data = { body: { ...body } };
    } else if (withoutBody) {
      data = { ...body };
    }
    if (isFormData) {
      data = body;
    }

    if (params) {
      let httpParams = new HttpParams();
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          // httpParams = httpParams.set(key, params[key]?);
        }
      }
      requestOptions.params = httpParams;
    }

    switch (method.toLowerCase()) {
      case 'get':
        return this.http.get<TResponse>(url, requestOptions).pipe(
          tap({
            next: (response: any) => {
              if (this.showToaster)
                this.toast.showSuccess(response.data?.message);
            },
            error: (error: any) => {
              console.log(error.error.message, 'eroorMomo');
              switch (error.status) {
                case 401:
                  this.toast.showInfo(error.error.message);
                  break;
                case 500:
                  this.toast.showError(error.error.msg);
                  break;
                default:
                  if (error.error.errors)
                    error.error.errors.forEach((err: any) => {
                      this.toast.showError(err);
                    });

                  if (error.error.message)
                    this.toast.showError(error.error.message);

                  if (error.error.msg) this.toast.showError(error.error.msg);
                  break;
              }
            },
          })
        );
      case 'post':
        return this.http.post<TResponse>(url, data, requestOptions).pipe(
          tap({
            next: (response: any) => {
              if (this.showToaster)
                this.toast.showSuccess(response.data?.message);
            },
            error: (error: any) => {
              switch (error.status) {
                case 401:
                  this.toast.showError(error.error.message);
                  break;
                case 409:
                  this.toast.showError(error.error.message);
                  break;
                case 500:
                  this.toast.showError(error.error.msg);
                  break;
                default:
                  if (error.error?.errors)
                    error.error.errors.forEach((err: any) => {
                      this.toast.showError(err);
                    });

                  if (error.error.message)
                    this.toast.showError(error.error.message);

                  if (error.error.msg) this.toast.showError(error.error.msg);
                  break;
              }
            },
          })
        );
      case 'put':
        return this.http.put<TResponse>(url, data, requestOptions).pipe(
          tap({
            next: (response: any) => {
              if (this.showToaster)
                this.toast.showSuccess(response.data?.message);
            },
            error: (error: any) => {
              switch (error.status) {
                case 401:
                  this.toast.showInfo(error.error.message);
                  break;
                case 500:
                  this.toast.showError(error.error.msg);
                  break;
                default:
                  if (error.error.errors)
                    error.error.errors.forEach((err: any) => {
                      this.toast.showError(err);
                    });

                  if (error.error.message)
                    this.toast.showError(error.error.message);

                  if (error.error.msg) this.toast.showError(error.error.msg);
                  break;
              }
            },
          })
        );
      case 'patch':
        return this.http.patch<TResponse>(url, data, requestOptions).pipe(
          tap({
            next: (response: any) => {
              if (this.showToaster)
                this.toast.showSuccess(response.data?.message);
            },
            error: (error: any) => {
              switch (error.status) {
                case 401:
                  this.toast.showInfo(error.error.message);
                  break;
                case 500:
                  this.toast.showError(error.error.msg);
                  break;
                default:
                  if (error.error.errors)
                    error.error.errors.forEach((err: any) => {
                      this.toast.showError(err);
                    });

                  if (error.error.message)
                    this.toast.showError(error.error.message);

                  if (error.error.msg) this.toast.showError(error.error.msg);
                  break;
              }
            },
          })
        );
      case 'delete':
        return this.http.delete<TResponse>(url, requestOptions).pipe(
          tap({
            next: (response: any) => {
              if (this.showToaster && response.message)
                this.toast.showSuccess(response.message);
              if (this.showToaster && response.msg)
                this.toast.showSuccess(response.msg);
            },
            error: (error: any) => {
              switch (error.status) {
                case 401:
                  this.toast.showInfo(error.error.message);
                  break;
                case 500:
                  this.toast.showError(error.error.msg);
                  break;
                default:
                  if (error.error.errors)
                    error.error.errors.forEach((err: any) => {
                      this.toast.showError(err);
                    });

                  if (error.error.message)
                    this.toast.showError(error.error.message);

                  if (error.error.msg) this.toast.showError(error.error.msg);
                  break;
              }
            },
          })
        );
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }
}
