import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Browser } from '@capacitor/browser';
import { tap } from 'rxjs/operators';
import { DataService } from '../services/data.service';
import { AlertController } from '@ionic/angular';
import { ApiDataService } from '../services/api-data.service';
import { ImageService } from '../services/image.service';

let returnTo = ``;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  IS_LOGIN: boolean = false;

  constructor(
    public auth: AuthService,
    public dataService: DataService,
    private alertController: AlertController,
    private apiData: ApiDataService,
    private imageService: ImageService,
  ) {
    this.checkLogin();
  }

  ngOnInit() {
    // Subscribe to auth service to update IS_LOGIN on login/logout
    this.auth.user$.subscribe(user => {
      this.IS_LOGIN = !!user; // Set IS_LOGIN based on whether user data exists
    });
  }

  async logout() {
    returnTo = await this.dataService.BASE_URL;

    const alert = await this.alertController.create({
      header: 'Do you want to Logout?',
      cssClass: 'my-custom-class',
      backdropDismiss: false,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Yes',
          role: 'confirm',
          handler: async () => {
            this.auth.buildLogoutUrl({ returnTo })
              .pipe(
                tap((url) => {
                  this.auth.logout({ localOnly: true });
                  Browser.open({ url, windowName: '_self' });
                })
              )
              .subscribe();
          },
        },
      ],
    });
    await alert.present();
  }

  async login() {
    this.auth.buildAuthorizeUrl().subscribe({
      next: (url) => {
        Browser.open({ url, windowName: '_self' });
      },
      error: (err) => {
        console.error('Error building authorization URL', err);
      }
    });
  }

  async checkLogin() {
    this.auth.getUser().subscribe({
      next: (user_data) => {
        this.IS_LOGIN = !!user_data; // Set IS_LOGIN based on user_data existence
      },
      error: (err) => {
        console.error('Error checking login status', err);
        this.IS_LOGIN = false;
      }
    });
  }
}
