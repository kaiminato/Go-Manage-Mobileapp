import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { ImageService } from '../services/image.service';
import { AuthService } from '@auth0/auth0-angular';
import config from 'capacitor.config';
import { DataService } from '../services/data.service';

//const callbackUri = `${config.appId}://go-manage-testing.eu.auth0.com/capacitor/${config.appId}/about-us`;
const callbackUri = `http://localhost:8100/about-us`;
@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  // template: `
  // <div *ngIf="auth.user$ | async as user">
  //   <ion-avatar class="avatar">
  //     <img [src]="user.picture" [alt]="user.name" />
  //   </ion-avatar>
  //   <h2>{{ user.name }}</h2>
  //   <p>{{ user.email }}</p>
  // </div>`,
  styleUrls: ['./about-us.component.scss'],
})
export class AboutUsComponent {

  HEADING: string = "About us";
  STAFF_LIST: any = [
    {id:1, firstName: 'Jade', lastName: 'amber', image: this.imageService.DEFAULT_PERSON},
    {id:2, firstName: 'Testing', lastName: 'amber', image:  this.imageService.DEFAULT_PERSON},
    {id:3, firstName: 'Tester', lastName: 'amber', image:  this.imageService.DEFAULT_PERSON},
  ];
  constructor(
    private router: Router,
    public imageService: ImageService,
    public auth: AuthService,
    private apiDataService: ApiDataService,
    public dataService: DataService,
  ) { 

    
    this.getUser()
   }

   async getUser() {

    await this.auth.getUser().subscribe(
      (response: any) => {
        
      },
      (error:any) => {
       
      }
    )

    return
   }

  navigation() {

    this.router.navigate(['/']);
  }
}
