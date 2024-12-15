import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../http.service';
import { MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { InvoiceService } from '../invoice.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [MessageService, DatePipe],
})
export class HomeComponent {
  supplierDialog: boolean = false;
  projectDialog: boolean = false;
  itemDialog: boolean = false;
  allSuppliers: Supplier[] = [];
  allItem: Item[] = [];
  allProjects: Project[] = [];
  supplierForm!: FormGroup;
  projectForm!: FormGroup;
  itemForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private https: HttpService,
    private messageService: MessageService,
    private datePipe: DatePipe,
    private invoiceService: InvoiceService
  ) {
    this.getAllItems();
    this.getAllProjects();
    this.getAllSuppliers();
    // this.https
    //   .sendPostRequest(
    //     'users',
    //     {
    //       name: 'Diaa',
    //       email: 'diaa@mo3alam.com',
    //       password: 'Admin@123',
    //       phone: '971551263303',
    //       role: 'ADMIN_INVOICE',
    //     },
    //     8080
    //   )
    //   .subscribe((res) => {
    //     console.log('res', res);
    //   });
    this.supplierForm = fb.group({
      name: ['', Validators.required],
      trnNumber: [''],
    });
    this.projectForm = fb.group({
      name: ['', Validators.required],
    });
    this.itemForm = fb.group({
      name: ['', Validators.required],
      description: [''],
    });
  }

  normalizeDate(date: any): string | null {
    if (!date) return null;
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // Adjust to UTC without changing the time
    return d.toISOString().split('T')[0]; // Keep only the date part
  }

  getAllSuppliers() {
    this.https
      .sendGetRequest<any, Supplier[]>('suppliers', 8080)
      .subscribe((res) => {
        this.allSuppliers = res;
        this.invoiceService.allSuppliers.next(res);
      });
  }
  getAllItems() {
    this.https.sendGetRequest<any, Item[]>('items', 8080).subscribe((res) => {
      this.allItem = res;
      this.invoiceService.allItem.next(res);
    });
  }
  getAllProjects() {
    this.https
      .sendGetRequest<any, Project[]>('projects', 8080)
      .subscribe((res) => {
        this.allProjects = res;
        this.invoiceService.allProjects.next(res);
      });
  }

  addNewSupplier() {
    this.supplierForm.markAllAsTouched();
    if (this.supplierForm.valid) {
      this.supplierDialog = false;
      let body = this.supplierForm.value;
      // body = {
      //   ...body,
      //   dateOfPay: this.normalizeDate(this.supplierForm.value.dateOfPay),
      //   chequeType: this.supplierForm.value.chequeType?.value,
      //   isPayed: this.supplierForm.value.isPayed?.value,
      // };

      this.https
        .sendPostRequest('suppliers', body, 8080, false, 'v1')
        .subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Cheque Added',
              life: 3000,
            });
          },
          complete: () => {
            this.supplierForm.reset();
            this.getAllSuppliers();
            // this.getAllCheque(10, this.sortDirection);
          },
        });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something Went Wrong!',
        life: 3000,
      });
    }
  }

  addNewProject() {
    this.projectForm.markAllAsTouched();
    if (this.projectForm.valid) {
      this.projectDialog = false;
      let body = this.projectForm.value;
      // body = {
      //   ...body,
      //   dateOfPay: this.normalizeDate(this.projectForm.value.dateOfPay),
      //   chequeType: this.projectForm.value.chequeType?.value,
      //   isPayed: this.projectForm.value.isPayed?.value,
      // };

      this.https
        .sendPostRequest('projects', body, 8080, false, 'v1')
        .subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Cheque Added',
              life: 3000,
            });
          },
          complete: () => {
            this.getAllProjects();
            this.projectForm.reset();
            // this.getAllCheque(10, this.sortDirection);
          },
        });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something Went Wrong!',
        life: 3000,
      });
    }
  }

  addNewItem() {
    this.itemForm.markAllAsTouched();
    if (this.itemForm.valid) {
      this.itemDialog = false;
      let body = this.itemForm.value;
      // body = {
      //   ...body,
      //   dateOfPay: this.normalizeDate(this.itemForm.value.dateOfPay),
      //   chequeType: this.itemForm.value.chequeType?.value,
      //   isPayed: this.itemForm.value.isPayed?.value,
      // };

      this.https.sendPostRequest('items', body, 8080, false, 'v1').subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Item Added',
            life: 3000,
          });
        },
        complete: () => {
          this.getAllItems();
          this.itemForm.reset();
          // this.getAllCheque(10, this.sortDirection);
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something Went Wrong!',
        life: 3000,
      });
    }
  }
}

export interface Supplier {
  id: string;
  name: string;
  trnNumber: string;
  status: string;
  createdAt: string;
}
export interface Item {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}
export interface Project {
  id: string;
  name: string;
  createdAt: string;
}
