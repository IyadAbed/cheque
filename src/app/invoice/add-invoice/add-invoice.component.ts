import { Subscription } from 'rxjs';
import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Item, Project, Supplier } from '../home/home.component';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { InvoiceService } from '../invoice.service';
import { HttpService } from '../../http.service';

@Component({
  selector: 'app-add-invoice',
  templateUrl: './add-invoice.component.html',
  styleUrl: './add-invoice.component.scss',
})
export class AddInvoiceComponent {
  allSuppliers: Supplier[] = [];
  allProjects: Project[] = [];
  allItems: Item[] = [];
  filteredSuppliers: Supplier[];
  filteredProjects: Project[];
  filteredItem: Item[];
  selectedState: any = null;
  invoiceForm!: FormGroup;
  dropdownItems = [
    { name: 'Option 1', code: 'Option 1' },
    { name: 'Option 2', code: 'Option 2' },
    { name: 'Option 3', code: 'Option 3' },
  ];
  taxableOpt = [
    { label: 'Taxable', value: true },
    { label: 'Non Taxable', value: false },
  ];

  private itemsSubscription: Subscription;
  private ProjectsSubscription: Subscription;
  private suppliersSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private http: HttpService
  ) {
    this.itemsSubscription = this.invoiceService.allItem.subscribe(() => {
      this.allItems = this.invoiceService.allItem.value;
    });
    this.suppliersSubscription = this.invoiceService.allSuppliers.subscribe(
      () => {
        this.allSuppliers = this.invoiceService.allSuppliers.value;
      }
    );
    this.ProjectsSubscription = this.invoiceService.allProjects.subscribe(
      () => {
        this.allProjects = this.invoiceService.allProjects.value;
      }
    );
    this.invoiceForm = fb.group({
      supplierId: ['', Validators.required],
      projectId: ['', Validators.required],
      number: [''],
      invoiceDate: ['', Validators.required],
      amount: ['', Validators.required],
      items: this.fb.array([]),
      taxable: ['', Validators.required],
    });
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  generateNewItem() {
    const FormArr = this.fb.group({
      itemId: ['', Validators.required],
      itemDescription: [''],
      quantity: [],
      price: [],
      total: [],
    });
    this.items.push(FormArr);
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
      for (let i = 0; i < (this.allItems as Item[]).length; i++) {
        let items = (this.allItems as Item[])[i];
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
    console.log('====================================');
    console.log('valid', this.invoiceForm.valid);
    console.log('====================================');
    console.log('====================================');
    console.log('value', this.invoiceForm.value);
    console.log('====================================');
    if (this.invoiceForm.valid) {
      const itemsData = this.items.controls.map((control, index) => ({
        itemId: this.allItems.find(
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
        invoiceDate: '2024-12-14',
        amount: this.invoiceForm.value.amount,
        items: itemsData,
        taxable: true,
      };

      this.http.sendPostRequest('invoices', body, 8080).subscribe(() => {
        this.invoiceForm.reset();
      });
    } else {
      this.invoiceForm.markAllAsTouched();
    }
  }
}
