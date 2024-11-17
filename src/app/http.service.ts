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

  sendDeleteRequest<TRequest, TResponse>(
    url: string,
    port: number,
    body?: any,
    version?: 'v1' | 'v2'
  ) {
    const apiUrl = `${this.usersEndPoint}:${port}/api/${
      version ? version : 'v1'
    }/${url}`;
    return this.restService.request<TRequest, TResponse>({
      method: 'DELETE',
      url: apiUrl,
      body: body,
      withoutBody: body ? true : false,
      showToaster: false,
    });
  }

  sendPatchRequest<TRequest, TResponse>(
    url: string,
    body: any,
    port: number,
    version?: 'v1' | 'v2'
  ) {
    const apiUrl = `${this.usersEndPoint}:${port}/api/${
      version ? version : 'v1'
    }/${url}`;
    return this.restService.request<TRequest, TResponse>({
      method: 'PATCH',
      url: apiUrl,
      body,
      withoutBody: true,
    });
  }

  sendPutRequest<TRequest, TResponse>(
    url: string,
    body: any,
    port: number,
    version?: 'v1' | 'v2'
  ) {
    const apiUrl = `${this.usersEndPoint}:${port}/api/${
      version ? version : 'v1'
    }/${url}`;

    return this.restService.request<TRequest, TResponse>({
      method: 'PUT',
      url: apiUrl,
      body: body,
      withoutBody: true,
      showToaster: false,
    });
  }
  sendPutRequestWithoutBody(url: string, port: number, version?: 'v1' | 'v2') {
    const apiUrl = `${this.usersEndPoint}:${port}/api/${
      version ? version : 'v1'
    }/${url}`;

    return this.restService.request({
      method: 'PUT',
      url: apiUrl,
      withoutBody: true,
      showToaster: false,
    });
  }
}
