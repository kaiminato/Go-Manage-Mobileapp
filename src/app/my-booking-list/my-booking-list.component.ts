import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { ApiDataService } from '../services/api-data.service';
import { AlertController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { ImageService } from '../services/image.service';
import { mergeMap } from 'rxjs/operators';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-my-booking-list',
  templateUrl: './my-booking-list.component.html',
  styleUrls: ['./my-booking-list.component.scss'],
})
export class MyBookingListComponent implements OnInit {

  HEADING: string = "";
  IS_FUTURE_BOOKING_active: boolean = true;
  ALL_BOOKING_LIST: any = [];
  FUTURE_BOOKING_LIST: any = [];
  RECENT_BOOKING_LIST: any = [];
  IS_LOGIN: boolean = false;
  intervalId : any;
  constructor(
    private router: Router,
    private apiData: ApiDataService,
    public dataService: DataService,
    public auth: AuthService,
    private alertController: AlertController,
    private imageService: ImageService,
  ) { 
    this.checkLogin();
    this.RECENT_BOOKING_LIST = [];
    this.FUTURE_BOOKING_LIST = [];
    this.ALL_BOOKING_LIST = [];
  }

  ngOnInit() {
    
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  ionViewWillEnter () {
    this.getBookings();
  }

  async ionViewWillLeave () {
  }

  async getBookings () {
    if(this.IS_LOGIN){
      await this.apiData.presentLoading();

      await this.auth.getUser().subscribe(
        async (response: any) => {
          let userEmail;
          if(response && response.hasOwnProperty('email')){
            userEmail = response.email;
          }
          else{
            userEmail = await this.dataService._getUserEmail();
          }
          (await this.apiData.getMyProfile(userEmail)).subscribe(
            async (user_info: any) => {
              (await this.apiData.retrievSingleUserBooking(user_info.UserGMID)).subscribe(
                async (response: any) => {
                  if (response.length >0) {


                      this.RECENT_BOOKING_LIST = [];
                      this.FUTURE_BOOKING_LIST = [];
                      this.ALL_BOOKING_LIST = [];

                      for (const booking of response) {
                        const start_date_time = new Date(booking.startTime);
                        const end_date_time = new Date(booking.endTime);
                        const difference = end_date_time.getTime() - start_date_time.getTime();
                        const resultInMinutes = Math.round(difference / 60000);
        
                        const date_time = await this.getDateFormat(booking.startTime);
        
                        const data = {
                            service_name: booking.service,
                            service_duration: resultInMinutes + ' minutes',
                            id: booking.id,
                            date_time,
                            start_time: booking.startTime,
                            endTime: booking.endTime,
                            paymentReceipt: booking.paymentReceipt,
                            compare_date_time: booking.endTime.split('T')[0]
                        };
        
                        this.ALL_BOOKING_LIST.push(data);
                    }
                  }
                  let currentDate = new Date();
                  this.RECENT_BOOKING_LIST = this.ALL_BOOKING_LIST.filter( data => (new Date(currentDate)).getTime() > (new Date(new Date(data.start_time).getTime() + 60000)).getTime())
                  this.FUTURE_BOOKING_LIST = this.ALL_BOOKING_LIST.filter( data => (new Date(currentDate)).getTime() <= (new Date(new Date(data.start_time).getTime() + 60000)).getTime())
                  // Sort array

                  this.FUTURE_BOOKING_LIST.sort((a,b) => <any> new Date(a.start_time) - <any> new Date(b.start_time));

                  console.log(this.FUTURE_BOOKING_LIST)

                  this.intervalId = setInterval(() => this.getAvailableBookings(), 5000);
                  await this.apiData.dismiss();
                },
                async (error: any) => {

                  await this.apiData.dismiss();

                }
              );

            },
            async (error:any) => {
              await this.apiData.dismiss();

              await this.apiData.presentAlert('profile error'+ JSON.stringify(error))
            }
          )
        },
        async (error:any) => {
          await this.apiData.dismiss();

          await this.apiData.presentAlert('auth api error'+ JSON.stringify(error))
        }
      );
    }
    else {
      this.auth
        .buildAuthorizeUrl()
        .pipe(mergeMap((url) => Browser.open({ url, windowName: '_self' })))
        .subscribe();
    }
  }

   getAvailableBookings(){
    if (!this.ALL_BOOKING_LIST) {
      return;
  }
    let currentDate = new Date();
    this.RECENT_BOOKING_LIST =  this.ALL_BOOKING_LIST.filter( data => (new Date(currentDate)).getTime() > (new Date(new Date(data.start_time).getTime() + 60000)).getTime())
    this.FUTURE_BOOKING_LIST =  this.ALL_BOOKING_LIST.filter( data => (new Date(currentDate)).getTime() <= (new Date(new Date(data.start_time).getTime() + 60000)).getTime())
    // Sort array

    this.FUTURE_BOOKING_LIST.sort((a,b) => <any> new Date(a.start_time) - <any> new Date(b.start_time));
  }

  subtractHourFromDate(timeString: string): Date {
    // Parse the time string into a Date object
    const time = new Date(timeString);

    // Subtract an hour
    time.setHours(time.getHours() - 1);

    return time;
  }
  async getDateFormat (date_value: any) {

    let month_name = ['Jan' , 'Feb' , 'Mar' , 'Apr' , 'May' , 'Jun' , 'Jul' , 'Aug' , 'Sep' , 'Oct' , 'Nov' , 'Dec'];
    let day_name = ['Sun' , 'Mon' , 'Tue' , 'Wed' , 'Thu' , 'Fri' , 'Sat'];
    let date_val = new Date(date_value);

    let day = day_name[date_val.getDay()];
    let mon = month_name[date_val.getMonth()];
    let date = date_val.getDate();
    let time = (date_val.getHours() < 10 ? '0'+date_val.getHours() : date_val.getHours()) + ':' + (date_val.getMinutes() < 10 ? '0'+date_val.getMinutes() : date_val.getMinutes());

    return  `${day}, ${date} ${mon} ${date_val.getFullYear()} at ${time}`;
  }

  async cancelBooking (id: any) {


    const alert = await this.alertController.create({
      header: 'Do you want cancel this booking ?',
      cssClass:'my-custom-class',
      backdropDismiss:false, // alert will not close automaticall if we click outside of alert
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          },
        },
        {
          text: 'Yes',
          role: 'confirm',
          handler: async () => {

            await this.apiData.presentLoading();

            (await this.apiData.deleteBooking(id)).subscribe(
              async (response: any) => {

                await this.apiData.dismiss();
                let msg_alert = await this.alertController.create({
                  header: 'You have successfully cancelled this booking',
                  cssClass:'my-custom-class',
                  buttons: ['Ok']
                }).then((res) => {

                  res.present();

                  res.onDidDismiss().then((dis) => {

                   this.router.navigate(['/'])
                  })

                });
              },
              async (error: any) => {

                await this.apiData.dismiss();
              }
            );






          },
        },
      ],
    });

    await alert.present();
  }
  async checkLogin() {

    await this.auth.getUser().subscribe(
      async (user_data: any) => {

        this.IS_LOGIN = user_data !== undefined ? true : false;

      }
    );
  }

  navigation() {

    this.router.navigate(['/']);
  }

}
