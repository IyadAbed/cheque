import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../http.service';
import { MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { InvoiceService } from '../invoice.service';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [MessageService, DatePipe],
})
export class HomeComponent implements OnInit {
  supplierDialog: boolean = false;
  projectDialog: boolean = false;
  itemDialog: boolean = false;
  invoiceDialog: boolean = false;
  itemDetailsDialog: boolean = false;
  paymentDialog: boolean = false;
  searchDialog: boolean = false;
  deleteProductDialog: boolean = false;
  allSuppliers: Supplier[] = [];
  allItem: Item[] = [];
  allProjects: Project[] = [];
  supplierForm!: FormGroup;
  projectForm!: FormGroup;
  itemForm!: FormGroup;
  invoiceForm!: FormGroup;
  billForm!: FormGroup;
  cols: any[] = [];
  products: InvoiceRes[] = [];
  selectedInvoice: InvoiceRes | null = null;
  invoiceItem: InvoiceItem[] = [];
  invoicePayment: Payment[] = [];
  searchForm!: FormGroup;
  paymentAmount: string = '';
  // allSuppliers: Supplier[] = [];
  // allProjects: Project[] = [];
  taxType: any[] = [];
  allItems: Item[] = [];
  filteredSuppliers: Supplier[];
  filteredProjects: Project[];
  filteredItem: Item[];
  langSelected: 'en' | 'ar' | string = 'ar';
  taxableOpt = [
    { label: 'Taxable', value: true },
    { label: 'Non Taxable', value: false },
  ];

  langSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private https: HttpService,
    private messageService: MessageService,
    private datePipe: DatePipe,
    private translationService: TranslationService,
    private invoiceService: InvoiceService
  ) {
    this.langSubscription = this.translationService
      .getLangSubject()
      .subscribe((lang) => {
        this.langSelected = lang;
      });
    this.getAllItems();
    this.getAllProjects();
    this.getAllSuppliers();
    this.getAllInvoices();

    this.taxType = [
      { label: 'Credit', value: 'CREDIT' },
      { label: 'Debit', value: 'DEBIT' },
    ];

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
    this.billForm = fb.group({
      amount: ['', Validators.required],
      paymentDate: ['', Validators.required],
    });
    this.invoiceForm = fb.group({
      supplierId: ['', Validators.required],
      projectId: ['', Validators.required],
      number: [''],
      invoiceDate: ['', Validators.required],
      amount: ['', Validators.required],
      items: this.fb.array([]),
      taxable: ['', Validators.required],
    });
    this.searchForm = fb.group({
      supplierId: [null],
      projectId: [null],
      number: [null],
      startDate: [null],
      endDate: [null],
      taxable: [null],
      paymentStatus: [null],
    });
  }

  ngOnInit(): void {
    this.items.valueChanges.subscribe(() => {
      this.calculateInvoiceTotal();
    });

    // Listen for changes in the taxable field
    this.invoiceForm.get('taxable')?.valueChanges.subscribe(() => {
      this.calculateInvoiceTotal();
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

  payModal(invoice: InvoiceRes) {
    this.selectedInvoice = invoice;
    this.paymentAmount = (
      invoice.amount - (invoice.paidAmount ?? 0)
    ).toString();
    this.billForm.patchValue({
      amount: this.paymentAmount,
    });
    this.paymentDialog = true;
  }

  payBill() {
    if (this.billForm.valid) {
      this.https
        .sendPostRequest(
          'payments',
          {
            invoiceId: this.selectedInvoice.id,
            amount: this.billForm.value.amount,
            paymentDate: this.normalizeDate(this.billForm.value.paymentDate),
          },
          8080
        )
        .subscribe(() => {
          this.paymentDialog = false;
          this.getAllInvoices();
        });
    } else {
      this.billForm.markAllAsTouched();
    }
  }

  openDetails(invoice: InvoiceRes) {
    this.selectedInvoice = invoice;
    this.https
      .sendGetRequest<any, InvoiceItem[]>(`invoices/items/${invoice.id}`, 8080)
      .subscribe((res) => {
        console.log('res', res);
        this.invoiceItem = res;
        this.itemDetailsDialog = true;
      });
    this.https
      .sendGetRequest<any, Payment[]>(`payments/invoice/${invoice.id}`, 8080)
      .subscribe((res) => {
        console.log('res Payment', res);
        this.invoicePayment = res;
      });
  }

  getAllInvoices() {
    this.https
      .sendPostRequest<InvoiceReq, InvoiceRes[]>('invoices/search', {}, 8080)
      .subscribe((res) => {
        this.products = res;
      });
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  // generateNewItem() {
  //   const FormArr = this.fb.group({
  //     itemId: ['', Validators.required],
  //     itemDescription: [''],
  //     quantity: [],
  //     price: [],
  //     total: [],
  //   });
  //   this.items.push(FormArr);
  // }

  generateNewItem() {
    const itemForm = this.fb.group({
      itemId: ['', Validators.required],
      itemDescription: [''],
      quantity: [0, Validators.required],
      price: [0, Validators.required],
      total: [{ value: 0, disabled: true }], // Read-only field
    });

    // Subscribe to changes in quantity or price and update total
    itemForm.valueChanges.subscribe(() => {
      this.updateItemTotal(itemForm);
    });

    this.items.push(itemForm);
  }

  updateItemTotal(item: FormGroup) {
    const quantity = item.get('quantity')?.value || 0;
    const price = item.get('price')?.value || 0;
    const total = quantity * price;

    item.get('total')?.setValue(total, { emitEvent: false }); // Prevent infinite loop
    this.calculateInvoiceTotal();
  }

  calculateInvoiceTotal() {
    let totalAmount = this.items.controls.reduce((sum, item) => {
      return sum + (item.get('total')?.value || 0);
    }, 0);

    // If taxable, add 5% tax
    const isTaxable = this.invoiceForm.get('taxable')?.value;
    if (isTaxable?.value) {
      console.log(isTaxable);

      totalAmount *= 1.05; // Add 5%
    } else {
      totalAmount = totalAmount;
    }

    this.invoiceForm.get('amount')?.setValue(totalAmount, { emitEvent: false });
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  filterCountry(
    event: AutoCompleteCompleteEvent,
    type: 'supplier' | 'project' | 'item'
  ) {
    let filtered: any[] = [];
    let query = event.query;
    if (type === 'supplier') {
      for (let i = 0; i < (this.allSuppliers as Supplier[]).length; i++) {
        let suppliers = (this.allSuppliers as Supplier[])[i];
        if (suppliers.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
          filtered.push(suppliers.name);
        }
      }

      this.filteredSuppliers = filtered;
    } else if (type === 'project') {
      for (let i = 0; i < (this.allProjects as Project[]).length; i++) {
        let projects = (this.allProjects as Project[])[i];
        if (projects.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
          filtered.push(projects.name);
        }
      }

      this.filteredProjects = filtered;
    } else if (type === 'item') {
      console.log('this.allItems', this.allItem);

      for (let i = 0; i < (this.allItem as Item[]).length; i++) {
        let items = (this.allItem as Item[])[i];
        if (items.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
          filtered.push(items.name);
        }
      }

      this.filteredItem = filtered;
    }
  }

  onKeydown(
    event: KeyboardEvent,
    form: FormGroup,
    type: 'supplier' | 'project' | 'item'
  ) {
    console.log(type);

    if (type === 'supplier') {
      console.log('1', type);
      if (event.key === 'Tab' && this.filteredSuppliers.length > 0) {
        const firstSuggestion = this.filteredSuppliers[0];
        console.log('====================================');
        console.log('firstSuggestion', firstSuggestion);
        console.log('====================================');
        this.invoiceForm.get('supplierId')?.setValue(firstSuggestion);
        event.preventDefault();
      }
    } else if (type === 'project') {
      if (event.key === 'Tab' && this.filteredProjects.length > 0) {
        const firstSuggestion = this.filteredProjects[0];
        form.get('projectId')?.setValue(firstSuggestion);
        event.preventDefault();
      }
    } else if (type === 'item') {
      if (event.key === 'Tab' && this.filteredItem.length > 0) {
        const firstSuggestion = this.filteredItem[0];
        console.log('firstSuggestion', firstSuggestion);

        form.get('itemId')?.setValue(firstSuggestion);
        event.preventDefault();
      }
    }
  }

  addInvoice() {
    if (this.invoiceForm.valid) {
      const itemsData = this.items.controls.map((control, index) => ({
        itemId: this.allItem.find(
          (item) => item.name === control.get('itemId')?.value
        ).id,
        itemDescription: control.get('itemDescription')?.value || null,
        quantity: control.get('quantity')?.value || null,
        price: control.get('price')?.value || null,
        total: control.get('total')?.value,
      }));
      let body = {
        supplierId: this.allSuppliers.find(
          (supp) => supp.name === this.invoiceForm.value.supplierId
        ).id,
        projectId: this.allProjects.find(
          (proj) => proj.name === this.invoiceForm.value.projectId
        ).id,
        number: this.invoiceForm.value.number,
        invoiceDate: this.normalizeDate(this.invoiceForm.value.invoiceDate),
        amount: this.invoiceForm.value.amount,
        items: itemsData,
        taxable: true,
      };

      this.https.sendPostRequest('invoices', body, 8080).subscribe(() => {
        this.invoiceDialog = false;
        this.invoiceForm.reset();
        this.getAllInvoices();
      });
    } else {
      this.invoiceForm.markAllAsTouched();
    }
  }

  deleteInvoice(invoice: InvoiceRes) {
    if (invoice) {
      this.selectedInvoice = invoice;
      this.deleteProductDialog = true;
    }
  }

  confirmDelete() {
    this.https
      .sendDeleteRequest(`invoices/${this.selectedInvoice.id}`, 8080, {}, 'v1')
      .subscribe((res) => {
        this.deleteProductDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Cheque Deleted',
          life: 3000,
        });
        this.selectedInvoice = null;
        this.AdvanceSearch();
      });
    // this.products = this.products.filter((val) => val.id !== this.product.id);
  }

  reload() {
    window.location.reload();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  AdvanceSearch() {
    console.log('Form Search', this.searchForm.value);
    let body = this.searchForm.value;
    // supplierId
    // projectId
    if (!!body?.supplierId) {
      body.supplierId = this.allSuppliers.find(
        (sub) => sub.name == body.supplierId
      )?.id;
    }
    if (!!body?.projectId) {
      body.projectId = this.allProjects.find(
        (sub) => sub.name == body.projectId
      )?.id;
    }
    this.https
      .sendPostRequest<InvoiceReq, InvoiceRes[]>(
        `invoices/search`,
        { ...body },
        8080,
        false,
        'v1'
      )
      .subscribe({
        next: (res) => {
          this.products = res;
          this.searchForm.reset();
          this.searchDialog = false;
        },
      });
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

export interface InvoiceRes {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierTrnNumber: string;
  projectId: string;
  projectName: string;
  number: string;
  invoiceDate: string; // Alternatively, use Date if parsing dates automatically
  amount: number;
  paidAmount: number;
  taxable: boolean;
  status: 'ACTIVE' | 'INACTIVE' | string; // adjust union as needed
  paymentStatus: 'PAID' | 'UNPAID' | string; // adjust union as needed
  createdAt: string; // Alternatively, use Date
  updatedAt: string; // Alternatively, use Date
}
export interface InvoiceReq {
  supplierId?: string;
  projectId?: string;
  number?: string;
  startDate?: string;
  endDate?: string;
  taxable?: boolean;
  paymentStatus?: string;
}

interface ItemRes {
  id: string;
  name: string;
  description: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

interface InvoiceItem {
  item: ItemRes;
  itemDescription: string;
  quantity: number;
  price: number;
  total: number;
}

interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string; // Date string in YYYY-MM-DD format
  status: 'ACTIVE' | string; // Update this union if there are more possible statuses
  createdAt: string | null; // ISO date string
  updatedAt: string | null; // ISO date string
}
