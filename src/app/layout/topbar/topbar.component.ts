import { Component, ElementRef, ViewChild } from '@angular/core';
import { LayoutService } from '../service/layout.service';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
})
export class TopbarComponent {
  items!: MenuItem[];
  selectedLanguage: 'en' | 'ar' = 'en';

  logOut() {
    localStorage.removeItem('user');
    this.router.navigate(['/auth']);
  }

  @ViewChild('menubutton') menuButton!: ElementRef;

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

  @ViewChild('topbarmenu') menu!: ElementRef;

  constructor(
    public layoutService: LayoutService,
    private router: Router,
    private translation: TranslationService
  ) {}

  setLanguage() {
    const lang = this.selectedLanguage === 'en' ? 'ar' : 'en';
    localStorage.setItem('selectedLanguage', lang);
    this.selectedLanguage = lang;

    this.translation.setLanguage(lang);
    // window.location.reload();
  }
}
