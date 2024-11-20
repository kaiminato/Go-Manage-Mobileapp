import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { DataService } from '../services/data.service';
import { ImageService } from '../services/image.service';
import { AuthService } from '@auth0/auth0-angular';
import { AuthUserService } from '../AuthUserService';
import { mergeMap } from 'rxjs/operators';
import { Browser } from '@capacitor/browser';
@Component({
  selector: 'app-buy-voucher',
  templateUrl: './buy-voucher.component.html',
  styleUrls: ['./buy-voucher.component.scss'],
})
export class BuyVoucherComponent implements OnInit {

  HEADING: string = "";
  CUSTOM_PRICE: any = '';
  SEND_TO_ME: boolean = true;
  TOTAL_PRICE: any = 0;
  SELECTED_PRICE: any = [];

  F_FIRST_NAME: string = '';
  F_LAST_NAME: string = '';
  F_EMAIL: string = '';

  S_FIRST_NAME: string = '';
  S_LAST_NAME: string = '';
  S_EMAIL: string = '';
  S_GIFTEE_EMAIL: string = '';
  S_GIFTEE_EMAIL_MESSAGE: string = '';
  IS_LOGIN: boolean = false;
  userGMID: any;
  PRICE_LIST: any = [
    { id: 1, price: 50, is_active: false, is_button: true },
    { id: 2, price: 100, is_active: false, is_button: true },
    { id: 3, price: 150, is_active: false, is_button: true },
    { id: 4, price: 0, is_active: false, is_button: false },
  ];

  constructor(
    private router: Router,
    private apiData: ApiDataService,
    private dataService: DataService,
    public imageService: ImageService,
    private auth: AuthService,
    private authusrService: AuthUserService,
  ) {

  }

  ngOnInit() { }

  async ionViewWillEnter() {

    this.F_FIRST_NAME = '';
    this.F_LAST_NAME = '';
    this.F_EMAIL = '';
    this.SEND_TO_ME = true;
    this.TOTAL_PRICE = 0;
    this.SELECTED_PRICE = [];

    this.S_FIRST_NAME = '';
    this.S_LAST_NAME = '';
    this.S_EMAIL = '';
    this.S_GIFTEE_EMAIL = '';
    this.S_GIFTEE_EMAIL_MESSAGE = '';
    await this.checkLogin();
    if (this.IS_LOGIN) {
      this.auth.getUser().subscribe(
        async (response: any) => {
          if (response && response.hasOwnProperty('email')) { // Check if response is defined

            this.F_EMAIL = response.email;
          } else {
            this.F_EMAIL = await this.dataService._getUserEmail();
          }

          // Now safely calling getMyProfile with the EMAIL
          (await this.apiData.getMyProfile(this.F_EMAIL)).subscribe(
            async (user_info: any) => {
              this.userGMID = user_info.iserGMID;
              if (!user_info.givenName || user_info.givenName === 'null' || user_info.familyName === 'null' ||
                !user_info.familyName || !user_info.phoneMobile || user_info.phoneMobile === 'null') {
                console.log("User GMID with missing info:");
              } else {
                this.F_FIRST_NAME = user_info.givenName;
                this.F_LAST_NAME = user_info.familyName;
              }
            },
            (error: any) => {
              console.error("Error fetching user profile:", error);
            }
          );
        },
        (error: any) => {
          console.error("Error fetching user:", error);
        }
      );
    }

    let prefilled_data = await this.dataService.getVoucherData();



    if (prefilled_data.hasOwnProperty('price')) return await this.preFilleddata()
  }

  async preFilleddata() {
    let prefilled_data = await this.dataService.getVoucherData();


    await this.selectPrice(prefilled_data.selected_price_id);
    let selected_data = await this.PRICE_LIST.filter(data => data.id == prefilled_data.selected_price_id)

    if (selected_data[0].is_button == false) this.CUSTOM_PRICE = prefilled_data.price

    this.SEND_TO_ME = prefilled_data.send_type == this.dataService.VOUCHER_SEND_TYPE_ME ? true : false;

    if (prefilled_data.send_type == this.dataService.VOUCHER_SEND_TYPE_ME) {

      this.F_FIRST_NAME = prefilled_data.info.first_name;
      this.F_LAST_NAME = prefilled_data.info.last_name;
      this.F_EMAIL = prefilled_data.info.email;
    } else {

      this.S_FIRST_NAME = prefilled_data.info.first_name;
      this.S_LAST_NAME = prefilled_data.info.last_name;
      this.S_EMAIL = prefilled_data.info.email;
      this.S_GIFTEE_EMAIL = prefilled_data.info.giftee_email;
      this.S_GIFTEE_EMAIL_MESSAGE = prefilled_data.info.giftee_email_message;
    }


  }

