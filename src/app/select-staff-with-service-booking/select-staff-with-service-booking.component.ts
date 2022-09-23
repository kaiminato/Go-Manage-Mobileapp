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
  BOOKING_LIST: any = [];
  AVAILABLE_STAFF: any = [];
  ALL_SHIFT: any = [];

  constructor(
    private location: Location,
    private dataService: DataService,
    public imageService: ImageService,
  ) { }

  ngOnInit() {}

  async ionViewWillEnter () {

    this.STAFF_LIST = await this.dataService.getStaffList();
    this.BOOKING_LIST = await this.dataService.getStaffBookingList();
    this.ALL_SHIFT = await this.dataService.getStaticShift();
    console.log('this.STAFF_LIST-----', this.STAFF_LIST, this.ALL_SHIFT)
    await this.filterStaffList();
  }

  async filterStaffList () {

    let booking_data = await this.dataService.getInitialBookingdata();
    console.log('booking_data----', booking_data)

    for (let staff of this.STAFF_LIST) {

      console.log(booking_data.date , staff.id)
      let is_date_of = await this.dataService.isStaffDateOff(booking_data.date , staff.id)
      
      if (is_date_of) continue; // If Staff have selected date as off day
        
      let staff_date_booked_data = this.BOOKING_LIST.filter ( data => data.employeeId == staff.id && data.startTime.includes(booking_data.date))
      console.log('staff_date_booked_data-----', staff_date_booked_data)

      if (staff_date_booked_data.length == 0) { // If staff don't have any booking on selected date

        this.AVAILABLE_STAFF.push(staff);
        continue;
      }

      let all_shift_booked = true;
      let shift_list = [ ...this.ALL_SHIFT ]
      for (let shift of shift_list){

        let check_date = new Date(booking_data.date+'T'+shift.value);

        for (let booking_detail of staff_date_booked_data) {

          let from_date = new Date(booking_detail.startTime);
          let to_date = new Date(booking_detail.endTime);

          if (check_date >= from_date && check_date <= to_date){  
          } else {

            all_shift_booked = false;
          }
        }

        if (all_shift_booked) continue; // If Staff don't have any free time shift



      }



    }
  }

  async SelectStaff (staff_id: any){

    console.log('staff id ', staff_id)
  }

  navigation() {

    this.location.back();
  }

}
