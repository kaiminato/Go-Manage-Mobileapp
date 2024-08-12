import { Component } from '@angular/core';
import { DataService } from './services/data.service';
import { Platform, AlertController } from '@ionic/angular';
import { AuthUserService } from './AuthUserService';
import { AuthModule } from '@auth0/auth0-angular';
import { environment } from '../environments/environment';
import { Router } from '@angular/router'; // Import the Router

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private dataService: DataService,
    private platform: Platform,
    private authUserService: AuthUserService,
    private alertController: AlertController,
    private router: Router // Inject the Router
  ) {
    this.platform.ready().then(() => {
      if (this.platform.is('android')) {
        // Android specific code
      } else if (this.platform.is('ios')) {
        // iOS specific code
      }
    });

    this.dataService._getOwnerColor();
  }

  ngOnInit(): void {
    AuthModule.forRoot({
      domain: environment.auth.domain,
      clientId: environment.auth.clientId
    });

    this.presentConfirmDialog(); // Show dialog on init
  }

  async presentConfirmDialog() {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Do you agree to the terms and conditions?',
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            // Navigate to the login page when clicking Cancel
            this.router.navigate(['']);
          }
        },
        {
          text: 'I Agree',
          handler: () => {
            // Navigate to the home page when clicking I Agree
            this.router.navigate(['/home']);
          }
        }
      ]
    });

    await alert.present();
  }
}
