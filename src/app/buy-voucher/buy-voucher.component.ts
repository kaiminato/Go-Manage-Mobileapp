import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';

@Component({
  selector: 'app-buy-voucher',
  templateUrl: './buy-voucher.component.html',
  styleUrls: ['./buy-voucher.component.scss'],
})
export class BuyVoucherComponent implements OnInit {

  HEADING: string = "Buy a Voucher";
  CUSTOM_PRICE: any = '';
  SEND_TO_ME: boolean = true;
  TOTAL_PRICE : any = 0;
  SELECTED_PRICE: any = [];

  F_FIRST_NAME: string = '';
  F_LAST_NAME: string = '';
  F_EMAIL: string = '';

  S_FIRST_NAME: string = '';
  S_LAST_NAME: string = '';
  S_EMAIL: string = '';
  S_GIFTEE_EMAIL: string = '';
  S_GIFTEE_EMAIL_MESSAGE: string = '';

  PRICE_LIST: any = [
    { id: 1 , price: 50 , is_active: false , is_button: true},
    { id: 2 , price: 100 , is_active: false , is_button: true},
    { id: 3 , price: 150 , is_active: false , is_button: true},
    { id: 4 , price: 0 , is_active: false , is_button: false},
  ];

  constructor(
    private router: Router,
    private apiData: ApiDataService,
  ) { }

  ngOnInit() {}

  async selectPrice (price_id: any) {

    for (let price_detail of this.PRICE_LIST) price_detail.is_active = price_detail.id == price_id ? true : false;
    this.SELECTED_PRICE = this.PRICE_LIST.filter( data => data.id == price_id);

    if (this.SELECTED_PRICE[0].is_button == true) this.CUSTOM_PRICE = '';
    console.log('price_id' , price_id)
    console.log(this.CUSTOM_PRICE)
    //this.CUSTOM_PRICE = 0
  }
  

  async confirm () {

    let validate_email = /\S+@\S+\.\S+/;

    if (this.SEND_TO_ME) {

      if (this.F_FIRST_NAME.trim() == '') return await this.apiData.presentAlert("First name can't be empty")
      if (this.F_LAST_NAME.trim() == '') return await this.apiData.presentAlert("Last name can't be empty")
      if (this.F_EMAIL.trim() == '') return await this.apiData.presentAlert("Email can't be empty")
      if (!validate_email.test(this.F_EMAIL)) return await this.apiData.presentAlert("Invalid email")

    } else {

      if (this.S_FIRST_NAME.trim() == '') return await this.apiData.presentAlert("First name can't be empty")
      if (this.S_LAST_NAME.trim() == '') return await this.apiData.presentAlert("Last name can't be empty")
      if (this.S_EMAIL.trim() == '') return await this.apiData.presentAlert("Email can't be empty")
      if (!validate_email.test(this.S_EMAIL)) return await this.apiData.presentAlert("Invalid email")
      if (this.S_GIFTEE_EMAIL.trim() == '') return await this.apiData.presentAlert("Giftee email can't be empty")
      if (this.S_GIFTEE_EMAIL_MESSAGE.trim() == '') return await this.apiData.presentAlert("Giftee message can't be empty")
    }

  }

  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/']);
  }

}
