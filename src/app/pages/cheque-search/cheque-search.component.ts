import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import { DataView } from 'primeng/dataview';
import { Table } from 'primeng/table';
import { HttpService } from '../../http.service';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { DatePipe } from '@angular/common';
import { map } from 'rxjs';

@Component({
  selector: 'app-cheque-search',
  templateUrl: './cheque-search.component.html',
  styleUrl: './cheque-search.component.scss',
  providers: [MessageService, DatePipe],
})
export class ChequeSearchComponent implements OnInit {
  cols: any[] = [];

  product: any = {};

  sum: number;

  dateNow: Date;

  submitted: boolean = false;

  productDialog: boolean = false;

  chequeDialog: boolean = false;

  deleteProductDialog: boolean = false;

  payChequeDialog: boolean = false;

  UpdateChequeDialog: boolean = false;

  searchDialog: boolean = false;

  deleteProductsDialog: boolean = false;

  selectedProducts: any[] = [];

  products: ChequeContent[] = [];

  sortOptions: SelectItem[] = [];

  chequeStatus: any[] = [];

  chequeStatusAdd: any[] = [];

  chequeType: any[] = [];

  chequeTypeAdd: any[] = [];

  allSuppliers: any[] = [];

  filteredSuppliers: any[] = [];

  totalCredit: number = 0;

  totalDebit: number = 0;

  sortOrder: number = 0;

  sortField: string = '';

  chequeForm: FormGroup;

  searchForm: FormGroup;

