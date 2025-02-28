import { Component } from '@angular/core';
import { LayoutService } from '../../layout/service/layout.service';
import { HttpService } from '../../http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [
    `
      :host ::ng-deep .pi-eye,
      :host ::ng-deep .pi-eye-slash {
        transform: scale(1.6);
        margin-right: 1rem;
        color: var(--primary-color) !important;
      }
    `,
  ],
})
export class LoginComponent {
  //   valCheck: string[] = ['remember'];
  userForm: FormGroup;

  password!: string;

  constructor(
    public layoutService: LayoutService,
    private http: HttpService,
    private fb: FormBuilder,
    private route: Router
  ) {
    this.userForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  logIn() {
    this.http
      .sendPostRequest('auth/login', this.userForm.value, 8080, false, 'v1')
      .subscribe((res: any) => {
        localStorage.setItem('user', res.access_token);
        if (res.user.role === 'ADMIN_INVOICE') {
          localStorage.setItem('role', 'invoice');
          this.route.navigate(['invoice']);
        } else {
          localStorage.setItem('role', 'cheque');
          this.route.navigate(['cheque']);
        }
      });
  }
}
