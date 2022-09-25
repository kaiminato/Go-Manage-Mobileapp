import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { ApiDataService } from '../services/api-data.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-my-booking-list',
  templateUrl: './my-booking-list.component.html',
  styleUrls: ['./my-booking-list.component.scss'],
})
export class MyBookingListComponent implements OnInit {

  HEADING: string = "Your Bookings";
  IS_FUTURE_BOOKING_active: boolean = true;
  FUTURE_BOOKING_LIST: any = [
    {id: 1 , date_time: 'Thu, 15 Sep at 16:30', service_name: 'Yumi Lash Lift', service_duration: '30 minuts'},
    {id: 2 , date_time: 'Thu, 15 Sep at 17:45', service_name: 'Brow Tint', service_duration: '30 minuts'},
    {id: 3 , date_time: 'Thu, 15 Sep at 19:30', service_name: 'Lip', service_duration: '30 minuts'},
  ];
  RECENT_BOOKING_LIST: any = [
    {id: 4 , date_time: 'Thu, 15 Sep at 12:30', service_name: 'YUnderarm', service_duration: '30 minuts'},
    {id: 5 , date_time: 'Thu, 15 Sep at 14:45', service_name: 'Full Arm', service_duration: '30 minuts'},
    {id: 6 , date_time: 'Thu, 15 Sep at 20:30', service_name: 'Half Arm', service_duration: '30 minuts'},
  ];
  constructor(
    private router: Router,
    private apiData: ApiDataService,
    public auth: AuthService,
    private alertController: AlertController,
  ) { }

  ngOnInit() {}

  async ionViewWillEnter () {

    // (await this.apiData.getMyProfile()).subscribe(
    //   (response: any) => {
    //     console.log('reponse', response)
    //   },
    //   (error: any) => {
    //     console.log('eror', error)
    //   }
    // )
  }

  async cancelBooking (id: any) {

    console.log(id)

    const alert = await this.alertController.create({
      header: 'Do you want cancel this booking ?',
      cssClass:'alert-myclass',
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
            await this.apiData.presentAlert('You have successfully cancelled the session.')
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
