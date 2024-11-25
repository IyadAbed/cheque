import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChequeService {
  private currentBalance: BehaviorSubject<number> = new BehaviorSubject(0);
  currentBalance$ = this.currentBalance.asObservable();
  constructor() {
    this.currentBalance$;
  }
  updateCurrentBalance(val: number) {
    this.currentBalance.next(val);
  }

  getCurrent() {
    return this.currentBalance.value;
  }
}