  constructor(
    private messageService: MessageService,
    private fb: FormBuilder,
    private http: HttpClient,
    private https: HttpService,
    private datePipe: DatePipe
  ) {
    this.dateNow = new Date();

    this.searchForm = fb.group({
      chequePayTo: [null],
      chequeNumber: [null],
      startChequeAmount: [null],
      endChequeAmount: [null],
      isPayed: [null],
      startDateOfPay: [null],
      endDateOfPay: [null],
      chequeType: [null],
      startLatencyDate: [null],
      endLatencyDate: [null],
    });

    this.chequeForm = fb.group({
      chequeAmount: [0, Validators.required],
      chequePayTo: ['', Validators.required],
      chequeNumber: [0],
      dateOfPay: ['', Validators.required],
      isPayed: [null],
      chequeType: [null],
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

    this.chequeStatusAdd = [
      { label: 'Not Pass', value: false },
      { label: 'Pass', value: true },
    ];
    this.chequeTypeAdd = [
      { label: 'Credit', value: 'CREDIT' },
      { label: 'Debit', value: 'DEBIT' },
    ];
    this.chequeStatus = [
      { label: 'All', value: null },
      { label: 'Pass', value: true },
      { label: 'Not Pass', value: false },
    ];
    this.chequeType = [
      { label: 'All', value: null },
      { label: 'Credit', value: 'CREDIT' },
      { label: 'Debit', value: 'DEBIT' },
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

  calcSum() {
    console.log(this.selectedProducts);

    if (this.selectedProducts.length > 0) {
      let sums = 0;
      this.selectedProducts.forEach((cheque) => {
        sums +=
          cheque.chequeType === 'DEBIT'
            ? -cheque.chequeAmount
            : cheque.chequeAmount;
      });
      this.sum = sums;
    } else {
      this.sum = undefined;
    }
  }

  filterCountry(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;

    for (let i = 0; i < (this.allSuppliers as any[]).length; i++) {
      let suppliers = (this.allSuppliers as any[])[i];
      if (suppliers.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(suppliers);
      }
    }

    this.filteredSuppliers = filtered;
  }

  normalizeDate(date: any): string | null {
    if (!date) return null;
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // Adjust to UTC without changing the time
    return d.toISOString().split('T')[0]; // Keep only the date part
  }

  getAllCheque(pageSize: any) {
    this.https
      .sendPostRequest<ChequeDetailsRes, any>(
        `checks/list/search`,
        { isPayed: false },
        8080,
        false,
        'v1'
      )
      .subscribe((res) => {
        this.products = res.checksSearchResponses;
        this.allSuppliers = Array.from(
          new Set(
            res.checksSearchResponses.map(
              (chequeData: ChequeContent) => chequeData.chequePayTo
            )
          )
        );
        console.log('====================================');
        console.log(this.allSuppliers);
        console.log('====================================');
      });
  }

  AdvanceSearch(reset: boolean) {
    console.log('Form Search', this.searchForm.value);

    if (reset) {
      this.https
        .sendPostRequest<ChequeDetailsRes, any>(
          `checks/list/search`,
          { sortDirection: 'ASC' },
          8080,
          false,
          'v1'
        )
        .subscribe((res: any) => {
          this.products = res.checksSearchResponses;
          this.searchForm.reset();
          this.searchDialog = false;
          const depCre = res.checksSearchResponses.reduce(
            (acc, item) => {
              if (item.chequeType === 'CREDIT') {
                acc.creditSum += item.chequeAmount;
              } else if (item.chequeType === 'DEBIT') {
                acc.debitSum += item.chequeAmount;
              }
              return acc;
            },
            { creditSum: 0, debitSum: 0 } // Initial sums
          );
          console.log('depCre', depCre);
          this.totalDebit = depCre.debitSum;
          this.totalCredit = depCre.creditSum;
        });
    } else {
      let body = this.searchForm.value;
      body = {
        chequePayTo: this.searchForm.value.chequePayTo
          ? this.searchForm.value.chequePayTo
          : null,
        chequeNumber: this.searchForm.value.chequeNumber
          ? +this.searchForm.value.chequeNumber
          : null,
        startChequeAmount: this.searchForm.value.startChequeAmount
          ? this.searchForm.value.startChequeAmount
          : null,
        endChequeAmount: this.searchForm.value.endChequeAmount
          ? this.searchForm.value.endChequeAmount
          : null,
        isPayed: this.searchForm.value.isPayed?.value,
        startDateOfPay: this.searchForm.value.startDateOfPay
          ? this.normalizeDate(this.searchForm.value.startDateOfPay)
          : null,
        endDateOfPay: this.searchForm.value.endDateOfPay
          ? this.normalizeDate(this.searchForm.value.endDateOfPay)
          : null,
        chequeType: this.searchForm.value.chequeType?.value
          ? this.searchForm.value.chequeType.value
          : null,
        startLatencyDate: this.searchForm.value.startLatencyDate
          ? this.searchForm.value.startLatencyDate
          : null,
        endLatencyDate: this.searchForm.value.endLatencyDate
          ? this.searchForm.value.endLatencyDate
          : null,
      };
      this.https
        .sendPostRequest<ChequeDetailsRes, any>(
          `checks/list/search`,
          { ...body, sortDirection: 'ASC' },
          8080,
          false,
          'v1'
        )
        .subscribe({
          next: (res) => {
            this.products = res.checksSearchResponses;
            this.searchDialog = false;
            const depCre = res.checksSearchResponses.reduce(
              (acc, item) => {
                if (item.chequeType === 'CREDIT') {
                  acc.creditSum += item.chequeAmount;
                } else if (item.chequeType === 'DEBIT') {
                  acc.debitSum += item.chequeAmount;
                }
                return acc;
              },
              { creditSum: 0, debitSum: 0 } // Initial sums
            );
            console.log('depCre', depCre);
            this.totalDebit = depCre.debitSum;
            this.totalCredit = depCre.creditSum;
          },
        });
    }
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

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  confirmUpdateStatus() {
    const dateToPay = this.formatDate(this.dateNow);

    this.https
      .sendPatchRequest(
        `checks/${this.product.id}/pay?latencyDate=${dateToPay}`,
        {},
        8080,
        'v1'
      )
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
        this.AdvanceSearch(false);
      });
    // this.products = this.products.filter((val) => val.id !== this.product.id);
  }

  updateCheque() {
    this.chequeForm.markAllAsTouched();
    if (this.chequeForm.valid) {
      let body = this.chequeForm.value;

      body = {
        ...body,
        dateOfPay: this.normalizeDate(this.chequeForm.value.dateOfPay),
        chequeType: this.chequeForm.value.chequeType?.value,
        isPayed: this.chequeForm.value.isPayed?.value,
      };

      this.https
        .sendPutRequest(`checks/${this.product.id}`, body, 8080, 'v1')
        .subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Cheque Updated',
              life: 3000,
            });
          },
          complete: () => {
            this.UpdateChequeDialog = false;
            this.chequeForm.reset();
            this.AdvanceSearch(false);
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

  // addCategory() {
  //   this.categoryDialog = true;
  // }

  editProduct(product: any) {
    this.product = { ...product };
    console.log('====================================');
    console.log(product);
    console.log('====================================');
    const dateOfPay = new Date(product.dateOfPay);
    this.chequeForm.patchValue({
      chequeAmount: this.product.chequeAmount,
      chequePayTo: this.product.chequePayTo,
      chequeNumber: this.product.chequeNumber,
      dateOfPay,
      isPayed: this.product.isPayed
        ? this.chequeStatusAdd[1]
        : this.chequeStatusAdd[0],
      chequeType:
        this.product.chequeType === 'CREDIT'
          ? this.chequeTypeAdd[0]
          : this.chequeTypeAdd[1],
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
      let body = this.chequeForm.value;
      body = {
        ...body,
        dateOfPay: this.normalizeDate(this.chequeForm.value.dateOfPay),
        chequeType: this.chequeForm.value.chequeType?.value,
        isPayed: this.chequeForm.value.isPayed?.value,
      };

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
          this.AdvanceSearch(false);
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

  onKeydown(event: KeyboardEvent, form: FormGroup) {
    if (event.key === 'Tab' && this.filteredSuppliers.length > 0) {
      const firstSuggestion = this.filteredSuppliers[0];
      form.get('chequePayTo')?.setValue(firstSuggestion);
      event.preventDefault(); // Prevent default tab behavior
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
  chequeType: 'DEBIT' | 'CREDIT';
  isPayed: boolean;
  latencyDate: string; // Same as above
  createdAt: string; // Same as above
  updatedAt: string; // Same as above
  deletedAt: string | null; // Nullable for potential absence
  balance: number;
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
