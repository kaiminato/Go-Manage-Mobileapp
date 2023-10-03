import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Browser } from '@capacitor/browser';
import { tap } from 'rxjs/operators';
import config from 'capacitor.config';
import { Router } from '@angular/router';

const returnTo = `http://localhost:8100`;

@Component({
  selector: 'app-logout-button-component',
  templateUrl: './logout-button-component.component.html',
  styleUrls: ['./logout-button-component.component.scss'],
})
export class LogoutButtonComponentComponent implements OnInit {

  HEADING: string = "Logout";

  constructor(
    public auth: AuthService,
    private router: Router,
    ) {}

  ngOnInit() {}

  logout() {
    // Use the SDK to build the logout URL
    this.auth
      .buildLogoutUrl({ returnTo })
      .pipe(
        tap((url) => {
          // Call the logout fuction, but only log out locally
          this.auth.logout({ localOnly: true });
          // Redirect to Auth0 using the Browser plugin, to clear the user's session
          Browser.open({ url , windowName: '_self' });
        })
      )
      .subscribe();
  }

  navigation() {

    this.router.navigate(['/']);
  }

}
