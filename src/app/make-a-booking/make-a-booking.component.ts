import { Component, OnInit } from '@angular/core';
import { ImageService } from '../services/image.service';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-make-a-booking',
  templateUrl: './make-a-booking.component.html',
  styleUrls: ['./make-a-booking.component.scss'],
})
export class MakeABookingComponent implements OnInit {

  IS_STAFF: any = true;
  HEADING: string = "Step-1 / Make a booking";

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

  CATEGORY_LIST: any = [];

  constructor(
    public imageService: ImageService,
    private router: Router,
    private apiData: ApiDataService,
    private dataService: DataService,
   ) { 
    
    
  }

  ngOnInit() {

    
  }

  async ionViewWillEnter (){
    await this.getStaffList();
  }

  async  getStaffList (){

    await this.apiData.presentLoading();

    await (await this.apiData.getStaffList()).subscribe(
      async (response: any) => {

        await this.apiData.dismiss();

        await this.getServiceList();
        if (response.length > 0){

          this.STAFF_LIST = response
          await this.dataService.setStaffList(response)
        }
        console.log(response);
      },
      async (error: any) => {

        await this.apiData.dismiss();
        alert(JSON.stringify(error));
      }
    );
  }

  async getServiceList() {
    await this.apiData.presentLoading();

    await (await this.apiData.getServiceList()).subscribe(
      async (response: any) => {

        await this.apiData.dismiss();

        if (response.length > 0){

          console.log('services list----', response);

          let categorie_ids = [...new Set(response.map(data => data.categoryId))];
          console.log('categories--------', categorie_ids)

          this.CATEGORY_LIST = [];

          for(let category_id of categorie_ids){

            let service_list = response.filter(service => service.categoryId == category_id);

            if (service_list.length > 0){

              this.CATEGORY_LIST.push(
                                      {
                                        category_id: category_id,
                                        category_name: service_list[0].categoryName,
                                        is_open: false,
                                        count:service_list.length,
                                        services: service_list
                                      }
                                    );
            }
          }

          await this.dataService.setServiceList(response)
          
        }
      },
      async (error: any) => {
        await this.apiData.dismiss();
        alert(error);
      }
    );
  }

  async SelectStaff (staff_id: any) {

    await this.dataService.setInitialBooking(staff_id);
    this.router.navigate(['/staff-service-details',staff_id]);
  }

  changeServiceStatus (service_id: any , status){

    this.CATEGORY_LIST[service_id].is_open = !status ;
    
  }
  
  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/']);
  }

}
