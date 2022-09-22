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
  HEADING: string = "1";
  TOTAL_SERVICE_SELECTED: any = 0;
  TOTAL_PRICE: any = 0;

  STAFF_LIST: any = [
    // {id:1, firstName: 'Jade', lastName: 'amber', image: this.imageService.DEFAULT_PERSON},
    // {id:2, firstName: 'Testing', lastName: 'amber', image:  this.imageService.DEFAULT_PERSON},
    // {id:3, firstName: 'Tester', lastName: 'amber', image:  this.imageService.DEFAULT_PERSON},
  ];

  SERVICE_LIST: any = [];

  CATEGORY_LIST: any = [];
  SELECTED_SERVICES: any = [];

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

    (await this.apiData.getUser()).subscribe(
      (response: any) => {

        console.log('response---', response)
      },
      (error: any) => {
        console.log('error---', error)  
      }
    );
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

          this.SERVICE_LIST = response;
        
          let categorie_ids = [...new Set(response.map(data => data.categoryId))];
          
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

  changeCategoryStatus (service_id: any , status){

    this.CATEGORY_LIST[service_id].is_open = !status ;
    
  }

  changeServiceStatus (service_id: any ){

    let is_already_exist = this.SELECTED_SERVICES.filter(data => data == service_id);

    if (is_already_exist.length > 0) {

      this.SELECTED_SERVICES = this.SELECTED_SERVICES.filter(data => data != service_id);
    } else {
      this.SELECTED_SERVICES.push(service_id);
    }

    this.selectedServicesDetail();

  }

  async selectedServicesDetail (){
    
    let selected_service_details = this.SERVICE_LIST.filter( data => this.SELECTED_SERVICES.includes(data.id))

    this.TOTAL_SERVICE_SELECTED = selected_service_details.length;
    this.TOTAL_PRICE = 0;
    if (selected_service_details.length > 0) {

      for (let service_detail of selected_service_details) {

        this.TOTAL_PRICE += parseFloat(service_detail.servicePrice)
      }
    }

    this.dataService.setSelectedServicesInBooking(selected_service_details);  

  }
  
  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/']);
  }

}
