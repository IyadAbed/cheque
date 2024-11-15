import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChequeTableComponent } from './cheque-table/cheque-table.component';

const routes: Routes = [
  {
    path: '',
    component: ChequeTableComponent,
    data: { breadcrumb: 'chequeTable' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
