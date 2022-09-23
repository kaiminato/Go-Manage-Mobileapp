import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'app-select-staff-with-service-booking',
  templateUrl: './select-staff-with-service-booking.component.html',
  styleUrls: ['./select-staff-with-service-booking.component.scss'],
})
export class SelectStaffWithServiceBookingComponent implements OnInit {

  HEADING: string = "3";
  STAFF_LIST: any = [];
  BOOKING_LST: any = [];

  constructor(
    private location: Location,
    private dataService: DataService,
    public imageService: ImageService,
  ) { }

  ngOnInit() {}

  async ionViewWillEnter () {

    this.STAFF_LIST = await this.dataService.getStaffList();
    this.BOOKING_LST = await this.dataService.getStaffBookingList();
    let booking_data = await this.dataService.getInitialBookingdata();
    console.log('booking_data----', booking_data)
    console.log('this.STAFF_LIST-----', this.STAFF_LIST, this.BOOKING_LST)
  }

  async SelectStaff (staff_id: any){

    console.log('staff id ', staff_id)
  }

  navigation() {

    this.location.back();
  }

}
