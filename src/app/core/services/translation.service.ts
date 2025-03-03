import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private langSubject = new Subject<string>();

  constructor(private translate: TranslateService) {
    const lang = this.getLang() ?? 'en';
    this.translate.setDefaultLang(lang);
    this.langSubject.next(lang); // Emit the initial language value
  }

  initializeTranslation(): void {
    const lang = this.getLang() ?? 'en';
    this.translate.setDefaultLang(lang);
    this.translate.use(lang);
    this.langSubject.next(lang); // Emit the initial language value
  }

  setLanguage(language: string): void {
    this.setIntoLocalStorage(language);
    this.translate.use(language);
    // if (language === 'ar') {
    //   document.documentElement.dir = 'rtl';
    // } else {
    //   document.documentElement.dir = 'ltr';
    // }
    this.langSubject.next(language); // Emit the new language value
  }

  getLanguage() {
    return this.translate.currentLang;
  }

  translateKey(key: string): string {
    return this.translate.instant(key);
  }

  setIntoLocalStorage(language: string) {
    localStorage.setItem('language', language);
  }

  getLang() {
    const language =
      localStorage.getItem('language') != null &&
      localStorage.getItem('language') != undefined
        ? localStorage.getItem('language')
        : 'ar';
    return language;
  }

  // Expose the Subject as observable to components
  getLangSubject() {
    return this.langSubject.asObservable();
  }
}
