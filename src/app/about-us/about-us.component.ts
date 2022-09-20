import { Component, OnInit , NgZone} from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { ImageService } from '../services/image.service';
import { AuthService } from '@auth0/auth0-angular';
import { mergeMap } from 'rxjs/operators';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import config from 'capacitor.config';

//const callbackUri = `${config.appId}://go-manage-testing.eu.auth0.com/capacitor/${config.appId}/about-us`;
const callbackUri = `http://localhost:8100/about-us`;
@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
})
export class AboutUsComponent implements OnInit {

  HEADING: string = "About us";
  STAFF_LIST: any = [
    {id:1, firstName: 'Jade', lastName: 'amber', image: this.imageService.DEFAULT_PERSON},
    {id:2, firstName: 'Testing', lastName: 'amber', image:  this.imageService.DEFAULT_PERSON},
    {id:3, firstName: 'Tester', lastName: 'amber', image:  this.imageService.DEFAULT_PERSON},
  ];
  constructor(
    private router: Router,
    private apiData: ApiDataService,
    public imageService: ImageService,
    public auth: AuthService,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    // Use Capacitor's App plugin to subscribe to the `appUrlOpen` event
    App.addListener('appUrlOpen', ({ url }) => {

      console.log('login checking result=> ', url)
      // Must run inside an NgZone for Angular to pick up the changes
      // https://capacitorjs.com/docs/guides/angular
      this.ngZone.run(() => {
        if (url?.startsWith(callbackUri)) {
          
          alert('working ')
          
          // If the URL is an authentication callback URL..
          if (
            url.includes('state=') &&
            (url.includes('error=') || url.includes('code='))
          ) {
            // Call handleRedirectCallback and close the browser
            alert('error')
            this.auth
              .handleRedirectCallback(url)
              .pipe(mergeMap(() => Browser.close()))
              .subscribe();
          } else {
            
            Browser.close();
          }
        }
      });
    });
  }

  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/']);
  }
}
