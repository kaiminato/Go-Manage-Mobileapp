import { Component, OnInit } from '@angular/core';
import { ImageService } from '../services/image.service';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';

@Component({
  selector: 'app-make-a-booking',
  templateUrl: './make-a-booking.component.html',
  styleUrls: ['./make-a-booking.component.scss'],
})
export class MakeABookingComponent implements OnInit {

  IS_STAFF: any = true;
  HEADING: string = "Make a booking";

  STAFF_LIST: any = [
    // {id:1, firstName: 'Jade', lastName: 'amber', image: this.imageService.DEFAULT_PERSON},
    // {id:2, firstName: 'Testing', lastName: 'amber', image:  this.imageService.DEFAULT_PERSON},
    // {id:3, firstName: 'Tester', lastName: 'amber', image:  this.imageService.DEFAULT_PERSON},
  ];

  SERVICE_LIST: any = [
    {id:1, name: 'Hair Service', image: this.imageService.DEFAULT_PERSON},
    {id:2, name: 'Nail Service', image:  this.imageService.DEFAULT_PERSON},
    {id:3, name: 'Waxing Service', image:  this.imageService.DEFAULT_PERSON},
  ];

  constructor(
    public imageService: ImageService,
    private router: Router,
    private apiData: ApiDataService,
   ) { 
    
    this.getStaffList()
  }

  ngOnInit() {

    
  }

  async  getStaffList (){

    await this.apiData.presentLoading();

    await (await this.apiData.getStaffList()).subscribe(
      async (response: any) => {

        await this.apiData.dismiss();

        if (response.length > 0){

          this.STAFF_LIST = response
        }
        console.log(response);
      },
      async (error: any) => {
        await this.apiData.dismiss();
        alert(error);
      }
    );
  }

  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/']);
  }

}
