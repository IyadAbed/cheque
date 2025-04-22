import { Component } from '@angular/core';
import { LayoutService } from '../service/layout.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  standalone: false,
})
export class FooterComponent {
  constructor(public layoutService: LayoutService) {}
}
