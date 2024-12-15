import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Item, Project, Supplier } from './home/home.component';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  allSuppliers = new BehaviorSubject<Supplier[]>([]);
  allProjects = new BehaviorSubject<Project[]>([]);
  allItem = new BehaviorSubject<Item[]>([]);

  constructor() {}
}
