import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DataService } from '../services/data.service';
import { ImageService } from '../services/image.service';
import { ApiDataService } from '../services/api-data.service';
import { AuthService } from '@auth0/auth0-angular';
import { mergeMap } from 'rxjs/operators';
import { Browser } from '@capacitor/browser';
import { AlertController } from '@ionic/angular';
declare var Stripe;

@Component({
  selector: 'app-booking-summary',
  templateUrl: './booking-summary.component.html',
  styleUrls: ['./booking-summary.component.scss'],
})
export class BookingSummaryComponent implements OnInit {

  // stripe = Stripe('pk_test_51LonaPHrqYp23LTOaGG8jWkMsITXNGuJ7vRIvKo28blmVx9C7XtcBT0bfOufKQvfJU6FUNZbiHfgA9cOAfLlMKN300JZWgyFVd');
  stripe ;
  card: any;

  HEADING: string = '4';
  DATE: string;
  TOTAL_DURATION: any = 0;
  STARTING_TIME: string;
  ENDING_TIME: string;
  STUDIO_NAME: string = '';
  TOTAL_AMOUNT: any = 0;
  BOOKINGS_DETAILS: any;
  BOOKING_WITH_STAFF: any = true;
  CANCEL_BOOKING_ID: number = 0;
  IS_LOGIN: boolean = false;
  PAYMENT_MODEL_OPEN: boolean = false;
  EMAIL: string;
  userGMID: any;
  RECIPT_URL: string = '';

