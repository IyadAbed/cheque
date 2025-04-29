import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.prod';
import { RestService } from './core/services/rest.service';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  usersEndPoint: string = '';
  constructor(private restService: RestService, private http: HttpClient) {
    this.usersEndPoint = environment.apiEndpoint;
  }

  sendGetRequest<TRequest, TResponse>(
    url: string,
    port: number,
    version?: 'v1' | 'v2'
  ) {
    const apiUrl = `${this.usersEndPoint}:${port}/api/${
      version ? version : 'v1'
    }/${url}`;
    return this.restService.request<TRequest, TResponse>({
      method: 'GET',
      url: apiUrl,
      withoutBody: true,
      showToaster: false,
    });
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

  uploadImage(data: any, port: number) {
    return this.restService.request({
      method: 'POST',
      url: `${this.usersEndPoint}:${port}/api/v1/media`,
      body: data,
      withoutBody: true,
      isFormData: true,
      showToaster: false,
    });
  }

  uploadImageCallback(image: File, callback: (imageId: string) => void) {
    const formData = new FormData();
    formData.append('file', image);

    this.uploadImage(formData, 7086).subscribe({
      next: (res: any) => {
        console.log('Image uploaded successfully:', res);
        const imageId: string = res?.message;
        console.log('Received imageId:', imageId);
        callback(imageId);
      },
      error: (error) => {
        alert('خطأ في تحميل الصورة')
      },
    });
  }

  downloadexcel(
    url: string,
    version: "v1" | "v2" = "v1",
    port: number
  ): Observable<Blob> {

    const fullUrl = `${this.usersEndPoint}:8080/api/v1/media/${url}`;

    return this.http
      .get(fullUrl, {
        // Use post and include the body
        responseType: "blob", // Set the response type to blob
        observe: "response", // Observe the full response for headers, status, etc.
      })
      .pipe(
        map((response) => response.body as Blob) // Extract the Blob from the response
      );
  }

}
