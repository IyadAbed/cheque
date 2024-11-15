import { Component, ElementRef } from '@angular/core';
import { LayoutService } from '../service/layout.service';

@Component({
  selector: 'app-sidbar',
  templateUrl: './sidbar.component.html',
})
export class SidbarComponent {
  constructor(public layoutService: LayoutService, public el: ElementRef) {}
}
