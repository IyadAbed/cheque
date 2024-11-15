import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.prod';
import { RestService } from './core/services/rest.service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  usersEndPoint: string = '';
  constructor(private restService: RestService) {
    this.usersEndPoint = environment.apiEndpoint;
  }

  sendPostRequest<TRequest, TResponse>(
    url: string,
    body: any,
    port: number,
    isFormData: boolean = false,
    version?: 'v1' | 'v2'
  ) {
    const apiUrl = `${this.usersEndPoint}:${port}/api/${
      version ? version : 'v1'
    }/${url}`;
    return this.restService.request<TRequest, TResponse>({
      method: 'POST',
      url: apiUrl,
      body: body,
      withoutBody: true,
      isFormData: isFormData,
    });
  }
}
