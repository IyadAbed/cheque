import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../http.service';
import { MenuItem, MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { InvoiceService } from '../invoice.service';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import {
  CancelEditableRow,
  EditableColumn,
  EditableRow,
  InitEditableRow,
  SaveEditableRow,
  Table,
} from 'primeng/table';
import { Observable, Subscription } from 'rxjs';
import { TranslationService } from '../../core/services/translation.service';
import { Toastr } from '../../core/services/toastrService';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [
    MessageService,
    DatePipe,
    EditableRow,
    InitEditableRow,
    SaveEditableRow,
    EditableColumn,
    CancelEditableRow,
  ],
  standalone: false,
})
export class HomeComponent implements OnInit {
  supplierDialog: boolean = false;
  EditSupplierDialog: boolean = false;
  isSubmitInvoice: boolean = false;
  projectDialog: boolean = false;
  itemDialog: boolean = false;
  invoiceDialog: boolean = false;
  itemDetailsDialog: boolean = false;
  paymentDialog: boolean = false;
  searchDialog: boolean = false;
  deleteProductDialog: boolean = false;
  deleteSupplierDialog: boolean = false;
  itemUpdateDialog: boolean = false;
  supplierUpdateDialog: boolean = false;
  projectUpdateDialog: boolean = false;
  updateInvoice: boolean = false;
  supplierItems: MenuItem[];
  clonedProducts: { [s: string]: Payment } = {};

  uploadedFiles: any[] = [];
  uploadedFilesToInvoice: any[] = [];


  selectedFiles: File[] = [];

  isSearch: boolean = false;

  selectedSupplier: any;

  pageSize = 10;
  currentPage = 1;
  totalRecords = 0;

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

  totalAmount: number = 0;
  totalPaidAmount: number = 0;
  totalRemaining: number = 0;

  langSubscription: Subscription;
  baseUrl: string = 'http://http://185.211.6.191:8080/api/v1/media/';

  // Bashar//

  allProjectsToUpdate: Project[] = [];
  allItemsToUpdate: Item[] = [];