  constructor(
    private router: Router,
    private location: Location,
    private dataService: DataService,
    public imageService: ImageService,
    private apiData: ApiDataService,
    private activateRoute: ActivatedRoute,
    public auth: AuthService,
    private alertController: AlertController
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {


    let owner_data = await this.dataService._getOwnerData();

    if (owner_data) {
      this.stripe = Stripe(owner_data.stripe_publishable_key);
    }
    console.log('owner_data.stripe_publishable_key-----' , owner_data.stripe_publishable_key)
    // await this.apiData._updateUserId();
    await this.auth.getUser().subscribe(
      async (response: any) => {
        // Get auth data
        this.EMAIL = response.email;
        this.userGMID = response.userGMID;
        (await this.apiData.getMyProfile(response.email)).subscribe(
          async (user_info: any) => {
            console.log("this is user_info", user_info);
            if ( user_info.givenName == 'null' || user_info?.givenName == '' || user_info.familyName == 'null' || user_info?.familyName == '' || user_info.givenName == undefined || user_info.familyName == undefined || user_info.phoneMobile == 'null' || user_info.phoneMobile == undefined || user_info.phoneMobile == ''
            ) {
              this.presentAlert(response.email);
            } else {
              this._onEnterData();
            }
          },
          (error: any) => {
          }
        );
      },
      (error: any) => {
      }
    );
    await this._setupStripe();// Initialize stripe token
  }

  async _onEnterData() {
    this.activateRoute.queryParams.subscribe((params) => {
      this.CANCEL_BOOKING_ID = params.hasOwnProperty('id') ? params.id : 0;

    });


    this.BOOKINGS_DETAILS = await this.dataService.getInitialBookingdata();
    this.BOOKING_WITH_STAFF =
      this.BOOKINGS_DETAILS.booking_type == this.dataService.BOOKING_WITH_STAFF
        ? true
        : false;
    if (this.BOOKINGS_DETAILS == '') {
      this.router.navigate(['/']);
      return;
    }

    this.BOOKINGS_DETAILS.staff_details = await this.dataService.getStaffDetail(
      this.BOOKINGS_DETAILS.staff_id
    );
    let shift_timing_details = await this.dataService.getShift(
      this.BOOKINGS_DETAILS.date
    );
    this.BOOKINGS_DETAILS.shift_timing_details =
      await shift_timing_details.filter(
        (data) => data.id == this.BOOKINGS_DETAILS.timing_id.id
      );

    let [start_time, am_pm] = this.BOOKINGS_DETAILS.timing_id.time.split(' ');

      console.log('start_time--' , start_time , 'am_pm--' , am_pm);

    this.STARTING_TIME = `${start_time}${am_pm}`;

    for (let service of this.BOOKINGS_DETAILS.servises) {
      this.TOTAL_DURATION += service.serviceDuration;
      this.TOTAL_AMOUNT += service.servicePrice;
    }

    let owner_details = await this.dataService._getOwnerData();

    this.STUDIO_NAME = owner_details != '' ? owner_details['site_name']+" "+ owner_details['businessAddress'] : '';

    let [year, month, day]  = this.BOOKINGS_DETAILS.date.split('-');
    let new_date            = new Date(this.BOOKINGS_DETAILS.date);
    let get_month_name      = await this.dataService.MONTHS_NAME[new_date.getMonth()];

    this.DATE = `${day} ${get_month_name} ${year}`;

    var now = new Date(`${this.BOOKINGS_DETAILS.date}T${this.BOOKINGS_DETAILS.timing_id.value}:00`);


    now.setMinutes(now.getMinutes() + this.TOTAL_DURATION); // timestamp

    now = new Date(now); // Date object

    let { without_space_time } = await this.formatAMPM(now);
    this.ENDING_TIME = without_space_time;

    await this.checkLogin();
  }

  async _setupStripe() {

    let elements = this.stripe.elements();
    var style = {
      base: {
        color: '#32325d',
        lineHeight: '24px',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
          class:'vijay'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    this.card = elements.create('card', { style: style, hidePostalCode: true });
    //console.log(this.card);
    this.card.mount('#card-element');

    this.card.addEventListener('change', event => {
      var displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });

    var form = document.getElementById('payment-form');
    form.addEventListener('submit', event => {
      event.preventDefault();
      //console.log(event)

      this.stripe.createToken(this.card).then(result => {
        if (result.error) {
          var errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
        } else {
          console.log('result' , result);
          console.log('token' , result.token.id);
          this._createPayment(result.token.id);
        }
      });
    });
    }

    async _createPayment(token: any) {
      let amount = this.TOTAL_AMOUNT;
      let formData = new FormData();
      formData.append('email' , this.EMAIL);
      formData.append('token' , token);
      formData.append('amount' , amount.toString());
      formData.append('transactionType' , String(1));
      formData.append('description' , "Booking Deposit Payment");
      console.log('token----' , token);
      await this.apiData.presentLoading();

      await (await this.apiData._createPayment(formData)).subscribe(
        async (response: any) => {

          console.log('stripe respnose' , response);
          await this.apiData.dismiss();
          if (response.id) {
            this.RECIPT_URL = response.receiptUrl;

            this.BOOKINGS_DETAILS.reciept_url = this.RECIPT_URL;
            await this.dataService.setBookingData(this.BOOKINGS_DETAILS)
            this.saveBooking();

            await this.apiData.presentAlertWithHeader("Payment successful", "Please check your email for further details");
          } else {
            // alert(response.details);
            await this.apiData.presentAlertWithHeader("Payment Failed","Something Went Wrong. Please try later.");
          }
        },
        async (error: any) => {
          console.log("error",error);
          await this.apiData.dismiss();
          await this.apiData.presentAlertWithHeader("Payment Failed","Something Went Wrong. Please try later.");
          // alert('server error');
        }
      );
    }



  async checkLogin() {
    await this.auth.getUser().subscribe((user_data: any) => {

      if (user_data !== undefined) {
        this.IS_LOGIN = true;
      }
    });
  }

  async presentAlert(email: string) {
    const alert = await this.alertController.create({
      header: 'Please enter your info',
      backdropDismiss: false,
      inputs: [
        {
          label: 'First Name',
          placeholder: 'Enter your first name ',
          name: 'first_name',
        },
        {
          label: 'Last Name',
          placeholder: 'Enter your last name',
          name: 'last_name',
        },
        {
          label: 'Phone',
          placeholder: 'Enter your phone number',
          name: 'phone',
        },
      ],
      buttons: [
        {
          text: 'Save',
          cssClass: 'secondary',
          handler: (save_data) => {
            if (
              save_data.first_name.trim() != '' ||
              save_data.last_name.trim() != '' || save_data.phone.trim() != ''
            ) {

              this._updateClient(save_data);

            } else {

              return false;
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async _updateClient(save_data: any) {
    let data = {
      email: this.EMAIL,
      givenName: save_data.first_name,
      familyName: save_data.last_name,
      phoneMobile: save_data.phone,
      userGMID: this.userGMID
    };

    await this.apiData.presentLoading();

    (await this.apiData.updateProfile(data)).subscribe(
      async (response: any) => {
        await this.apiData.dismiss();

        this._onEnterData();
        return true;
      },
      async (error: any) => {
        await this.apiData.dismiss();
        await this.apiData.presentAlert('Server error, Please try again later');

      }
    );
  }

  async formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let str_time = hours + ':' + minutes + ' ' + ampm;
    let str_time_without_space = hours + ':' + minutes + ampm;

    return await {
      with_space_time: str_time,
      without_space_time: str_time_without_space,
    };
  }

  async saveBooking() {

    if (!this.IS_LOGIN) {
      await this.dataService.setPreviousUrl('booking-summary');
      this.auth
        .buildAuthorizeUrl()
        .pipe(mergeMap((url) => Browser.open({ url, windowName: '_self' })))
        .subscribe();

      return;
    }


    await this.dataService.removePreviousUrl();

    let starting_date_time = `${this.BOOKINGS_DETAILS.date}T${this.BOOKINGS_DETAILS.timing_id.value}:00.000Z`;
    let end_time = await this.addHours(this.BOOKINGS_DETAILS.timing_id.value,this.TOTAL_DURATION);
    let ending_date_time = `${this.BOOKINGS_DETAILS.date}T${end_time}:00.000Z`;
    let data = [];
    console.clear();

    await this.apiData.presentLoading();

    await this.auth.getUser().subscribe(
      async (response: any) => {
        // Get auth data

        (await this.apiData.getMyProfile(response.email)).subscribe(
          async (user_info: any) => {
            // Get current user data

            let last_service_end_time = '';
            for (let service of this.BOOKINGS_DETAILS.servises) {
              let start_time = '';
              let end_time = '';

              if (last_service_end_time == '') {
                start_time = `${this.BOOKINGS_DETAILS.date}T${this.BOOKINGS_DETAILS.timing_id.value}:00.000Z`;
                last_service_end_time = await this.addHours(this.BOOKINGS_DETAILS.timing_id.value,service.serviceDuration);
                end_time = `${this.BOOKINGS_DETAILS.date}T${last_service_end_time}:00.000Z`;
              } else {
                start_time = `${this.BOOKINGS_DETAILS.date}T${last_service_end_time}:00.000Z`;
                last_service_end_time = await this.addHours(
                  last_service_end_time,
                  service.serviceDuration
                );
                end_time = `${this.BOOKINGS_DETAILS.date}T${last_service_end_time}:00.000Z`;
              }

              data.push({
                employeeId: this.BOOKINGS_DETAILS.staff_id,
                clientId: user_info.userGMID,
                description: '',
                endTime: end_time,
                startTime: start_time,
                isAllDay: false,
                customer: null,
                service: service.serviceName,
                serviceId: service.id,
                firstName: this.BOOKINGS_DETAILS.staff_details[0].firstName,
                lastName: this.BOOKINGS_DETAILS.staff_details[0].lastName,
                email: user_info.email,
                paymentReceipt: this.RECIPT_URL,
                isApp: true // 1 means booking booked from app side
              });
            }

            (await this.apiData.saveBooking(data)).subscribe(
              async (response: any) => {

                await this.apiData.dismiss();

                setTimeout(() => {
                  this.router.navigate(['/booking-complete']);
                }, 300);
              },
              async (error: any) => {

                await this.apiData.dismiss();
                console.log('error--' , error)

                setTimeout(() => {
                  this.router.navigate(['/booking-complete']);
                }, 300);

                if (this.CANCEL_BOOKING_ID != 0) {
                  await this.deleteBooking();
                }
                setTimeout(() => {
                  this.router.navigate(['/booking-complete']);
                }, 300);
              }
            );
          },

          async (error: any) => {
            await this.apiData.dismiss();

            await this.apiData.presentAlert(
              'profile error' + JSON.stringify(error)
            );
          }
        );
      },
      async (error: any) => {
        await this.apiData.dismiss();

        await this.apiData.presentAlert(
          'auth api error' + JSON.stringify(error)
        );
      }
    );
  }

  async deleteBooking() {
    (await this.apiData.deleteBooking(this.CANCEL_BOOKING_ID)).subscribe(
      async (response: any) => {

      },
      async (error: any) => {

      }
    );
  }

  async addHours(time: string, add_duration: number) {
    let [hours, minut] = time.split(':');


    let total_minuts = parseInt(hours) * 60 + parseInt(minut) + add_duration;
    let h: any = ~~(total_minuts / 60);
    let m: any = total_minuts % 60;
    h = h.toString().length == 1 ? '0' + h : h;
    m = m.toString().length == 1 ? '0' + m : m;
    time = `${h}:${m}`;

    return time;
  }

  navigation() {
    //this.router.navigate(['/select-a-time'])
    this.location.back();
  }
}
