import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
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
  CANCEL_BOOKING_ID: number = 0;

  constructor(
    private location: Location,
    private dataService: DataService,
    public imageService: ImageService,
    private router: Router,
    public alertController: AlertController,
    private activateRoute: ActivatedRoute
  ) { }

  ngOnInit() {}

  async ionViewWillEnter () {

    this.activateRoute.queryParams
      .subscribe(params => {

        this.CANCEL_BOOKING_ID = params.hasOwnProperty('id') ? params.id : 0;
        console.log('params',params.hasOwnProperty('id') ? params : ''); // { orderby: "price" }
      }
    );

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

      //if (staff.id == 1 || staff.id == 5) continue
      console.log(booking_data.date , staff.id)
      let is_date_off = await this.dataService.isStaffDateOff(booking_data.date , staff.id)
      
      console.log('is_date_off---', is_date_off)

      // If Staff have selected date as off day
      if (is_date_off) continue; 
        
      let staff_date_booked_data = this.BOOKING_LIST.filter ( data => data.employeeId == staff.id && data.startTime.includes(booking_data.date))
      
      // ascending order
      staff_date_booked_data.sort(function (a, b) { return a.startTime.localeCompare(b.startTime); });
      console.log('staff_date_booked_data-----', staff_date_booked_data)
 
      // If staff don't have any booking on selected date

      if (staff_date_booked_data.length == 0) { 
 
        this.AVAILABLE_STAFF.push(staff);
        continue;
      }

      let all_shift_booked = true;
      let shift_list = await this.dataService.getStaticShift()

      
      for (let shift of shift_list){

        let check_date = new Date(booking_data.date+'T'+shift.value);

        // Checking All shift is booked or not

        for (let booking_detail of staff_date_booked_data) {

          let from_date = new Date(booking_detail.startTime);
          let to_date = new Date(booking_detail.endTime);
          to_date.setMinutes(to_date.getMinutes() - 1)
          //console.log('to_date--', to_date)

          if (check_date >= from_date && check_date <= to_date){ 

            shift.is_disabled = true;
          } else {

            all_shift_booked = false;
          }
        }

        
        if (all_shift_booked) continue; // If Staff don't have any free time shift
      }

      let selecetd_shift = await this.ALL_SHIFT.filter( data => data.id == booking_data.timing_id)
     

      let total_duration = 0;

      for (let service of booking_data.servises) total_duration += service.serviceDuration;

      let starting_date_time = new Date(`${booking_data.date} ${selecetd_shift[0].value}`);
      
      let ending_date_time = new Date(`${booking_data.date} ${selecetd_shift[0].value}`);
      ending_date_time.setMinutes(ending_date_time.getMinutes() + (total_duration -1))
      ending_date_time = new Date(ending_date_time);

      let is_passed = true;
    
      console.log('is_passed' , is_passed , shift_list.filter(data => data.is_disabled == true))
      for (let shift of shift_list) {

        let new_date = new Date(`${booking_data.date} ${shift.value}`)
        //console.log('checking here', new_date)
        if (starting_date_time <= new_date && ending_date_time >= new_date && shift.is_disabled) {

          //console.log('shift.is_disabled', shift)
          is_passed = false;
        }
      }
      
      console.log('is_passed' , is_passed)
      if (is_passed) {
        this.AVAILABLE_STAFF.push(staff);
      }

      

      // console.clear()
      // console.log('starting_date_time--', starting_date_time , 'ending_date_time', ending_date_time)

      // console.log('booking_data.servises', booking_data.servises)
      // console.log('shift_list---' , 'total_duration', total_duration, shift_list)
    }
    
    if (this.AVAILABLE_STAFF.length == 0) this.presentAlert('No staff is free for the selected date and time')

  }

  async presentAlert (message: any) {

    await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Alert',
      message: message,
      buttons: ['OK']
    }).then((res) => {
      
      res.present();
      res.onDidDismiss().then((dis) => {

        this.navigation()
      })
    });
  }

  async SelectStaff (staff_id: any){

    console.log('staff id ', staff_id)
    let booking_data = await this.dataService.getInitialBookingdata();
    booking_data.staff_id = staff_id;
    await this.dataService.setBookingData(booking_data)
    this.router.navigate(['/booking-summary'],{ queryParams: this.CANCEL_BOOKING_ID == 0? {} :{ id: this.CANCEL_BOOKING_ID } })
    
    console.log('booking_data--', booking_data)
  }

  navigation() {

    this.location.back();
  }

}
