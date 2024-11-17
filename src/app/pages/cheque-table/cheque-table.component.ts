import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import { DataView } from 'primeng/dataview';
import { Table } from 'primeng/table';
import { HttpService } from '../../http.service';

@Component({
  selector: 'app-cheque-table',
  templateUrl: './cheque-table.component.html',
  styleUrl: './cheque-table.component.scss',
  providers: [MessageService],
})
export class ChequeTableComponent implements OnInit {
  cols: any[] = [];

  product: any = {};

  submitted: boolean = false;

  productDialog: boolean = false;

  categoryDialog: boolean = false;

  sectionDialog: boolean = false;

  sizeDialog: boolean = false;

  optionDialog: boolean = false;

  chequeDialog: boolean = false;

  deleteProductDialog: boolean = false;

  payChequeDialog: boolean = false;

  UpdateChequeDialog: boolean = false;

  deleteProductsDialog: boolean = false;

  selectedProducts: any[] = [];

  products: ChequeContent[] = [];

  sortOptions: SelectItem[] = [];

  sortOrder: number = 0;

  sortField: string = '';

  sourceCities: any[] = [];

  targetCities: any[] = [];

  orderCities: any[] = [];

  statuses: any[] = [];

  items: MenuItem[] = [];

  categoryForm: FormGroup;

  sectionForm: FormGroup;

  sizeForm: FormGroup;

  optionForm: FormGroup;

  itemForm: FormGroup;

  chequeForm: FormGroup;

  constructor(
    private messageService: MessageService,
    private fb: FormBuilder,
    private http: HttpClient,
    private https: HttpService
  ) {
    this.categoryForm = fb.group({
      storeId: ['', Validators.required],
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      descriptionEn: ['', Validators.required],
      descriptionAr: ['', Validators.required],
      isOffer: [false, Validators.required],
    });

    this.sectionForm = fb.group({
      categoryId: ['', Validators.required],
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      descriptionEn: ['', Validators.required],
      descriptionAr: ['', Validators.required],
    });

    this.sizeForm = fb.group({
      sectionId: ['', Validators.required],
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      value: [0, Validators.required],
    });

    this.optionForm = fb.group({
      sectionId: ['', Validators.required],
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      price: [0, Validators.required],
    });

    this.itemForm = fb.group({
      sectionId: ['', Validators.required],
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      descriptionEn: ['', Validators.required],
      descriptionAr: ['', Validators.required],
      sizeIds: ['', Validators.required],
      optionIds: [''],
      chequeAmount: [0, Validators.required],
      chequePayTo: ['', Validators.required],
      chequeNumber: [0, Validators.required],
      dateOfPay: ['', Validators.required],
    });

    this.chequeForm = fb.group({
      chequeAmount: [0, Validators.required],
      chequePayTo: ['', Validators.required],
      chequeNumber: [0, Validators.required],
      dateOfPay: ['', Validators.required],
    });
  }

  ngOnInit() {
    // this.getProducts().then((data) => (this.products = data));
    this.getAllCheque(10);
    this.cols = [
      { field: 'product', header: 'Product' },
      { field: 'price', header: 'Price' },
      { field: 'category', header: 'Category' },
      { field: 'rating', header: 'Reviews' },
      { field: 'inventoryStatus', header: 'Status' },
    ];

    this.statuses = [
      { label: 'INSTOCK', value: 'instock' },
      { label: 'LOWSTOCK', value: 'lowstock' },
      { label: 'OUTOFSTOCK', value: 'outofstock' },
    ];
    this.items = [
      { label: 'Update', icon: 'pi pi-refresh' },
      { label: 'Delete', icon: 'pi pi-times' },
    ];
    // this.sourceCities = [
    //   { name: 'San Francisco', code: 'SF' },
    //   { name: 'London', code: 'LDN' },
    //   { name: 'Paris', code: 'PRS' },
    //   { name: 'Istanbul', code: 'IST' },
    //   { name: 'Berlin', code: 'BRL' },
    //   { name: 'Barcelona', code: 'BRC' },
    //   { name: 'Rome', code: 'RM' },
    // ];

    // this.targetCities = [];

    // this.orderCities = [
    //   { name: 'San Francisco', code: 'SF' },
    //   { name: 'London', code: 'LDN' },
    //   { name: 'Paris', code: 'PRS' },
    //   { name: 'Istanbul', code: 'IST' },
    //   { name: 'Berlin', code: 'BRL' },
    //   { name: 'Barcelona', code: 'BRC' },
    //   { name: 'Rome', code: 'RM' },
    // ];

    this.sortOptions = [
      { label: 'Price High to Low', value: '!price' },
      { label: 'Price Low to High', value: 'price' },
    ];
  }

  getAllCheque(pageSize: any) {
    console.log('pageSize', pageSize);

    this.https
      .sendPostRequest<ChequeDetailsRes, PaginatedChequeResponse>(
        `checks/search?page=0&size=${pageSize}`,
        {},
        8080,
        false,
        'v1'
      )
      .subscribe((res) => {
        this.products = res.content;
      });
  }

  onSortChange(event: any) {
    const value = event.value;

    if (value.indexOf('!') === 0) {
      this.sortOrder = -1;
      this.sortField = value.substring(1, value.length);
    } else {
      this.sortOrder = 1;
      this.sortField = value;
    }
  }