  constructor(
    private fb: FormBuilder,
    private https: HttpService,
    private messageService: MessageService,
    private translationService: TranslationService,
    private invoiceService: InvoiceService,
    private Toastr: Toastr
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
      number: [null],
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
      itemIds: [null],
    });
    this.supplierItems = [
      {
        label: this.langSelected == 'en' ? 'Delete' : 'حذف',
        command: () => {
          this.EditSupplierDialog = true;
        },
      },
      {
        label: this.langSelected == 'en' ? 'Update' : 'تعديل',
        command: () => {
          let suppSelected = this.allSuppliers.find(
            (sup) => sup.id === this.selectedSupplier
          );
          if (suppSelected) {
            this.supplierForm.patchValue({
              name: suppSelected?.name,
              trnNumber: suppSelected?.trnNumber ?? '',
            });
            this.EditSupplierDialog = true;
          }
        },
      },
    ];
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

  supplierModal() {
    this.supplierForm.reset();
    this.supplierDialog = true;
  }

  onRowEditInit(product: Payment) {
    this.clonedProducts[product.id as string] = { ...product };
  }

  onRowEditSave(product: Payment) {
    console.log(product);

    this.https
      .sendPutRequest(
        `payments/${product.id}`,
        {
          amount: product.amount,
          paymentDate: product.paymentDate,
          number: product.number,
        },
        8080
      )
      .subscribe(
        (response) => {
          console.log('Update successful', response);
          this.getAllInvoices();
        },
        (error) => {
          console.error('Error updating payment:', error);
        }
      );
  }

  onRowEditCancel(product: Payment, index: number) {
    this.invoicePayment[index] = this.clonedProducts[product.id as string];
    delete this.clonedProducts[product.id as string];
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

  addNewProjectOnName(projectName: string) {
    this.projectForm.markAllAsTouched();
    if (projectName) {
      this.projectDialog = false;
      let body = { name: projectName };
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
            number: this.billForm.value.number ?? null,
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

  getBySupplier() {
    console.log('selectedSupplier', this.selectedSupplier);
    if (this.selectedSupplier) {
      this.getAllInvoices(this.selectedSupplier);
    }
  }

  confirmDeleteSupplier() {
    if (this.selectedSupplier) {
      this.removeSupplier(this.selectedSupplier);
      this.deleteSupplierDialog = false;
      this.selectedSupplier = null;
      this.getAllSuppliers();
    }
  }

  addNewInvoice() {
    this.invoiceDialog = true;
    this.selectedInvoice = null;
    this.updateInvoice = false;
    this.items.clear();
    this.invoiceForm.reset();
  }

  openDetails(invoice: InvoiceRes) {
    this.selectedInvoice = invoice;
    this.getInvoicesItems(invoice).subscribe((res) => {
      this.invoiceItem = res;
      this.itemDetailsDialog = true;
    });
    this.getAllPayments(invoice);
  }

  getInvoicesItems(invoice: InvoiceRes): Observable<InvoiceItem[]> {
    return this.https.sendGetRequest<any, InvoiceItem[]>(
      `invoices/items/${invoice.id}`,
      8080
    );
  }

  getAllPayments(invoice: InvoiceRes) {
    this.https
      .sendGetRequest<any, Payment[]>(`payments/invoice/${invoice.id}`, 8080)
      .subscribe((res) => {
        this.invoicePayment = res;
      });
  }

  getAllInvoices(supplierId?: string) {
    this.isSearch = false;
    this.https
      .sendPostRequest<InvoiceReq, InvoiceRes[]>(
        'invoices/search',
        { supplierId: supplierId ?? null },
        8080
      )
      .subscribe((res) => {
        this.products = res
          .filter((invoice) => invoice.amount !== invoice.paidAmount) // Exclude paid invoices
          .sort(
            (a, b) =>
              new Date(b.invoiceDate).getTime() -
              new Date(a.invoiceDate).getTime()
          );
        this.totalAmount = this.products.reduce(
          (sum, item) => sum + item.amount,
          0
        );
        this.totalPaidAmount = this.products.reduce(
          (sum, item) => sum + (item.paidAmount || 0),
          0
        );
        this.totalRemaining = this.totalAmount - this.totalPaidAmount;
      });
  }

  updatePayment(event: any) {
    const editedRow = event.data; // Get updated row data
    const field = event.field; // Get the edited column (amount or paymentDate)
    const newValue = editedRow[field]; // Get new value
    console.log('====================================');
    console.log('event event', event);
    console.log('====================================');
    // Prepare API request body
    const updatedPayment = {
      amount: editedRow.amount,
      paymentDate: editedRow.paymentDate,
    };

    // Send PUT request to update the backend
  }

  updateSupplier() {
    this.supplierForm.markAllAsTouched();
    if (this.supplierForm.valid) {
      this.EditSupplierDialog = false;
      let body = this.supplierForm.value;
      this.https
        .sendPutRequest('suppliers/' + this.selectedSupplier, body, 8080)
        .subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Supplier Added',
              life: 3000,
            });
          },
          complete: () => {
            this.supplierForm.reset();
            this.getAllSuppliers();
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
      quantity: [null, Validators.required],
      price: [null, Validators.required],
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

  removeSupplier(supplierId: string) {
    this.https.sendDeleteRequest(`suppliers/${supplierId}`, 8080).subscribe();
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
        if (suppliers.name?.toLowerCase().indexOf(query?.toLowerCase()) == 0) {
          filtered.push(suppliers.name);
        }
      }

      this.filteredSuppliers = filtered;
    } else if (type === 'project') {
      for (let i = 0; i < (this.allProjects as Project[]).length; i++) {
        let projects = (this.allProjects as Project[])[i];
        if (projects.name?.toLowerCase().indexOf(query?.toLowerCase()) == 0) {
          filtered.push(projects.name);
        }
      }

      this.filteredProjects = filtered;
    } else if (type === 'item') {
      console.log('this.allItems', this.allItem);

      for (let i = 0; i < (this.allItem as Item[]).length; i++) {
        let items = (this.allItem as Item[])[i];
        if (items.name?.toLowerCase().indexOf(query?.toLowerCase()) == 0) {
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

  editProduct(product: InvoiceRes) {
    this.selectedInvoice = { ...product };
    this.updateInvoice = true;
    const invoiceDate = new Date(product.invoiceDate);
    const taxable = this.taxableOpt.find(
      (tax) => tax.value === product.taxable
    );
    const supplierId = this.allSuppliers.find(
      (supp) => supp.id === product.supplierId
    ).name;
    const projectId = this.allProjects.find(
      (proj) => proj.id === product.projectId
    ).name;

    this.invoiceForm.patchValue({
      supplierId,
      projectId,
      number: this.selectedInvoice.number,
      invoiceDate,
      taxable,
    });

    this.items.clear();
    this.getInvoicesItems(product).subscribe((res) => {
      res.forEach((item) => {
        const itemForm = this.fb.group({
          itemId: item.item.name,
          itemDescription: item.itemDescription,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        });

        itemForm.valueChanges.subscribe(() => {
          this.updateItemTotal(itemForm);
        });

        this.items.push(itemForm);
      });
    });

    this.invoiceDialog = true;
    // this.UpdateChequeDialog = true;
  }

  addInvoice() {
    if (this.invoiceForm.valid) {
      this.isSubmitInvoice = true;
      let selectedProject = this.allProjects.find(
        (proj) => proj.name === this.invoiceForm.value.projectId
      )?.id;
      if (!selectedProject) {
        this.addNewProjectOnName(this.invoiceForm.value.projectId);
      }
      setTimeout(() => {
        selectedProject = this.allProjects.find(
          (proj) => proj.name === this.invoiceForm.value.projectId
        ).id;
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
          projectId: selectedProject,
          number: this.invoiceForm.value.number,
          invoiceDate: this.normalizeDate(this.invoiceForm.value.invoiceDate),
          amount: this.invoiceForm.value.amount,
          items: itemsData,
          taxable: true,
          fileName: this.uploadedFilesToInvoice.length > 0 ? this.uploadedFilesToInvoice.map(imageId=>(imageId.fileName)) : null,
        };

        if (this.updateInvoice) {
          this.https
            .sendPutRequest(
              'invoices/' + this.selectedInvoice?.id,
              body,
              8080,
              'v1'
            )
            .subscribe(() => {
              this.invoiceDialog = false;
              this.updateInvoice = false;
              this.selectedInvoice = null;
              this.items.clear();
              this.invoiceForm.reset();
              this.getAllInvoices();
            });
        } else {
          this.https.sendPostRequest('invoices', body, 8080).subscribe(() => {
            this.invoiceDialog = false;
            this.items.clear();
            this.invoiceForm.reset();
            this.getAllInvoices();
          });
        }
        this.isSubmitInvoice = false;
      }, 1500);
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

  deletePayment(payment: Payment) {
    this.https
      .sendDeleteRequest(`payments/${payment.id}`, 8080)
      .subscribe(() => {
        let indexToDelete = this.invoicePayment.findIndex(
          (payments) => payments.id == payment.id
        );
        if (indexToDelete != -1) {
          this.invoicePayment.splice(indexToDelete, 1);
        }
      });
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

  getSupplierById(id: string) {
    const supplier = this.allSuppliers.find((sub) => sub.id == id);
    return supplier.name ?? '';
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  AdvanceSearch() {
    this.isSearch = true;
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
          this.products = res.sort(
            (a, b) =>
              new Date(b.invoiceDate).getTime() -
              new Date(a.invoiceDate).getTime()
          );
          this.totalAmount = this.products.reduce(
            (sum, item) => sum + item.amount,
            0
          );
          this.totalPaidAmount = this.products.reduce(
            (sum, item) => sum + (item.paidAmount || 0),
            0
          );
          this.totalRemaining = this.totalAmount - this.totalPaidAmount;
          this.searchForm.reset();
          this.searchDialog = false;
        },
      });
  }

  // get projects and delete and update its work   bashar

  openProjectDialog() {
    this.projectUpdateDialog = true;
    this.getProjects();
  }

  getProjects() {
    this.https
      .sendGetRequest<any, Project[]>(`projects`, 8080)
      .subscribe((res) => {
        console.log('res', res);
        this.allProjectsToUpdate = res;
        // this.allProjects = res;
      });
  }

  deleteProject(project: Project) {
    this.https
      .sendDeleteRequest(`projects/${project.id}`, 8080)
      .subscribe(() => {
        this.Toastr.showSuccess(
          this.langSelected == 'en' ? 'Project Deleted' : 'تم حذف المشروع'
        );
        this.getProjects();
      });
  }

  editProject(project: Project) {
    console.log('project', project);
    const data = {
      name: project.name,
    };
    this.https
      .sendPutRequest(`projects/${project.id}`, data, 8080)
      .subscribe(() => {
        console.log('Project updated successfully');
        this.Toastr.showSuccess(
          this.langSelected == 'en' ? 'Project Updated' : 'تم تعديل المشروع'
        );
        this.getProjects();
      });
  }

  // get Item and delete and update item bashar

  openUpdateDailogitem() {
    this.itemUpdateDialog = true;
    this.getItems();
  }

  getItems() {
    this.https.sendGetRequest<any, Item[]>(`items`, 8080).subscribe((res) => {
      console.log('res', res);
      this.allItemsToUpdate = res;
    });
  }

  deleteItem(item: Item) {
    this.https.sendDeleteRequest(`items/${item.id}`, 8080).subscribe(() => {
      this.Toastr.showSuccess(
        this.langSelected == 'en' ? 'Item Deleted' : 'تم حذف العنصر'
      );
      this.getItems();
    });
  }

  updateItem(item: Item) {
    console.log('item', item);

    const data = {
      name: item.name,
      description: item.description,
    };
    this.https.sendPutRequest(`items/${item.id}`, data, 8080).subscribe(() => {
      console.log('Item updated successfully');
      this.Toastr.showSuccess(
        this.langSelected == 'en' ? 'Item Updated' : 'تم تعديل العنصر'
      );
    });
  }

  // edit and delete supplier bashar
  deleteSupplier(supplier: Supplier) {
    this.https
      .sendDeleteRequest(`suppliers/${supplier.id}`, 8080)
      .subscribe(() => {
        this.Toastr.showSuccess(
          this.langSelected == 'en' ? 'Supplier Deleted' : 'تم حذف المورد'
        );
        this.getAllSuppliers();
      });
  }

  updateSupplierDetails(supplier: Supplier) {
    console.log('supplier', supplier);

    const body = {
      name: supplier.name,
      trnNumber: supplier.trnNumber,
    };

    this.https
      .sendPutRequest(`suppliers/${supplier.id}`, body, 8080)
      .subscribe(() => {
        console.log('Supplier updated successfully');
        this.Toastr.showSuccess(
          this.langSelected == 'en' ? 'Supplier Updated' : 'تم تعديل المورد'
        );
        this.getAllSuppliers();
      });
  }

  uploadFiles(): void {
    this.selectedFiles.forEach((file) => {
      const formData = new FormData();
      formData.append('file', file);
  
      this.https.uploadImage(formData, 8080).subscribe({
        next: (res: any) => {
          console.log('File uploaded successfully:', res);
        },
        error: (err) => {
          console.error('Error uploading file:', err);
        },
      });
    });
  }

  onUpload(event: any): void {
    console.log('event', event);
    const uploadedFiles = event.files; // Files uploaded by the user
    uploadedFiles.forEach((file: File) => {
      const formData = new FormData();
      formData.append('file', file);
  
      this.https.uploadImage(formData, 8080).subscribe({
        next: (res: any) => {
          console.log('File uploaded successfully:', res);

          this.uploadedFiles.push(file); 
          this.uploadedFilesToInvoice.push(res)// Store the uploaded file with its ID
          console.log('Uploaded files:', this.uploadedFilesToInvoice);
        },
        error: (err) => {
          console.error('Error uploading file:', err);
        },
      });
    });
    // this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: ''});
  }

  onUploadInvoice(event: any, id:string): void {
    console.log('event', event);
    const uploadedFiles = event.files; // Files uploaded by the user
    uploadedFiles.forEach((file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      this.https.uploadImage(formData, 8080).subscribe({
        next: (res: any) => {
          console.log('File uploaded successfully:', res);
          this.uploadedFiles.push(file);
          this.uploadedFilesToInvoice.push(res)// Store the uploaded file with its ID
          console.log('Uploaded files:', this.uploadedFilesToInvoice);
        },
        error: (err) => {
          console.error('Error uploading file:', err);
        },
      });
    });
    this.https.sendPutRequest(`invoices/${id}`, { fileName: this.uploadedFilesToInvoice }, 8080).subscribe({
      next: (res) => {
        console.log('File uploaded successfully:', res);
      }
    });
  }

  onClear(): void {
     // Clear the uploaded files array
    console.log('Files cleared:', this.uploadedFilesToInvoice);
    this.uploadedFilesToInvoice.forEach((file: any) => {
      this.https.sendDeleteRequest(`media/${file?.fileName}`, 8080).subscribe({
        next: (res) => {
          console.log('File deleted successfully:', res);
        },
        error: (err) => {
          console.error('Error deleting file:', err);
        },
      });
    });
    this.uploadedFiles = []; // Clear the uploaded files array
    this.uploadedFilesToInvoice = [];
  }

  download(fileName: string[]){
    fileName.forEach((file) => {
      this.https.downloadexcel(file, 'v1',8080).subscribe((res) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file; // Set the desired file name
        a.click();
        window.URL.revokeObjectURL(url); // Clean up the URL object
      });
    });
  }

}


export interface Supplier {
  id: string;
  name: string;
  trnNumber: string;
  description: string;
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
  fileName: string[];
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
  fileName?: string[];
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
  number: number;
  paymentDate: string; // Date string in YYYY-MM-DD format
  status: 'ACTIVE' | string; // Update this union if there are more possible statuses
  createdAt: string | null; // ISO date string
  updatedAt: string | null; // ISO date string
}
