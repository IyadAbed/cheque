import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChequeTableComponent } from './cheque-table/cheque-table.component';
import { ChequeSearchComponent } from './cheque-search/cheque-search.component';

const routes: Routes = [
  {
    path: '',
    component: ChequeTableComponent,
    data: { breadcrumb: 'chequeTable' },
  },
  {
    path: 'search',
    component: ChequeSearchComponent,
    data: { breadcrumb: 'chequeSearch' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
