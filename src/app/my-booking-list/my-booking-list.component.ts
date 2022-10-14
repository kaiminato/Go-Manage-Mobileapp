import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { ApiDataService } from '../services/api-data.service';
import { AlertController } from '@ionic/angular';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-my-booking-list',
  templateUrl: './my-booking-list.component.html',
  styleUrls: ['./my-booking-list.component.scss'],
})
export class MyBookingListComponent implements OnInit {

  HEADING: string = "Your Bookings";
  IS_FUTURE_BOOKING_active: boolean = false;
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
    private dataService: DataService,
    public auth: AuthService,
    private alertController: AlertController,
  ) { }

  ngOnInit() {}

  async ionViewWillEnter () {

    await this.getBookings();
  }

  async getBookings () {

    await this.apiData.presentLoading();

    await this.auth.getUser().subscribe(
      async (response: any) => { 

        console.log('response' , response);

        (await this.apiData.getMyProfile(response.email)).subscribe(
          async (user_info: any) => { 

            console.log('user_info' , user_info);

            (await this.apiData.retrievSingleUserBooking(user_info.userGMID)).subscribe(
              async (response: any) => {
        
                
                response = response.filter( data => new Date() < new Date(data.endTime))
                console.log('response' , response)
        
                if (response.length >0) {
        
                  
                  if (response.length > 4) {
                    
                    let end_from = response.length -1;
                    let end_to = response.length -6;
                    console.log('yefyg', end_from ,end_to )
        
                    this.RECENT_BOOKING_LIST = []
                    this.FUTURE_BOOKING_LIST = []
        
                    for (let index = end_from; index > end_to; index--){
        
                      let start_date_time = new Date(response[index].startTime)
                      let end_date_time = new Date(response[index].endTime)
                      var difference = end_date_time.getTime() - start_date_time.getTime(); // This will give difference in milliseconds
                      var resultInMinutes = Math.round(difference / 60000);
                      let date_time = await this.getDateFormat(response[index].startTime)

                      let data = {
                        service_name : response[index].service,
                        service_duration:resultInMinutes+" minuts",
                        id:response[index].id,
                        date_time: date_time
                        
                      };
        
                      this.RECENT_BOOKING_LIST.push(data)
                      console.log('index', index)              
                    }
        
                    for (let index = 0; index < response.length; index++){
        
                      let start_date_time = new Date(response[index].startTime)
                      let end_date_time = new Date(response[index].endTime)
                      var difference = end_date_time.getTime() - start_date_time.getTime(); // This will give difference in milliseconds
                      var resultInMinutes = Math.round(difference / 60000);
        
                      let date_time = await this.getDateFormat(response[index].startTime)
        
                      let data = {
                        service_name : response[index].service,
                        service_duration:resultInMinutes+" minuts",
                        id:response[index].id,
                        date_time: date_time
                        
                      };
        
                      this.FUTURE_BOOKING_LIST.push(data)
                    }
        
                    
                  } else {
        
                    this.RECENT_BOOKING_LIST = []
                    this.FUTURE_BOOKING_LIST = []

                    console.log('hiting')
        
                    for (let index = 0; index < response.length; index++){
        
                      let start_date_time = new Date(response[index].startTime)
                      let end_date_time = new Date(response[index].endTime)
                      var difference = end_date_time.getTime() - start_date_time.getTime(); // This will give difference in milliseconds
                      var resultInMinutes = Math.round(difference / 60000);
                      let date_time = await this.getDateFormat(response[index].startTime)
        
                      let data = {
                        service_name : response[index].service,
                        service_duration:resultInMinutes+" minuts",
                        id:response[index].id,
                        date_time: date_time
                        
                      };
        
                      this.RECENT_BOOKING_LIST.push(data)
                    }
        
                  }
                }
        
                await this.apiData.dismiss();
              },
              async (error: any) => {
        
                await this.apiData.dismiss();
                console.log('error', error)
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
    
    // (await this.apiData.getStaffBookingList()).subscribe(
    //   async (response: any) => {

        
    //     response = response.filter( data => new Date() < new Date(data.endTime))
    //     console.log('response' , response)

    //     if (response.length >0) {

          
    //       if (response.length > 4) {
            
    //         let end_from = response.length -1;
    //         let end_to = response.length -6;
    //         console.log('yefyg', end_from ,end_to )

    //         this.RECENT_BOOKING_LIST = []
    //         this.FUTURE_BOOKING_LIST = []

    //         for (let index = end_from; index > end_to; index--){

    //           let start_date_time = new Date(response[index].startTime)
    //           let end_date_time = new Date(response[index].endTime)
    //           var difference = end_date_time.getTime() - start_date_time.getTime(); // This will give difference in milliseconds
    //           var resultInMinutes = Math.round(difference / 60000);
    //           let data = {
    //             service_name : response[index].service,
    //             service_duration:resultInMinutes+" minuts",
    //             id:response[index].id,
    //             date_time: 'Thu, 15 Sep at 12:30'
                
    //           };

    //           this.RECENT_BOOKING_LIST.push(data)
    //           console.log('index', index)              
    //         }

    //         for (let index = 0; index < response.length -6; index++){

    //           let start_date_time = new Date(response[index].startTime)
    //           let end_date_time = new Date(response[index].endTime)
    //           var difference = end_date_time.getTime() - start_date_time.getTime(); // This will give difference in milliseconds
    //           var resultInMinutes = Math.round(difference / 60000);

    //           let date_time = await this.getDateFormat(response[index].startTime)

    //           let data = {
    //             service_name : response[index].service,
    //             service_duration:resultInMinutes+" minuts",
    //             id:response[index].id,
    //             date_time: date_time
                
    //           };

    //           this.FUTURE_BOOKING_LIST.push(data)
    //         }

            
    //       } else {

    //         this.RECENT_BOOKING_LIST = []
    //         this.FUTURE_BOOKING_LIST = []

    //         for (let index = 0; index < response.length -1; index++){

    //           let start_date_time = new Date(response[index].startTime)
    //           let end_date_time = new Date(response[index].endTime)
    //           var difference = end_date_time.getTime() - start_date_time.getTime(); // This will give difference in milliseconds
    //           var resultInMinutes = Math.round(difference / 60000);
    //           let date_time = await this.getDateFormat(response[index].startTime)

    //           let data = {
    //             service_name : response[index].service,
    //             service_duration:resultInMinutes+" minuts",
    //             id:response[index].id,
    //             date_time: date_time
                
    //           };

    //           this.RECENT_BOOKING_LIST.push(data)
    //         }

    //       }
    //     }

    //     await this.apiData.dismiss();
    //   },
    //   async (error: any) => {

    //     await this.apiData.dismiss();
    //     console.log('error', error)
    //   }
    // );
  }

  async getDateFormat (date_value: any) {

    let month_name = ['Jan' , 'Feb' , 'Mar' , 'Apr' , 'May' , 'Jun' , 'Jul' , 'Aug' , 'Sep' , 'Oct' , 'Nov' , 'Dec'];
    let day_name = ['Sun' , 'Mon' , 'Tue' , 'Wed' , 'Thu' , 'Fri' , 'Sat'];
    let date_val = new Date(date_value);

    let day = day_name[date_val.getDay()];
    let mon = month_name[date_val.getMonth()];
    let date = date_val.getDate();
    let time = date_val.getHours() + ':' + date_val.getMinutes();

    return  `${day}, ${date} ${mon} at ${time}`;
  }

  async cancelBooking (id: any) {

    console.log(id)

    const alert = await this.alertController.create({
      header: 'Do you want cancel this booking ?',
      cssClass:'my-custom-class',
      backdropDismiss:false, // alert will not close automaticall if we click outside of alert 
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
           console.log('cancel');
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
                console.log('response', response)
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
                console.log('error', error)
              }
            );

            
            
            

            
          },
        },
      ],
    });

    await alert.present();
  }

  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/']);
  }

}
