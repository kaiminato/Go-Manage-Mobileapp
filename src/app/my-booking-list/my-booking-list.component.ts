import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { ApiDataService } from '../services/api-data.service';

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
    {id: 1 , date_time: 'Thu, 15 Sep at 17:45', service_name: 'Brow tint', service_duration: '30 minuts'},
    {id: 1 , date_time: 'Thu, 15 Sep at 19:30', service_name: 'Lip', service_duration: '30 minuts'},
  ];
  RECENT_BOOKING_LIST: any = [
    {id: 1 , date_time: 'Thu, 15 Sep at 12:30', service_name: 'YUnderarm', service_duration: '30 minuts'},
    {id: 1 , date_time: 'Thu, 15 Sep at 14:45', service_name: 'Full Arm', service_duration: '30 minuts'},
    {id: 1 , date_time: 'Thu, 15 Sep at 20:30', service_name: 'Half Arm', service_duration: '30 minuts'},
  ];
  constructor(
    private router: Router,
    private apiData: ApiDataService,
    public auth: AuthService,
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

  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/']);
  }

}
