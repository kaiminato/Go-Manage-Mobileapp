import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { ApiDataService } from '../services/api-data.service';
import { AlertController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'app-my-booking-list',
  templateUrl: './my-booking-list.component.html',
  styleUrls: ['./my-booking-list.component.scss'],
})
export class MyBookingListComponent implements OnInit {

  HEADING: string = "Your Bookings";
  IS_FUTURE_BOOKING_active: boolean = true;
  ALL_BOOKING_LIST: any = [];
  FUTURE_BOOKING_LIST: any = [
    // {id: 1 , date_time: 'Thu, 15 Sep at 16:30', service_name: 'Yumi Lash Lift', service_duration: '30 minuts'},
    // {id: 2 , date_time: 'Thu, 15 Sep at 17:45', service_name: 'Brow Tint', service_duration: '30 minuts'},
    // {id: 3 , date_time: 'Thu, 15 Sep at 19:30', service_name: 'Lip', service_duration: '30 minuts'},
  ];
  RECENT_BOOKING_LIST: any = [
    // {id: 4 , date_time: 'Thu, 15 Sep at 12:30', service_name: 'YUnderarm', service_duration: '30 minuts'},
    // {id: 5 , date_time: 'Thu, 15 Sep at 14:45', service_name: 'Full Arm', service_duration: '30 minuts'},
    // {id: 6 , date_time: 'Thu, 15 Sep at 20:30', service_name: 'Half Arm', service_duration: '30 minuts'},
  ];
  constructor(
    private router: Router,
    private apiData: ApiDataService,
    public dataService: DataService,
    public auth: AuthService,
    private alertController: AlertController,
    private imageService: ImageService,
  ) { }

  ngOnInit() {}

  async ionViewWillEnter () {

    await this.getBookings();
  }

  async ionViewWillLeave () {
    this.RECENT_BOOKING_LIST = [];
    this.FUTURE_BOOKING_LIST = [];
    this.ALL_BOOKING_LIST = [];

  }

  async getBookings () {

    await this.apiData.presentLoading();

    await this.auth.getUser().subscribe(
      async (response: any) => {

        (await this.apiData.getMyProfile(response.email)).subscribe(
          async (user_info: any) => {

            (await this.apiData.retrievSingleUserBooking(user_info.userGMID)).subscribe(
              async (response: any) => {

                if (response.length >0) {


                    this.RECENT_BOOKING_LIST = [];
                    this.FUTURE_BOOKING_LIST = [];
                    this.ALL_BOOKING_LIST = [];

                    for (let index = 0; index < response.length; index++){

                      let start_date_time = new Date(response[index].startTime)
                      let end_date_time = new Date(response[index].endTime)
                      var difference = end_date_time.getTime() - start_date_time.getTime(); // This will give difference in milliseconds
                      var resultInMinutes = Math.round(difference / 60000);

                      let date_time = await this.getDateFormat(response[index].startTime)

                      let data = {
                        service_name : response[index].service,
                        service_duration:resultInMinutes+" minutes",
                        id:response[index].id,
                        date_time: date_time,
                        start_time: response[index].startTime,
                        endTime: response[index].endTime,
                        paymentReceipt: response[index].paymentReceipt,
                        compare_date_time: (response[index].endTime.split('T')[0])

                      };

                      this.ALL_BOOKING_LIST.push(data)
                    }


                }

                const today = new Date()
                let tomorrow: any = new Date(today)
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow = tomorrow.getFullYear()+'-'+((tomorrow.getMonth()+1) < 10 ? `0${(tomorrow.getMonth()+1)}` : (tomorrow.getMonth()+1))+'-'+(tomorrow.getDate() < 10 ? '0'+tomorrow.getDate() : tomorrow.getDate())


                this.RECENT_BOOKING_LIST = this.ALL_BOOKING_LIST.filter( data => <any>new Date(tomorrow).getTime() > <any>new Date(data.compare_date_time).getTime())
                this.FUTURE_BOOKING_LIST = this.ALL_BOOKING_LIST.filter( data => (<any>new Date(tomorrow).getTime() <= <any>new Date(data.compare_date_time).getTime()) )
                console.log("RECENT_BOOKING_LIST",this.RECENT_BOOKING_LIST);
                console.log("FUTURE_BOOKING_LIST",this.FUTURE_BOOKING_LIST);
                // Sort array

                this.FUTURE_BOOKING_LIST.sort((a,b) => <any> new Date(a.start_time) - <any> new Date(b.start_time));

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

  navigation() {

    this.router.navigate(['/']);
  }

}
