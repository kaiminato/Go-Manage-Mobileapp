import { Component, OnInit } from '@angular/core';
import { ApiDataService } from '../services/api-data.service';
import { ImageService } from '../services/image.service';
import { AuthService } from '@auth0/auth0-angular';

import { DataService } from '../services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss'],
})
export class ContactUsComponent implements OnInit {

  HEADING: string = "Contact us";
  OWNER_INFO: any = [];
  HOURS_DETAILS: any = []
  constructor(
    private router: Router,
    public imageService: ImageService,
    public auth: AuthService,
    private apiDataService: ApiDataService,
    public dataService: DataService,) { }

  ngOnInit() {}

  async ionViewWillEnter () {

    this.OWNER_INFO = await this.dataService._getOwnerData()
    
    await this._getHoursDetails();
  }
  
  async _getHoursDetails () {

    await (await this.apiDataService._getBusinessHoursDetails()).subscribe(
      (response: any ) => {
        
        if (response.length > 0) {

          
          this.HOURS_DETAILS = response;
        }
      },
      (error: any) => {
        

      }
    );
  }


  navigation() {

    this.router.navigate(['/about-us']);
  }

}
