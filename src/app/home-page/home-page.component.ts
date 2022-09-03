import { Component, OnInit } from '@angular/core';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {

  LIST: any = [
    [
      {
        id: 1 , is_icon: false, name:'today', text: 'Book Now' ,roter_link: '/make-a-booking'
      },
      {
        id: 2 , is_icon: false, name:'store', text: 'Online Store' , roter_link: '/'
      },
    ],
    [
      {
        id: 3 , is_icon: false, name:'card_giftcard', text: 'Buy a voucher',roter_link: '/buy-a-voucher' 
      },
      {
        id: 4 , is_icon: false, name:'groups', text: 'About us' ,roter_link: '/about-us'
      },
    ],
    [
      {
        id: 5 , is_icon: false, name:'rate_review', text: 'Rate us' ,roter_link: '/add-a-review'
      },
      {
        id: 6 , is_icon: false, name:'person_add', text: 'Refer a friend' ,roter_link: '/'
      },
    ],
  ];
  constructor(public imageService: ImageService) {

    console.log('LIST----', this.LIST)
  }

  ngOnInit() {}

}
