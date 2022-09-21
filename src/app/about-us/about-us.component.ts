import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { ImageService } from '../services/image.service';
import { AuthService } from '@auth0/auth0-angular';
import { mergeMap } from 'rxjs/operators';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import config from 'capacitor.config';

const callbackUri = `${config.appId}://go-manage-testing.eu.auth0.com/capacitor/${config.appId}/about-us`;

@Component({
  selector: 'app-about-us',
  //templateUrl: './about-us.component.html',
  template: `
  <div *ngIf="auth.user$ | async as user">
    <ion-avatar class="avatar">
      <img [src]="user.picture" [alt]="user.name" />
    </ion-avatar>
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
  </div>`,
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
    private apiDataService: ApiDataService
  ) { 

    
    this.getUser()
   }

   async getUser() {

   
    await (await this.apiDataService.getUser()).subscribe(
      (response: any) => {
        console.log('response---', response)
      },
      (error: any) => {
        console.log('error---', error)
      }
    )
    await this.auth.user$.subscribe( data => {
      console.log('cheking---', data)
    })
    //console.log('cheking---', await  this.auth.user$)
   }

  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/']);
  }
}
