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
  CANCEL_BOOKING_ID: number = 0;
  STAFF_DETAIL: any = []
  PERFORMED_SERVICES: any = [];
  CATEGORY_LIST: any = [];
  SERVICE_LIST: any = [];
  SELECTED_SERVICES: any = [];

  constructor(
    public router: Router,
    private activateRoute: ActivatedRoute,
    public imageService: ImageService,
    private apiData: ApiDataService,
    public dataService: DataService,
  ) { }

  async ngOnInit() {


  }

  async ionViewWillEnter() {

    this.SELECTED_SERVICES = [];
    // this.TOTAL_SERVICE_SELECTED = 0;
    // this.TOTAL_PRICE = 0;
    this.ID = this.activateRoute.snapshot.paramMap.get('id');
    this.STAFF_DETAIL = await this.dataService.getStaffDetail(this.ID);
    this.PERFORMED_SERVICES = this.STAFF_DETAIL[0].performedServices;

    await this.getServiceList();

    this.activateRoute.queryParams
      .subscribe(params => {

        this.CANCEL_BOOKING_ID = params.hasOwnProperty('id') ? params.id : 0;
        
      }
      );

    this.STAFF_DETAIL[0].image = this.STAFF_DETAIL[0]?.employeeImg ? this.STAFF_DETAIL[0]?.employeeImg : this.imageService.DEFAULT_PERSON;
    this.HEADING = "2";


    //await this.getStaffBookingList();

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
      for (let category_id of categorie_ids) {
        let service_list = this.SERVICE_LIST.filter(service => service.categoryId == category_id);

        for (let service of service_list) {
          if (this.PERFORMED_SERVICES.includes(service.id)) {
            service['performed'] = true;
          }
          else {
            service['performed'] = false;
          }
        }
        if (service_list.length > 0) {
          this.CATEGORY_LIST.push(
            {
              category_id: category_id,
              category_name: service_list[0].categoryName,
              is_open: false,
              count: service_list.length,
              services: service_list
            }
          );
        }

      }

      let booking_data = await this.dataService.getInitialBookingdata();
 

      if (booking_data.servises.length > 0) await this.__preFilledData();

    }
  }

  async __preFilledData() {

    let booking_data = await this.dataService.getInitialBookingdata();

    for (let category of this.CATEGORY_LIST) {


      for (let service of category.services) {

        let checking_data = await booking_data.servises.filter(data => data.id == service.id)

        if (checking_data.length > 0) {
          category.is_open = true;
          service.is_checked = true;
        }
      }
    }

    this.SELECTED_SERVICES = [];

    for (let service of booking_data.servises) {

      this.SELECTED_SERVICES.push(service.id)
    }

    await this.selectedServicesDetail();
  }

  changeCategoryStatus(service_id: any, status) {

    this.CATEGORY_LIST[service_id].is_open = !status;
  }


  changeServiceStatus(service_id: any) {
    let is_already_exist = this.SELECTED_SERVICES.filter(data => data == service_id);
    let flag = false;

    if (is_already_exist.length > 0) {
      this.SELECTED_SERVICES = this.SELECTED_SERVICES.filter(data => data != service_id);
      flag = false;
    } else {
      flag = true;
      this.SELECTED_SERVICES.push(service_id);
    }

    for (let category of this.CATEGORY_LIST) {
      for (let service of category.services) {
        if (service.id == service_id) {
          service.is_checked = flag;
        }
      }
    }

    this.selectedServicesDetail();

  }

  async selectedServicesDetail() {

    let selected_service_details = this.SERVICE_LIST.filter(data => this.SELECTED_SERVICES.includes(data.id))

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
