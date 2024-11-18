import { Component, ElementRef, ViewChild } from '@angular/core';
import { LayoutService } from '../service/layout.service';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
})
export class TopbarComponent {
  items!: MenuItem[];

  logOut() {
    localStorage.removeItem('user');
    this.router.navigate(['/auth']);
  }

  @ViewChild('menubutton') menuButton!: ElementRef;

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

  @ViewChild('topbarmenu') menu!: ElementRef;

  constructor(public layoutService: LayoutService, private router: Router) {}
}
