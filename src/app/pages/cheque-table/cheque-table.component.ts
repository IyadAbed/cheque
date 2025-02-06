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
  selector: 'app-cheque-table',
  templateUrl: './cheque-table.component.html',
  styleUrl: './cheque-table.component.scss',
  providers: [MessageService, DatePipe],
})
export class ChequeTableComponent implements OnInit {
  cols: any[] = [];

  product: any = {};

  balance: number = 0;

  endingBalance: number = 0;

  currentBalance: number = 0;

  runningBalance: number = 0;

  submitted: boolean = false;

  productDialog: boolean = false;

  chequeDialog: boolean = false;

  searchDialog: boolean = false;

  searchStatus: boolean = false;

  sortDirection: 'ASC' | 'DESC' = 'DESC';

  deleteProductDialog: boolean = false;

  payChequeDialog: boolean = false;

  UpdateChequeDialog: boolean = false;

  deleteProductsDialog: boolean = false;

  dateNow: Date;

  selectedProducts: any[] = [];

  products: ChequeContent[] = [];

  sortOptions: SelectItem[] = [];

  chequeStatus: any[] = [];

  chequeStatusAdd: any[] = [];

  chequeType: any[] = [];

  totalCredit: number = 0;

  totalDebit: number = 0;

  chequeTypeAdd: any[] = [];

  allSuppliers: any[] = [];

  filteredSuppliers: any[] = [];

  sortOrder: number = 0;

  sortField: string = '';

  chequeForm: FormGroup;

  searchForm: FormGroup;

  newUpdate: number;

  updateBalanceDialog: boolean = false;

  openingForm: FormGroup;

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

