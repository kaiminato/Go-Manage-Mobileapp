import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Browser } from '@capacitor/browser';
import { tap } from 'rxjs/operators';
import { DataService } from '../services/data.service';
import { mergeMap } from 'rxjs/operators';
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

  ngOnInit() {}

  async logout() {

    returnTo = await this.dataService.BASE_URL;


    const alert = await this.alertController.create({
      header: 'Do you want Logout ?',
      cssClass:'my-custom-class',
      backdropDismiss:false, // alert will not close automaticall if we click outside of alert
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {

          },
        },
        {
          text: 'Yes',
          role: 'confirm',
          handler: async () => {


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
          },
        },
      ],
    });

    await alert.present();


  }

  async login () {

    //await this.dataService.setPreviousUrl('select-a-time');
      this.auth
      .buildAuthorizeUrl()
      .pipe(mergeMap((url) => Browser.open({ url, windowName: '_self' })))
      .subscribe();
  }


  async checkLogin () {

    await this.auth.getUser().subscribe(
      async (user_data: any) =>{

        this.IS_LOGIN = user_data !== undefined ? true : false;

      }
    );
  }

}
