import { Component, OnInit } from '@angular/core';
import { Router , ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DataService } from '../services/data.service';
import { ImageService } from '../services/image.service';
import { ApiDataService } from '../services/api-data.service';
import { AuthService } from '@auth0/auth0-angular';
import { mergeMap } from 'rxjs/operators';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-booking-summary',
  templateUrl: './booking-summary.component.html',
  styleUrls: ['./booking-summary.component.scss'],
})
export class BookingSummaryComponent implements OnInit {

  HEADING: string = "4";
  DATE: string;
  TOTAL_DURATION: any = 0;
  STARTING_TIME: string;
  ENDING_TIME: string;
  STUDIO_NAME: string = 'Jade amber beauty studio Corofin Tuam Galway';
  TOTAL_AMOUNT: any = 0;
  BOOKINGS_DETAILS: any;
  BOOKING_WITH_STAFF: any = true;
  CANCEL_BOOKING_ID: number = 0;
  IS_LOGIN: boolean = false;

  constructor(
    private router: Router,
    private location: Location,
    private dataService: DataService,
    public  imageService: ImageService,
    private apiData: ApiDataService,
    private activateRoute: ActivatedRoute,
    public auth: AuthService,
    ) {

    }

  ngOnInit() {}

  async ionViewWillEnter (){

    this.activateRoute.queryParams
      .subscribe(params => {

        this.CANCEL_BOOKING_ID = params.hasOwnProperty('id') ? params.id : 0;
        console.log('params',params.hasOwnProperty('id') ? params : ''); // { orderby: "price" }
      }
    );

    this.BOOKINGS_DETAILS = await this.dataService.getInitialBookingdata();
    this.BOOKING_WITH_STAFF = this.BOOKINGS_DETAILS.booking_type == this.dataService.BOOKING_WITH_STAFF ? true : false;
    if (this.BOOKINGS_DETAILS == '') {

      this.router.navigate(['/'])
      return
    }

    this.BOOKINGS_DETAILS.staff_details = await this.dataService.getStaffDetail(this.BOOKINGS_DETAILS.staff_id);
    let shift_timing_details = await this.dataService.getShift(this.BOOKINGS_DETAILS.date);
    this.BOOKINGS_DETAILS.shift_timing_details = await shift_timing_details.filter( data => data.id == this.BOOKINGS_DETAILS.timing_id);
    let [start_time , am_pm] = this.BOOKINGS_DETAILS.shift_timing_details[0].time.split(' ')

    this.STARTING_TIME = `${start_time}${am_pm}`;

    for (let service of this.BOOKINGS_DETAILS.servises){
      
      this.TOTAL_DURATION += service.serviceDuration;
      this.TOTAL_AMOUNT += service.servicePrice;
    }
    //this.STUDIO_NAME = this.BOOKINGS_DETAILS.staff_details[0].firstName+" "+this.BOOKINGS_DETAILS.staff_details[0].lastName+ " "+this.STUDIO_NAME;

    let [year , month , day ] = this.BOOKINGS_DETAILS.date.split('-');
    let new_date = new Date(this.BOOKINGS_DETAILS.date);
    let get_month_name = await this.dataService.MONTHS_NAME[new_date.getMonth()]; 

    this.DATE = `${day} ${get_month_name} ${year}`;

    var now = new Date(`${this.BOOKINGS_DETAILS.date}T${this.BOOKINGS_DETAILS.shift_timing_details[0].value}`);
    console.log('from',now)
   
    now.setMinutes(now.getMinutes() + this.TOTAL_DURATION); // timestamp
    
    now = new Date(now); // Date object
   
   
    let {without_space_time} = await this.formatAMPM(now)
    this.ENDING_TIME = without_space_time;
    console.log('cheing --- ',this.formatAMPM(now))
    
    console.log('BOOKINGS_DETAILS-- ',get_month_name, this.BOOKINGS_DETAILS)

    await this.checkLogin();
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

  async formatAMPM(date) {
    
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    let str_time = hours + ':' + minutes + ' ' + ampm;
    let str_time_without_space = hours + ':' + minutes + ampm;
    
    return await {with_space_time: str_time , without_space_time: str_time_without_space};
  }

  async saveBooking (){

    console.clear();
    console.log(this.BOOKINGS_DETAILS)

    if (!this.IS_LOGIN) {

      await this.dataService.setPreviousUrl('booking-summary');
      this.auth
      .buildAuthorizeUrl()
      .pipe(mergeMap((url) => Browser.open({ url, windowName: '_self' })))
      .subscribe();

      return
    }

    await this.dataService.removePreviousUrl()
    

    

    console.log('startr---', `${this.BOOKINGS_DETAILS.date} ${this.BOOKINGS_DETAILS.shift_timing_details[0].value}`)

    let starting_date_time = `${this.BOOKINGS_DETAILS.date}T${this.BOOKINGS_DETAILS.shift_timing_details[0].value}:00.000Z`;
    let end_time = await this.addHours(this.BOOKINGS_DETAILS.shift_timing_details[0].value , this.TOTAL_DURATION);
    let ending_date_time = `${this.BOOKINGS_DETAILS.date}T${end_time}:00.000Z`;
    let data = [];
    

    await this.apiData.presentLoading();

    await this.auth.getUser().subscribe(
      async (response: any) => { // Get auth data
        
        (await this.apiData.getMyProfile(response.email)).subscribe(
          async (user_info: any) => { // Get current user data

            console.log('user_info' , user_info)
            
            

            for (let service of this.BOOKINGS_DETAILS.servises){

              data.push ( {
                employeeId: this.BOOKINGS_DETAILS.staff_id,
                clientId: user_info.userGMID,
                description: '',
                endTime: ending_date_time,
                startTime: starting_date_time,
                isAllDay: false,
                customer: null,
                service: service.serviceName,
                serviceId: service.id,
                firstName: this.BOOKINGS_DETAILS.staff_details[0].firstName,
                lastName:  this.BOOKINGS_DETAILS.staff_details[0].lastName,
                email: user_info.email
              })
              
            }

            console.log(data);

            (await this.apiData.saveBooking(data)).subscribe(
              async (response: any) => {
        
                console.log('response--', response)
                //await this.dataService.removeBookingdata()
                await this.apiData.dismiss();
        
                setTimeout(() => { this.router.navigate(['/booking-complete']) }, 300);
              }, 
              async (error: any) => {
        
                console.log('error----', error)
                console.log('error----', error.status)

               
                
                //await this.dataService.removeBookingdata()
                await this.apiData.dismiss();
                setTimeout(() => { this.router.navigate(['/booking-complete']) }, 300);
        
                if (this.CANCEL_BOOKING_ID != 0) {
        
                  await this.deleteBooking()
                }
                setTimeout(() => { this.router.navigate(['/booking-complete']) }, 300);
              }
            );
          },
          
          async (error:any) => {
            await this.apiData.dismiss();
            console.log('profile error ', error)
            await this.apiData.presentAlert('profile error'+ JSON.stringify(error))
          }
        )

      },
      async (error:any) => {
        await this.apiData.dismiss();
        console.log('auth error ', error)
        await this.apiData.presentAlert('auth api error'+ JSON.stringify(error))
      }
    );

    
  }

  async deleteBooking() {

    (await this.apiData.deleteBooking(this.CANCEL_BOOKING_ID)).subscribe(
      async (response: any) => {

        console.log('response delete booking' , response)
      },
      async (error: any) => {
        
        console.log('error', error)
      }
    );
  }

  async addHours (time: string , add_duration: number) {
    
    let [hours , minut] = time.split(':');
    console.log(hours , minut)
    

    let total_minuts = parseInt(hours) * 60 + parseInt(minut) + add_duration
    let h : any = ~~(total_minuts / 60)
    let m : any = total_minuts % 60
    h = h.toString().length == 1 ?'0'+h : h;
    m = m.toString().length == 1 ?'0'+m : m;
    time = `${h}:${m}`;

    console.log('RETURN', time)
    return time;
  }

  navigation() {

    //this.router.navigate(['/select-a-time'])
    this.location.back();
  }
} 