  chequeUpdateStatus(product: ChequeContent) {
    this.payChequeDialog = true;
    this.product = { ...product };
  }

  confirmUpdateStatus(product: ChequeContent) {
    this.https
      .sendPatchRequest(`checks/${this.product.id}/pay`, {}, 8080, 'v1')
      .subscribe((res) => {
        this.payChequeDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Cheque Payed',
          life: 3000,
        });
        this.product = {};
        this.getAllCheque(10);
      });
  }

  deleteCheque(product: ChequeContent) {
    this.deleteProductDialog = true;
    this.product = { ...product };
  }

  confirmDeleteSelected() {
    this.deleteProductsDialog = false;
    this.products = this.products.filter(
      (val) => !this.selectedProducts.includes(val)
    );
    this.messageService.add({
      severity: 'success',
      summary: 'Successful',
      detail: 'Products Deleted',
      life: 3000,
    });
    this.selectedProducts = [];
  }

  confirmDelete() {
    this.https
      .sendDeleteRequest(`checks/${this.product.id}`, 8080, {}, 'v1')
      .subscribe((res) => {
        this.deleteProductDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Cheque Deleted',
          life: 3000,
        });
        this.product = {};
        this.getAllCheque(10);
      });
    // this.products = this.products.filter((val) => val.id !== this.product.id);
  }

  updateCheque() {
    this.chequeForm.markAllAsTouched();
    if (this.chequeForm.valid) {
      const body = this.chequeForm.value;
      this.https
        .sendPutRequest(
          `checks/${this.product.id}`,
          {
            ...body,
            chequeNumber: +body.chequeNumber,
          },
          8080,
          'v1'
        )
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
            this.UpdateChequeDialog = false;
            this.chequeForm.reset();
            this.getAllCheque(10);
          },
        });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something Went Wrong Please Fill All field!',
        life: 3000,
      });
    }
  }

  onFilter(dv: DataView, event: Event) {
    console.log('====================================');
    console.log('sadasfsdfsdf');
    console.log('====================================');
    dv.filter((event.target as HTMLInputElement).value);
  }

  openNew() {
    this.product = {};
    this.submitted = false;
    this.chequeDialog = true;
  }

  deleteSelectedProducts() {
    this.deleteProductsDialog = true;
  }

  addCategory() {
    this.categoryDialog = true;
  }

  editProduct(product: any) {
    this.product = { ...product };

    const dateOfPay = new Date(product.dateOfPay);

    this.chequeForm.patchValue({
      chequeAmount: this.product.chequeAmount,
      chequePayTo: this.product.chequePayTo,
      chequeNumber: this.product.chequeNumber,
      dateOfPay,
    });
    this.UpdateChequeDialog = true;
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  saveProduct() {
    this.submitted = true;

    if (this.product.name?.trim()) {
      if (this.product.id) {
        // @ts-ignore
        this.product.inventoryStatus = this.product.inventoryStatus.value
          ? this.product.inventoryStatus.value
          : this.product.inventoryStatus;
        this.products[this.findIndexById(this.product.id)] = this.product;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product Updated',
          life: 3000,
        });
      } else {
        this.product.id = this.createId();
        this.product.code = this.createId();
        this.product.image = 'product-placeholder.svg';
        // @ts-ignore
        this.product.inventoryStatus = this.product.inventoryStatus
          ? this.product.inventoryStatus.value
          : 'INSTOCK';
        this.products.push(this.product);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product Created',
          life: 3000,
        });
      }

      this.products = [...this.products];
      this.productDialog = false;
      this.product = {};
    }
  }

  addNewCheque() {
    this.chequeForm.markAllAsTouched();
    if (this.chequeForm.valid) {
      this.chequeDialog = false;
      console.log('this.chequeForm.value', this.chequeForm.value);
      const body = this.chequeForm.value;

      this.https.sendPostRequest('checks', body, 8080, false, 'v1').subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Cheque Added',
            life: 3000,
          });
        },
        complete: () => {
          this.chequeForm.reset();
          this.getAllCheque(10);
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

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.products.length; i++) {
      if (this.products[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  createId(): string {
    let id = '';
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}

interface ChequeDetailsRes {
  startChequeAmount: number;
  endChequeAmount: number;
  chequePayTo: string;
  chequeNumber: number;
  isPayed: boolean;
  startDateOfPay: string; // Use `Date` type if you'll parse it into a Date object
  endDateOfPay: string; // Same as above
  endLatencyDate: string; // Same as above
  startLatencyDate: string; // Same as above
}

interface SortDetails {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

interface PageableDetails {
  offset: number;
  sort: SortDetails;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
}

interface ChequeContent {
  id: string;
  chequeAmount: number;
  chequePayTo: string;
  chequeNumber: number;
  dateOfPay: string; // Use `Date` if you intend to parse it as a `Date` object
  isPayed: boolean;
  latencyDate: string; // Same as above
  createdAt: string; // Same as above
  updatedAt: string; // Same as above
  deletedAt: string | null; // Nullable for potential absence
}

interface PaginatedChequeResponse {
  totalPages: number;
  totalElements: number;
  size: number;
  content: ChequeContent[];
  number: number;
  sort: SortDetails;
  pageable: PageableDetails;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
