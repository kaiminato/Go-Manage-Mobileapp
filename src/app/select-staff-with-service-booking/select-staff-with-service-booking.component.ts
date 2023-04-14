import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { ImageService } from '../services/image.service';
import { AuthService } from '@auth0/auth0-angular';
import { mergeMap, retry } from 'rxjs/operators';
import { Browser } from '@capacitor/browser';
import { ApiDataService } from '../services/api-data.service';

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
  IS_LOGIN: boolean = false;
  PENDING_BOOKING_TIMEOUT: any;

  constructor(
    private location: Location,
    public dataService: DataService,
    public imageService: ImageService,
    private router: Router,
    public alertController: AlertController,
    private activateRoute: ActivatedRoute,
    public auth: AuthService,
    private apiData: ApiDataService
  ) { }

  ngOnInit() {}

  async ionViewWillEnter () {


    this.activateRoute.queryParams
      .subscribe(params => {

        this.CANCEL_BOOKING_ID = params.hasOwnProperty('id') ? params.id : 0;
        
      }
    );

    await this.checkLogin();

    this.AVAILABLE_STAFF = [];

    this.STAFF_LIST = await this.dataService.getStaffList();
    this.BOOKING_LIST = await this.dataService.getStaffBookingList();
    //this.ALL_SHIFT = await this.dataService.getStaticShift();
    let booking_data = await this.dataService.getInitialBookingdata();
    
    let date = booking_data.date;
    
    //this.ALL_SHIFT = await this.dataService.getNewStaticShift(new Date(date).getDay());
    
    await this._filterStaffList();
  }

  async _filterStaffList() {

    let booking_data = await this.dataService.getInitialBookingdata();
    let selecetd_shift = booking_data.timing_id;
    let selecetd_date = booking_data.date;

    console.log('this.booking_data----' , booking_data);
    console.log('this.STAFF_LIST----' , this.STAFF_LIST);
    for (let staff of this.STAFF_LIST) {

      if (staff.staffDetailFormatted != null) {
        if (staff.staffDetailFormatted.length > 0) {
          
          // console.log('rota--' , staff.staffDetailFormatted)
          let staff_rota = [];
          staff_rota = await staff.staffDetailFormatted.filter( data => data.description == '' && data.workDate == booking_data.date);
          
          
          
          if (staff_rota.length == 0) continue; 
          console.log('staff_rota---' , staff_rota)
        
          let staff_date_booked_data = this.BOOKING_LIST.filter ( data => data.employeeId == staff.employee_id && data.startTime.includes(booking_data.date))
          
          // console.log('staff_date_booked_data----' , staff_date_booked_data);
          
          let shift_list = await this._getShiftList(staff.employee_id , selecetd_date);
          let total_duration = 0;

          for (let service of booking_data.servises) total_duration += service.serviceDuration;
          
          let starting_date_time = new Date(`${selecetd_date}T${selecetd_shift.value}`);
          let ending_date_time = new Date(`${selecetd_date}T${selecetd_shift.value}`);

          ending_date_time.setMinutes(ending_date_time.getMinutes() + total_duration -1)
          ending_date_time = new Date(ending_date_time);

          let is_passed = true;
          for (let shift of shift_list) {

            let new_date = new Date(`${selecetd_date} ${shift.value}`);
            
            if (starting_date_time <= new_date && ending_date_time >= new_date && shift.is_disabled) {
              
              is_passed = false;
            }
          }

          if (is_passed) {

            this.AVAILABLE_STAFF.push(staff);
          }

          console.log('total_duration---' , total_duration);
          console.log('starting_date_time---' , starting_date_time);
          console.log('ending_date_time---' , ending_date_time);
        }
      }
      
    }
    
    if (this.AVAILABLE_STAFF.length == 0) this.presentAlert('No staff is free for the selected date and time')
  }

  async filterStaffList () { // not in use

    let booking_data = await this.dataService.getInitialBookingdata();

    console.log('this.booking_data----' , booking_data);
    console.log('this.STAFF_LIST----' , this.STAFF_LIST);
    
    
    for (let staff of this.STAFF_LIST) {

      //if (staff.id == 1 || staff.id == 5) continue
      
      let is_date_off = await this.dataService.isStaffDateOff(booking_data.date , staff.employee_id)
      

      // If Staff have selected date as off day
      if (is_date_off) continue; 
        
      let staff_date_booked_data = this.BOOKING_LIST.filter ( data => data.employeeId == staff.employee_id && data.startTime.includes(booking_data.date))
      
      // ascending order
      staff_date_booked_data.sort(function (a, b) { return a.startTime.localeCompare(b.startTime); });
      
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
    
      for (let shift of shift_list) {

        let new_date = new Date(`${booking_data.date} ${shift.value}`)
        
        if (starting_date_time <= new_date && ending_date_time >= new_date && shift.is_disabled) {
          is_passed = false;
        }
      }
      
      if (is_passed) {
        this.AVAILABLE_STAFF.push(staff);
      }

    }
    
   
    if (this.AVAILABLE_STAFF.length == 0) this.presentAlert('No staff is free for the selected date and time')

  }

  async _getShiftList(staff_id: any , selected_date: any) {

    let staff_detail = await this.dataService.getStaffDetail(staff_id);
    let staff_availability_dates =  [];
    
    if (staff_detail[0].staffDetailFormatted != null) {
      if (staff_detail[0].staffDetailFormatted.length > 0) {

        staff_availability_dates = await staff_detail[0].staffDetailFormatted.filter( data => data.description == '' && data.workDate == selected_date)
      }
    }

    let current_date_booking = await this.BOOKING_LIST.filter( data => data.startTime.includes(selected_date) && staff_id == data.employeeId);
    let shift_start_time: any = '';
    let shift_end_time: any = ''

    if (staff_availability_dates.length > 0) {

      // get shift start time & end time
      if (staff_availability_dates.length > 1) {

        shift_start_time = staff_availability_dates[0]?.startShiftTime;
        shift_end_time = staff_availability_dates[1]?.endShiftTime;
      } else {
        shift_start_time = staff_availability_dates[0]?.startShiftTime;
        shift_end_time = staff_availability_dates[0]?.endShiftTime;
      }

      shift_end_time  = new Date(`${selected_date}T${shift_end_time}`);
      shift_end_time.setMinutes(shift_end_time.getMinutes() - 30); // Last timing not included as shift so removing the last shift (endtime)

      shift_end_time = shift_end_time.getHours() + ':' + (shift_end_time.getMinutes() == 0 ? '00' : shift_end_time.getMinutes())+":"+(shift_end_time.getSeconds() == 0 ? '00': shift_end_time.getSeconds())

      console.log('shift_start_time---' , shift_start_time)
      console.log('shift_end_time---' , shift_end_time)

      // Get shift timing list
      let all_shift = await this._returnTimesInBetween(shift_start_time , shift_end_time);
      
      
      // Shift disabled based on break time---- start
     
      for (let shift_value of all_shift) {

        if (!shift_value.is_disabled) { // If shift is not disabled

          let shift__date_time = new Date(`${selected_date}T${shift_value.value}:00`);
      
          for (let value of staff_availability_dates) {
            if (value.outOfOfficeFrom != null && value.outOfOfficeTo != null) {
              
              let break_start_time = new Date(`${selected_date}T${value.outOfOfficeFrom}`);
              let break_end_time = new Date(`${selected_date}T${value.outOfOfficeTo}`)
              break_end_time.setMinutes(break_end_time.getMinutes() - 1);
    
              // Shift will be disabled if shift time will exist in between break start & break end time
              if (break_start_time.getTime() <= shift__date_time.getTime() && break_end_time.getTime() >= shift__date_time.getTime()) {
  
                //console.log('shift_value.value----' , shift_value.value);
                shift_value.is_disabled = true; // Disabled the shift
              }
             
            }
          }
        }
        
      }

      // Shift disabled based on break time---- end)

      // Shift disabled based on Booking time -- start

      console.log('current_date_booking---' , JSON.stringify(current_date_booking));
      if (current_date_booking.length > 0) { // If bookings exist on selected date
        
        for (let shift_value of all_shift) {

          if (!shift_value.is_disabled) { // If shift is not disabled
            
            let shift__date_time = new Date(`${selected_date}T${shift_value.value}:00`);
            for (let booking_value of current_date_booking) {

              let booking_start_time = new Date(booking_value.startTime);
              let booking_end_time = new Date(booking_value.endTime);
              booking_end_time.setMinutes(booking_end_time.getMinutes() - 1);
    
              // Shift will be disabled if shift time will exist in between booking start & booking end time
              if (booking_start_time.getTime() <= shift__date_time.getTime() && booking_end_time.getTime() >= shift__date_time.getTime()) {

                shift_value.is_disabled = true; // Disabled the shift
              }
            }
            
          }
        }
      }

      // Shift disabled based on Booking time -- end

      console.log('all_shift--' ,all_shift);
      return all_shift;
    }
  }

  async _returnTimesInBetween(start, end) {
    var timesInBetween = [];
   
    var startH = parseInt(start.split(":")[0]);
    var startM = parseInt(start.split(":")[1]);
    var endH = parseInt(end.split(":")[0]);
    var endM = parseInt(end.split(":")[1]);
  
    if (startM == 30)
      startH++;
  
    for (var i = startH; i < endH; i++) {
      timesInBetween.push(i < 10 ? "0" + i + ":00" : i + ":00");
      timesInBetween.push(i < 10 ? "0" + i + ":30" : i + ":30");
    }
  
    timesInBetween.push(endH + ":00");
    if (endM == 30)
      timesInBetween.push(endH + ":30")
    let result = [];

    for (let timeString of timesInBetween) {

      let value = timeString;
      let H = +timeString.substr(0, 2);
      let h = (H % 12) || 12;
      let ampm = H < 12 ? " AM" : " PM";
      timeString = h + timeString.substr(2, 3) + ampm;
      result.push({
                    id: result.length + 1 ,
                    time: timeString ,   
                    value: value, 
                    is_active: false, 
                    is_disabled: false,
                    soft_disabled: false
                  });
    }

    return result;
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

  

  async _selectStaff (staff_id: any){ // not in use-----

    if (!this.IS_LOGIN) {

      await this.dataService.setPreviousUrl('select-staff-with-service-booking');
      this.auth
      .buildAuthorizeUrl()
      .pipe(mergeMap((url) => Browser.open({ url, windowName: '_self' })))
      .subscribe();

      return
    }

   
    let get_booking_data = await this.dataService.getInitialBookingdata();
    get_booking_data.staff_id = staff_id;
    await this.dataService.setBookingData(get_booking_data)

    console.log('get_booking_data---' , get_booking_data);

    let selecetd_shift = get_booking_data.timing_id;
    let selecetd_date = get_booking_data.date;

    //let date = await this.getCurrentDate()
    let total_duration = 0;

    for (let service of get_booking_data.servises) total_duration += service.serviceDuration;

    let starting_date_time = new Date(`${selecetd_date}T${selecetd_shift.value}`);
    let ending_date_time = new Date(`${selecetd_date}T${selecetd_shift.value}`);

    ending_date_time.setMinutes(ending_date_time.getMinutes() + total_duration);
    ending_date_time = new Date(ending_date_time);

    let create_pending_booking_start_time = await this.returnDateTimeFormat(starting_date_time);
    let create_pending_booking_end_time = await this.returnDateTimeFormat(ending_date_time);
    
    await this.apiData.presentLoading();

    await this.auth.getUser().subscribe(
      async (response: any) => { 

        (await this.apiData.getMyProfile(response.email)).subscribe(
          async (user_info: any) => { 

            let data = {
                          "userId": user_info.userGMID,
                          "staffId": staff_id,
                          "isPending": 1,
                          "startTime": create_pending_booking_start_time,
                          "endTime": create_pending_booking_end_time,
                          "serviceId": get_booking_data.servises[0].id
                      };

            (await this.apiData.createPendingAppointment(data)).subscribe(
              async (response: any) => {

                await this.apiData.dismiss();
                
              },
              async (error:any) => {
                await this.apiData.dismiss();

                if (error.status == 200) {

                  this.PENDING_BOOKING_TIMEOUT = setTimeout(async () => { // remove temprary booking after 5 minutes = 300000
                    

                    this.removePendingBooking();
                  }, 300000);

                  this.router.navigate(['/booking-summary'],{ queryParams: this.CANCEL_BOOKING_ID == 0? {} :{ id: this.CANCEL_BOOKING_ID } })
                  
                } else if (error.status == 201){

                  await this.apiData.presentAlert('Selected Shift timing not available')
                  return
                
                } else {

                  await this.apiData.presentAlert('pending booking server error'+ JSON.stringify(error))
                }
                
              }
            );


          },
          
          async (error:any) => {
            await this.apiData.dismiss();
            
            await this.apiData.presentAlert('user profile error'+ JSON.stringify(error))
          }
        )

      },
      async (error:any) => {
        await this.apiData.dismiss();
        
        await this.apiData.presentAlert('auth api error'+ JSON.stringify(error))
      }
    );

    
    return
    // this.router.navigate(['/booking-summary'],{ queryParams: this.CANCEL_BOOKING_ID == 0? {} :{ id: this.CANCEL_BOOKING_ID } })
    
    
  }

  async removePendingBooking () {

    await this.auth.getUser().subscribe(
      async (response: any) => { 

        (await this.apiData.getMyProfile(response.email)).subscribe(
          async (user_info: any) => { 


              (await this.apiData.removeUserPendingBoking(user_info.userGMID)).subscribe(
                (response: any) => {

                },

                (error: any) => {

                }
              );
          },
          
          async (error:any) => {
            await this.apiData.dismiss();
            
            // await this.apiData.presentAlert('user profile error'+ JSON.stringify(error))
          }
        )

      },
      async (error:any) => {
        await this.apiData.dismiss();
        
        // await this.apiData.presentAlert('auth api error'+ JSON.stringify(error))
      }
    );
  }


  async getCurrentDate () {

    let today_date = new Date();
    let year: any = today_date.getFullYear();
    let month:any = today_date.getMonth() + 1; // Months start at 0!
    let day: any = today_date.getDate();

    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;

    return  year + '-' + month + '-' + day;
  
  }

  async returnDateTimeFormat (date_time){

    let today_date = new Date(date_time);
    let year: any = today_date.getFullYear();
    let month:any = today_date.getMonth() + 1; // Months start at 0!
    let day: any = today_date.getDate();
    let hours: any = today_date.getHours();
    let minutes: any = today_date.getMinutes();

    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;
    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;

    return  await year + '-' + month + '-' + day + 'T' + hours + ':' + minutes +':00.000Z';
  }

  async checkLogin () {

    await this.auth.getUser().subscribe(
      async (user_data: any) =>{
        
        if (user_data !== undefined){
          
          this.IS_LOGIN = true;
          await this.removePendingBooking();
          clearTimeout(this.PENDING_BOOKING_TIMEOUT)
        }
      }
    );
  }

  navigation() {

    this.location.back();
  }

}
