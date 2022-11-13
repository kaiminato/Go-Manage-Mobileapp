import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { ImageService } from '../services/image.service';
import { AuthService } from '@auth0/auth0-angular';
import config from 'capacitor.config';

const callbackUri = `http://localhost:8100/about-us`;
@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
})
export class AboutUsComponent {

  HEADING: string = "About us";
  STAFF_LIST: any = [
    { id: 1, firstName: 'Jade', lastName: 'amber', image: this.imageService.DEFAULT_PERSON },
    { id: 2, firstName: 'Testing', lastName: 'amber', image: this.imageService.DEFAULT_PERSON },
    { id: 3, firstName: 'Tester', lastName: 'amber', image: this.imageService.DEFAULT_PERSON },
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

    await this.auth.getUser().subscribe(
      (response: any) => {
        console.log('auth response', response)
      },
      (error: any) => {
        console.log('auth error ', error)
      }
    )

    return

    // await (await this.apiDataService.getUser()).subscribe(
    //   (response: any) => {
    //     console.log('response---', response)
    //   },
    //   (error: any) => {
    //     console.log('error---', error)
    //   }
    // )
    // await this.auth.user$.subscribe( data => {
    //   console.log('cheking---', data)
    // })
    // //console.log('cheking---', await  this.auth.user$)
  }

  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/']);
  }
}
