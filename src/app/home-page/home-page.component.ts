import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { DataService } from '../services/data.service';
import { ImageService } from '../services/image.service';

const callbackUri = `http://localhost:8100/home`;

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})

export class HomePageComponent implements OnInit {

  LIST: any = [
    [
      {
        id: 1 , is_icon: true, name:'today', text: 'Book Now' ,router_link: '/make-a-booking' , image : this.imageService.BOOK_NOW
      },
      {
        id: 2 , is_icon: true, name:'store', text: 'Online Store' , router_link: '/store-all-product' , image : this.imageService.ONLINE_STORE_IMG
      },
    ],
    [
      {
        id: 3 , is_icon: true, name:'card_giftcard', text: 'Buy a voucher',router_link: '/buy-a-voucher' , image: this.imageService.BUY_A_VOUCHER_IMG
      },
      {
        id: 4 , is_icon: true, name:'groups', text: 'About us' ,router_link: '/about-us', image: this.imageService.ABOUT_US_IMG
      },
    ],
    [
      {
        id: 5 , is_icon: true, name:'rate_review', text: 'Rate us' ,router_link: '/add-a-review', image: this.imageService.RATE_US_IMG
      },
      {
        id: 6 , is_icon: true, name:'person_add', text: 'Refer a friend' ,router_link: '/', image: this.imageService.REFER_A_FRIEND_IMG
      },
    ],
  ];
  constructor(
    private router: Router,
    private apiData: ApiDataService,
    public imageService: ImageService,
    public dataService: DataService,
  ) {

  }

  ngOnInit() {

  }

  async ionViewWillEnter () {


    await this.dataService._getOwnerColor();
    await this.apiData._updateUserId();

    await this.checkPreviousUrl();
    await this._getBusinessOwnerDetails();
  }

  async _getBusinessOwnerDetails () {

    await (await this.apiData._getBusinessOwnerDetails()).subscribe(
      async (response: any) => {

        if (response.length > 0) {

          // console.log('background---' , this.dataService.BACKGROUND_COLOR);
          // console.log('button---' , this.dataService.BUTTON_COLOR);
          // console.log('text---' , this.dataService.TEXT_COLOR);

          await this.dataService._setOwnerData(response[0]);

          await this.dataService._getOwnerColor();

          // console.log('after-------')
          // console.log('background---' , this.dataService.BACKGROUND_COLOR);
          // console.log('button---' , this.dataService.BUTTON_COLOR);
          // console.log('text---' , this.dataService.TEXT_COLOR);


        }
      },
      (error: any) => {

        console.log('error-----' , error)
      }
    );
  }

  async checkPreviousUrl () {

    let get_previous_url = await this.dataService.getPreviousUrl()

    if (get_previous_url != '') {

      let url = `/${get_previous_url}`
      this.router.navigate([ url ]);
      this.dataService.removePreviousUrl();
    }

  }

  async navigate (link: any) {

    if (link == '/make-a-booking') {

    }
    await this.router.navigate([link])

  }

}
