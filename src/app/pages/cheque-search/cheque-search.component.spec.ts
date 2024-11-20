import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChequeSearchComponent } from './cheque-search.component';

describe('ChequeSearchComponent', () => {
  let component: ChequeSearchComponent;
  let fixture: ComponentFixture<ChequeSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChequeSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChequeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
