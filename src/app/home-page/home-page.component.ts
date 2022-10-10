import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
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
        id: 1 , is_icon: false, name:'today', text: 'Book Now' ,router_link: '/make-a-booking'
      },
      {
        id: 2 , is_icon: false, name:'store', text: 'Online Store' , router_link: '/store-all-product'
      },
    ],
    [
      {
        id: 3 , is_icon: false, name:'card_giftcard', text: 'Buy a voucher',router_link: '/buy-a-voucher' 
      },
      {
        id: 4 , is_icon: false, name:'groups', text: 'About us' ,router_link: '/about-us'
      },
    ],
    [
      {
        id: 5 , is_icon: false, name:'rate_review', text: 'Rate us' ,router_link: '/add-a-review'
      },
      {
        id: 6 , is_icon: false, name:'person_add', text: 'Refer a friend' ,router_link: '/'
      },
    ],
  ];
  constructor(
    private router: Router,
    private apiData: ApiDataService,
    public imageService: ImageService,
  
  ) {

    console.log('LIST----', this.LIST)
  }

  ngOnInit() {
    
  }

  async navigate (link: any) {

    if (link == '/make-a-booking') {
      
    }
    console.log('link', link)
    await this.router.navigate([link])

  }

}
