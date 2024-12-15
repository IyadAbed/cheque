import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AddInvoiceComponent } from './add-invoice/add-invoice.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { breadcrumb: 'Invoice' },
    children: [
      {
        path: 'Add',
        component: AddInvoiceComponent,
        data: { breadcrumb: 'Invoice-Add' },
      },
    ],
  },
  // {
  //   path: 'search',
  //   component: ChequeSearchComponent,
  //   data: { breadcrumb: 'chequeSearch' },
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceRoutingModule {}
