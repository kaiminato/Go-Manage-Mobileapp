import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { DataService } from '../services/data.service';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'app-staff-service-details',
  templateUrl: './staff-service-details.component.html',
  styleUrls: ['./staff-service-details.component.scss'],
})
export class StaffServiceDetailsComponent implements OnInit {

  ID: any = '';
  HEADING: string = "";
  TOTAL_SERVICE_SELECTED: any = 0;
  TOTAL_PRICE: any = 0;
  DESCRIPTION_TEXT: string = 'hello';
  isOpen: boolean = false
  STAFF_DETAIL: any = []

  CATEGORY_LIST: any = [];
  SERVICE_LIST: any = [];
  SELECTED_SERVICES: any = [];

  constructor(
    public router: Router,
    private activateRoute: ActivatedRoute,
    public imageService: ImageService,
    private apiData: ApiDataService,
    private dataService: DataService,
  ) { }

  async ngOnInit() {
    
    console.log('ngOnInit--');
    await this.getServiceList();
  }

  async ionViewWillEnter() {
    
    this.ID = this.activateRoute.snapshot.paramMap.get('id');

    this.STAFF_DETAIL = await this.dataService.getStaffDetail(this.ID);
    this.STAFF_DETAIL[0].image = this.STAFF_DETAIL[0]?.employeeImg ? this.STAFF_DETAIL[0]?.employeeImg : this.imageService.DEFAULT_PERSON;
    //this.STAFF_DETAIL[0].comment = 'Quick bio on the worker of what they like & hobbies and what they are qualified in will be added here';
    this.HEADING = "2"

    await this.getStaffBookingList();

    let booking_data = await this.dataService.getInitialBookingdata();
    if (booking_data.date != '') {

      booking_data.date = '';
      booking_data.timing_id = ''
      await this.dataService.resetDateTimeInitialBookingData(booking_data);
      
    }
  }

  async getServiceList() {

    this.SERVICE_LIST = await this.dataService.getServiceList(); 
    
    if (this.SERVICE_LIST.length > 0) {
      let categorie_ids = [...new Set(this.SERVICE_LIST.map(data => data.categoryId))];
          this.CATEGORY_LIST = [];

          for(let category_id of categorie_ids){
            let service_list = this.SERVICE_LIST.filter(service => service.categoryId == category_id);
            
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
    }
   
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

  async getStaffBookingList (){

    (await this.apiData.getStaffBookingList()).subscribe(
      (response: any) => {
        
        if (response.length >  0) {

          this.dataService.setStaffBookingList(response)
        }
      },
      (error: any) => {
        alert(JSON.stringify(error))
      }
    );
  }

  async selectedServicesDetail (){
    
    let selected_service_details = this.SERVICE_LIST.filter( data => this.SELECTED_SERVICES.includes(data.id))
    
    console.log('this.SERVICE_LIST++==', this.SERVICE_LIST)
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
    this.router.navigate(['/make-a-booking']);
  }

}
