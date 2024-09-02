import { Component } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-cookie-consent',
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.scss']
})
export class CookieConsentComponent {
  accepted: boolean = false;

  constructor(
    public dataService: DataService
  ) {
    this.checkConsent();
  }

  checkConsent() {
    this.accepted = localStorage.getItem('cookieConsent') === 'true';
  }

  accept() {
    localStorage.setItem('cookieConsent', 'true');
    this.accepted = true;
  }

  decline() {
    localStorage.setItem('cookieConsent', 'false');
    this.accepted = true;
  }
}
