import { Component } from '@angular/core';
import { DataService } from './services/data.service';
import { Platform } from '@ionic/angular';
import { AuthUserService } from './AuthUserService'; // Create a service to handle authentication logic
import { AuthModule } from '@auth0/auth0-angular';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private dataService: DataService,
    private platform: Platform,
    private authUserService: AuthUserService,) {


    this.platform.ready().then(() => {
      if (this.platform.is('android')) {
      } else if (this.platform.is('ios')) {
      } else {
      }
    });

    this.dataService._getOwnerColor();

    this.authUserService.handleAuthentication(); // Trigger authentication handling
  }

  ngOnInit(): void {
    // Import the module into the application, with configuration
    AuthModule.forRoot({
      domain: environment.auth.domain,
      clientId: environment.auth.clientId
    })

    this.authUserService.handleAuthentication(); // Trigger authentication handling
  }
}