  async selectPrice(price_id: any) {

    for (let price_detail of this.PRICE_LIST) price_detail.is_active = price_detail.id == price_id ? true : false;
    this.SELECTED_PRICE = this.PRICE_LIST.filter(data => data.id == price_id);

    if (this.SELECTED_PRICE[0].is_button == true) this.CUSTOM_PRICE = '';

  }


  async confirm() {
    // if (!this.IS_LOGIN) {
    //   this.auth.buildAuthorizeUrl().subscribe({
    //       next: async (url) => {
    //           Browser.open({ url, windowName: '_self' }).then(async () => {
    //               const isLoggedIn = await this.checkLogin(); // Await the promise
    //               if (isLoggedIn) {
    //                   this.router.navigate(['/buy-a-voucher']); // If login succeeded
    //               } else {
    //                   console.error('Login failed, redirecting to login page');
    //                   this.router.navigate(['/login']);
    //               }
    //           });
    //       },
    //       error: (err) => {
    //           console.error('Error during login:', err);
    //           this.router.navigate(['/login']); // Redirect on error
    //       }
    //   });
    // } else {
    //     this.router.navigate(['/buy-a-voucher']); // User already logged in
    // }




    let validate_email = /\S+@\S+\.\S+/;

    let data: any = {};

    this.SELECTED_PRICE = this.PRICE_LIST.filter(data => data.is_active == true);

    if (this.SELECTED_PRICE.length == 0) return await this.apiData.presentAlert("Please select price first")

    if (this.SELECTED_PRICE[0].is_button == false) {

      data.price = this.CUSTOM_PRICE;
    } else {

      data.price = this.SELECTED_PRICE[0].price
    }

    data.selected_price_id = this.SELECTED_PRICE[0].id;


    if (this.SEND_TO_ME) {

      if (this.F_FIRST_NAME.trim() == '') return await this.apiData.presentAlert("First name can't be empty")
      if (this.F_LAST_NAME.trim() == '') return await this.apiData.presentAlert("Last name can't be empty")
      if (this.F_EMAIL.trim() == '') return await this.apiData.presentAlert("Email can't be empty")
      if (!validate_email.test(this.F_EMAIL)) return await this.apiData.presentAlert("Invalid email")

      data.send_type = this.dataService.VOUCHER_SEND_TYPE_ME;
      data.info = {
        first_name: this.F_FIRST_NAME,
        last_name: this.F_LAST_NAME,
        email: this.F_EMAIL,
      }

    } else {

      if (this.S_FIRST_NAME.trim() == '') return await this.apiData.presentAlert("First name can't be empty")
      if (this.S_LAST_NAME.trim() == '') return await this.apiData.presentAlert("Last name can't be empty")
      if (this.S_EMAIL.trim() == '') return await this.apiData.presentAlert("Email can't be empty")
      if (!validate_email.test(this.S_EMAIL)) return await this.apiData.presentAlert("Invalid email")
      if (this.S_GIFTEE_EMAIL.trim() == '') return await this.apiData.presentAlert("Giftee email can't be empty")
      if (!validate_email.test(this.S_GIFTEE_EMAIL)) return await this.apiData.presentAlert("Invalid giftee email")
      if (this.S_GIFTEE_EMAIL_MESSAGE.trim() == '') return await this.apiData.presentAlert("Giftee message can't be empty")

      data.send_type = this.dataService.VOUCHER_SEND_TYPE_SOME_ELSE;
      data.info = {
        first_name: this.S_FIRST_NAME,
        last_name: this.S_LAST_NAME,
        email: this.S_EMAIL,
        giftee_email: this.S_GIFTEE_EMAIL,
        giftee_email_message: this.S_GIFTEE_EMAIL_MESSAGE,
      }
    }
    await this.dataService.setVoucherData(data);
    if (!this.IS_LOGIN) {
      this.auth.loginWithRedirect({
        appState: { target: '/voucher-summary' }
      })
      return;
    }
    this.router.navigate(['/voucher-summary']);


  }
  checkLogin(): Promise<boolean> {
    return new Promise((resolve) => {
      this.auth.getUser().subscribe({
        next: (user_data: any) => {
          this.IS_LOGIN = user_data !== undefined;
          resolve(this.IS_LOGIN);  // Resolves the promise with login state
        },
        error: (err) => {
          console.error('Error checking login status:', err);
          this.IS_LOGIN = false;
          resolve(this.IS_LOGIN);  // Resolves with false on error
        }
      });
    });
  }

  navigation() {

    this.router.navigate(['/']);
  }

}
