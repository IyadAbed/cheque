import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import { DataView } from 'primeng/dataview';
import { Table } from 'primeng/table';

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

  itemDialog: boolean = false;

  deleteProductDialog: boolean = false;

  deleteProductsDialog: boolean = false;

  selectedProducts: any[] = [];

  products: any[] = [];

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

  constructor(
    private messageService: MessageService,
    private fb: FormBuilder,
    private http: HttpClient
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
    });
  }

  ngOnInit() {
    this.getProducts().then((data) => (this.products = data));

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
    this.sourceCities = [
      { name: 'San Francisco', code: 'SF' },
      { name: 'London', code: 'LDN' },
      { name: 'Paris', code: 'PRS' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Berlin', code: 'BRL' },
      { name: 'Barcelona', code: 'BRC' },
      { name: 'Rome', code: 'RM' },
    ];

    this.targetCities = [];

    this.orderCities = [
      { name: 'San Francisco', code: 'SF' },
      { name: 'London', code: 'LDN' },
      { name: 'Paris', code: 'PRS' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Berlin', code: 'BRL' },
      { name: 'Barcelona', code: 'BRC' },
      { name: 'Rome', code: 'RM' },
    ];

    this.sortOptions = [
      { label: 'Price High to Low', value: '!price' },
      { label: 'Price Low to High', value: 'price' },
    ];
  }

  getProducts() {
    return this.http
      .get<any>('assets/demo/data/products.json')
      .toPromise()
      .then((res) => res.data)
      .then((data) => data);
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

  onFilter(dv: DataView, event: Event) {
    console.log('====================================');
    console.log('sadasfsdfsdf');
    console.log('====================================');
    dv.filter((event.target as HTMLInputElement).value);
  }

  openNew() {
    this.product = {};
    this.submitted = false;
    this.productDialog = true;
  }

  deleteSelectedProducts() {
    this.deleteProductsDialog = true;
  }

  addCategory() {
    this.categoryDialog = true;
  }

  editProduct(product: any) {
    this.product = { ...product };
    this.productDialog = true;
  }

  deleteProduct(product: any) {
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
    this.deleteProductDialog = false;
    this.products = this.products.filter((val) => val.id !== this.product.id);
    this.messageService.add({
      severity: 'success',
      summary: 'Successful',
      detail: 'Product Deleted',
      life: 3000,
    });
    this.product = {};
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
