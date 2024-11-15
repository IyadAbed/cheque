import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChequeTableComponent } from './cheque-table.component';

describe('ChequeTableComponent', () => {
  let component: ChequeTableComponent;
  let fixture: ComponentFixture<ChequeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChequeTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChequeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
