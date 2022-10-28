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

  constructor(
    private location: Location,
    private dataService: DataService,
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
        console.log('params',params.hasOwnProperty('id') ? params : ''); // { orderby: "price" }
      }
    );

    await this.checkLogin();

    this.AVAILABLE_STAFF = [];

    this.STAFF_LIST = await this.dataService.getStaffList();
    this.BOOKING_LIST = await this.dataService.getStaffBookingList();
    //this.ALL_SHIFT = await this.dataService.getStaticShift();
    let booking_data = await this.dataService.getInitialBookingdata();
    let date = booking_data.date;
    this.ALL_SHIFT = await this.dataService.getNewStaticShift(new Date(date).getDay());
    
  
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

    console.log('this.IS_LOGIN-----' , this.IS_LOGIN)

    if (!this.IS_LOGIN) {

      await this.dataService.setPreviousUrl('select-a-time');
      this.auth
      .buildAuthorizeUrl()
      .pipe(mergeMap((url) => Browser.open({ url, windowName: '_self' })))
      .subscribe();

      return
    }

   
    let get_booking_data = await this.dataService.getInitialBookingdata();
    get_booking_data.staff_id = staff_id;
    await this.dataService.setBookingData(get_booking_data)

    let selecetd_shift = this.ALL_SHIFT.filter(data => data.id == get_booking_data.timing_id);

    let date = await this.getCurrentDate()
    let total_duration = 0;

    for (let service of get_booking_data.servises) total_duration += service.serviceDuration;

    let starting_date_time = new Date(`${date} ${selecetd_shift[0].value}`);
    let ending_date_time = new Date(`${date} ${selecetd_shift[0].value}`);

    ending_date_time.setMinutes(ending_date_time.getMinutes() + total_duration)
    ending_date_time = new Date(ending_date_time);

    let create_pending_booking_start_time = await this.returnDateTimeFormat(starting_date_time);
    let create_pending_booking_end_time = await this.returnDateTimeFormat(ending_date_time);
    console.log('starting_date_time---' ,create_pending_booking_start_time)
    console.log('ending_date_time---' ,create_pending_booking_end_time)


    // console.log('booking_data-----' , get_booking_data)
    // console.log('starting_date_time-----' , starting_date_time)
    // console.log('ending_date_time-----' , ending_date_time)
    // console.log('ending_date_time-----' , this.ALL_SHIFT)

    await this.apiData.presentLoading();

    await this.auth.getUser().subscribe(
      async (response: any) => { 

        (await this.apiData.getMyProfile(response.email)).subscribe(
          async (user_info: any) => { 

            
            console.log('user_info' , user_info)

            let data = {
                          "userId": user_info.userGMID,
                          "staffId": 1,
                          "isPending": 1,
                          "startTime": create_pending_booking_start_time,
                          "endTime": create_pending_booking_end_time,
                          "serviceId": get_booking_data.servises[0].id
                      };

            (await this.apiData.createPendingAppointment(data)).subscribe(
              async (response: any) => {

                await this.apiData.dismiss();
                console.log('response-------pppppppp' , response)
              },
              async (error:any) => {
                await this.apiData.dismiss();

                if (error.status == 200) {

                  setTimeout(async () => { // remove temprary booking after 5 minutes = 300000
                    

                    (await this.apiData.removeUserPendingBoking(user_info.userGMID)).subscribe(
                      (response: any) => {

                        console.log('hiddin---' , response)
                      },

                      (error: any) => {

                        console.log('error---' , error)
                      }
                    );
                  }, 300000);

                  this.router.navigate(['/booking-summary'],{ queryParams: this.CANCEL_BOOKING_ID == 0? {} :{ id: this.CANCEL_BOOKING_ID } })
                  
                } else if (error.status == 201){

                  await this.apiData.presentAlert('Selected Shift timing not available')
                  return
                
                } else {

                  await this.apiData.presentAlert('pending booking server error'+ JSON.stringify(error))
                }

                console.log('pending booking server error ', error)
                
              }
            );


          },
          
          async (error:any) => {
            await this.apiData.dismiss();
            console.log('profile error ', error)
            await this.apiData.presentAlert('user profile error'+ JSON.stringify(error))
          }
        )

      },
      async (error:any) => {
        await this.apiData.dismiss();
        console.log('auth error ', error)
        await this.apiData.presentAlert('auth api error'+ JSON.stringify(error))
      }
    );

    
    return
    // this.router.navigate(['/booking-summary'],{ queryParams: this.CANCEL_BOOKING_ID == 0? {} :{ id: this.CANCEL_BOOKING_ID } })
    
    // console.log('booking_data--', booking_data)
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
      (user_data: any) =>{
        console.log('user_data' , user_data)

        if (user_data !== undefined){
          
          this.IS_LOGIN = true;
        }
      }
    );
  }

  navigation() {

    this.location.back();
  }

}