    this.openingForm = fb.group({
      initialOpining: [0],
    });
  }

  ngOnInit() {
    // this.https.sendPutRequest('checks/edit', {}, 8080, 'v1').subscribe();
    this.getBalance();
    // this.getProducts().then((data) => (this.products = data));

    this.getAllCheque(10, this.sortDirection);
    this.searchForm.valueChanges.subscribe(() => {
      console.log('====================================');
      console.log(this.searchForm.value);
      console.log('====================================');
    });
    this.cols = [
      // { field: 'product', header: 'Cheque' },
      { field: 'chequePayTo', header: 'chequePayTo' },
      { field: 'dateOfPay', header: 'DateOfPay' },
      { field: 'chequeAmount', header: 'ChequeAmount' },
      { field: 'Debit', header: 'Debit' },
      { field: 'Credit', header: 'Credit' },
      { field: 'balance', header: 'Balance' },
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

  getBalance() {
    this.https
      .sendGetRequest('balance/673e634a6a4180145fcb09aa', 8080, 'v1')
      .subscribe((res: any) => {
        this.balance = res.initialBalance as number;
        this.currentBalance = this.balance;
      });
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
  normalizeDateNew(date: any): string {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset()); // Adjust to UTC

    if (!date) return today.toISOString().split('T')[0]; // Return today's date if no date is provided

    const inputDate = new Date(date);
    inputDate.setMinutes(
      inputDate.getMinutes() - inputDate.getTimezoneOffset()
    ); // Adjust to UTC

    // If inputDate is in the past, return today's date
    return inputDate < today
      ? today.toISOString().split('T')[0]
      : inputDate.toISOString().split('T')[0];
  }

  getAllCheque(pageSize: any, sort: any) {
    this.https
      .sendPostRequest(
        `checks/list/search`,
        { sortDirection: 'ASC' },
        8080,
        false,
        'v1'
      )
      .pipe(
        map((res: any) => {
          this.currentBalance = this.balance;
          this.allSuppliers = Array.from(
            new Set(
              res.checksSearchResponses.map(
                (chequeData: ChequeContent) => chequeData.chequePayTo
              )
            )
          );

          res.checksSearchResponses = res.checksSearchResponses
            .map((cheque: ChequeContent) => {
              if (cheque.isPayed) {
                this.currentBalance +=
                  cheque.chequeType === 'DEBIT'
                    ? -cheque.chequeAmount
                    : cheque.chequeAmount;
              }
              if (cheque.chequeType === 'DEBIT') {
                cheque.chequeAmount = -cheque.chequeAmount;
                cheque.Debit = -cheque.chequeAmount;
              } else {
                cheque.Credit = cheque.chequeAmount;
              }
              return cheque;
            })
            .filter((cheque: ChequeContent) => !cheque.isPayed);
          this.runningBalance = this.currentBalance;
          return res;
        })
      )
      .subscribe((res: any) => {
        // console.log(this.runningBalance);

        this.products = res.checksSearchResponses;
        const depCre = res.checksSearchResponses.reduce(
          (acc, item) => {
            if (item.chequeType === 'CREDIT' && !item.isPayed) {
              acc.creditSum += item.chequeAmount;
            } else if (item.chequeType === 'DEBIT' && !item.isPayed) {
              acc.debitSum += item.chequeAmount;
            }
            return acc;
          },
          { creditSum: 0, debitSum: 0 } // Initial sums
        );
        console.log('depCre', depCre);
        this.endingBalance = this.products[this.products.length - 1]?.balance;
        this.totalDebit = depCre.debitSum;
        this.totalCredit = depCre.creditSum;
      });
  }

  reload() {
    window.location.reload();
  }

  updateOpeningBalance() {
    console.log(this.openingForm.value);

    // this.https.sendPutRequest(`balance/${}`, {}, 8080, "v1")
    if (this.openingForm.valid) {
      this.https
        .sendPutRequest(
          'balance/673e634a6a4180145fcb09aa',
          {
            initialBalance: this.openingForm?.value?.initialOpining || 0,
          },
          8080,
          'v1'
        )
        .subscribe({
          complete: () => {
            this.getBalance();
            this.getAllCheque(10, this.sortDirection);
            this.updateBalanceDialog = false;
          },
        });
    }
  }

  AdvanceSearch(reset: boolean) {
    console.log('Form Search', this.searchForm.value);

    if (reset) {
      this.searchStatus = false;
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
        endChequeAmount: this.searchForm.value.startChequeAmount
          ? this.searchForm.value.startChequeAmount
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
            this.searchStatus = true;
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
        this.getAllCheque(10, this.sortDirection);
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
        this.getAllCheque(10, this.sortDirection);
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
            this.getAllCheque(10, this.sortDirection);
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

  onKeydown(event: KeyboardEvent, form: FormGroup) {
    if (event.key === 'Tab' && this.filteredSuppliers.length > 0) {
      const firstSuggestion = this.filteredSuppliers[0];
      form.get('chequePayTo')?.setValue(firstSuggestion);
      event.preventDefault(); // Prevent default tab behavior
    }
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
        dateOfPay: this.normalizeDateNew(this.chequeForm.value.dateOfPay),
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
          this.getAllCheque(10, this.sortDirection);
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

  // exportSelectedCSV() {
  //   if (!this.selectedProducts || this.selectedProducts.length === 0) {
  //     return;
  //   }

  //   const csvRows = [];
  //   const headers = [
  //     'Cheque Pay To',
  //     'Date Of Pay',
  //     'Debit',
  //     'Credit',
  //     'Balance',
  //   ];
  //   csvRows.push(headers.join(',')); // Add CSV headers

  //   this.selectedProducts.forEach((product) => {
  //     const row = [
  //       `"${product.chequePayTo}"`,
  //       `"${product.dateOfPay}"`,
  //       product.chequeType === 'DEBIT' ? `(${product.chequeAmount})` : '-',
  //       product.chequeType === 'CREDIT' ? product.chequeAmount : '-',
  //       product.balance < 0 ? `(${product.balance})` : product.balance,
  //     ];
  //     csvRows.push(row.join(','));
  //   });

  //   const csvData = csvRows.join('\n');
  //   const blob = new Blob([csvData], { type: 'text/csv' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = 'selected_cheques.csv';
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  // }
  exportSelectedCSV() {
    if (!this.selectedProducts || this.selectedProducts.length === 0) {
      return;
    }

    const csvRows = [];
    const headers = [
      'Cheque Pay To',
      'Date Of Pay',
      'Debit',
      'Credit',
      'Balance',
      // 'Cheque Number',
    ];
    csvRows.push(headers.join(',')); // Add CSV headers

    let totalDebit = 0;
    let totalCredit = 0;
    let endingBalance = 0;

    this.selectedProducts.forEach((product) => {
      const debitAmount =
        product.chequeType === 'DEBIT' ? product.chequeAmount : 0;
      const creditAmount =
        product.chequeType === 'CREDIT' ? product.chequeAmount : 0;

      totalDebit += debitAmount;
      totalCredit += creditAmount;
      endingBalance = product.balance; // Assuming last item's balance is the final balance

      const row = [
        `"${product.chequePayTo}"`,
        `"${product.dateOfPay}"`,
        debitAmount ? `(${debitAmount})` : '-',
        creditAmount ? creditAmount : '-',
        product.balance < 0 ? `(${product.balance})` : product.balance,
        // product.chequeNumber || '-',
      ];
      csvRows.push(row.join(','));
    });

    // Add totals row
    csvRows.push(''); // Empty line before total
    csvRows.push(
      `Total,,(${totalDebit}),${totalCredit},${
        endingBalance < 0 ? `(${endingBalance})` : endingBalance
      },`
    );

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selected_cheques.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
  Credit?: number;
  Debit?: number;
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
