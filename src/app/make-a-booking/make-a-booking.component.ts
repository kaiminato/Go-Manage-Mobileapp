import { Component, OnInit } from '@angular/core';
import { ImageService } from '../services/image.service';
import { ActivatedRoute, Router } from '@angular/router';
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
  CANCEL_BOOKING_ID: number = 0;

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
    public dataService: DataService,
    private activateRoute: ActivatedRoute
   ) { }

  test (){
    this.IS_STAFF != this.IS_STAFF
  }
  ngOnInit() {

    
  }

  async ionViewWillEnter (){

    this.STAFF_LIST = [];
    this.SERVICE_LIST = [];

    this.activateRoute.queryParams
      .subscribe(params => {

        this.CANCEL_BOOKING_ID = params.hasOwnProperty('id') ? params.id : 0;
        
      }
    );

    this.SELECTED_SERVICES = []
    this.TOTAL_SERVICE_SELECTED = 0;
    this.TOTAL_PRICE = 0;
    this.STAFF_LIST = [];
    this.SERVICE_LIST = [];
    this.CATEGORY_LIST = [];
    this.IS_STAFF = true;

    await this.getStaffList();
    await this._getStaffBookingList();
  }

  async  getStaffList (){

    await this.apiData.presentLoading();

    await (await this.apiData.getStaffList()).subscribe(
      async (response: any) => {

        await this.apiData.dismiss();

        await this.getServiceList();
        if (response.length > 0){

          this.STAFF_LIST = response;
          await this.dataService.setStaffList(response)
        }
       
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

          for (let service of response)  service.is_checked = false; // Add by default not selected;
          
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

          await this.dataService.setServiceList(response);

          await this.setPreFilledData();
        }
      },
      async (error: any) => {

        await this.apiData.dismiss();
        alert(error);
      }
    );

    
  }

  async setPreFilledData () {

    
    let get_pre_filled_data = await this.dataService.getInitialBookingdata();

    if (get_pre_filled_data != '') {

      this.IS_STAFF = get_pre_filled_data.booking_type == this.dataService.BOOKING_WITH_STAFF ? true : false;
      
      if (get_pre_filled_data.booking_type == this.dataService.BOOKING_WITH_SERVICE) {
        for (let service of get_pre_filled_data.servises) {

          this.SELECTED_SERVICES.push(service.id)

          for (let category of this.CATEGORY_LIST) {

            if (category.category_id == service.categoryId) {
              
              category.is_open = true;
              
              for(let categorie_service of category.services)  {
               
                if (categorie_service.id == service.id) {
                 
                  categorie_service.is_checked =  true ;
                }
                
              } 
              
            }
          }

          
        }

        await this.selectedServicesDetail()

        
      } else {
        this.SELECTED_SERVICES = []
        this.TOTAL_SERVICE_SELECTED = 0;
        this.TOTAL_PRICE = 0
      }
    }
  }


  async _getStaffBookingList (){

    (await this.apiData.getStaffBookingList()).subscribe(
      (response: any) => {
        
        
        this.dataService.setStaffBookingList(response)
       
      },
      (error: any) => {
        alert(JSON.stringify(error))
      }
    );
  }

  async SelectStaff (staff_id: any) {


    let initial_data = {... await this.dataService.BOOKING_INITIAL_DATA };
    initial_data.staff_id = staff_id;
    initial_data.booking_type = await this.dataService.BOOKING_WITH_STAFF;

    await this.dataService.setInitialBooking(initial_data);
    this.router.navigate(['/staff-service-details',staff_id ] ,{ queryParams: this.CANCEL_BOOKING_ID == 0? {} :{ id: this.CANCEL_BOOKING_ID } });
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
    
    let selected_service_details = await this.SERVICE_LIST.filter( data => this.SELECTED_SERVICES.includes(data.id))
    
    this.TOTAL_SERVICE_SELECTED = selected_service_details.length;
    this.TOTAL_PRICE = 0;
    if (selected_service_details.length > 0) {

      for (let service_detail of selected_service_details) {

        this.TOTAL_PRICE += parseFloat(service_detail.servicePrice)
      }
    }

    this.dataService.setSelectedServicesInBooking(selected_service_details);  
  }

  async setServicesInBooking () {
    
    let selected_service = this.SERVICE_LIST.filter( data => this.SELECTED_SERVICES.includes(data.id))

    let initial_data = {... await this.dataService.BOOKING_INITIAL_DATA };
    initial_data.servises = selected_service;

    initial_data.booking_type = await this.dataService.BOOKING_WITH_SERVICE;

    await this.dataService.setInitialBooking(initial_data);
    this.router.navigate(['/select-time-with-service-booking'] ,{ queryParams: this.CANCEL_BOOKING_ID == 0? {} :{ id: this.CANCEL_BOOKING_ID } })
  }
  
  navigation() {

    this.router.navigate(['/']);
  }

}
