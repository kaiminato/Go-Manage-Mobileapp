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
import moment from 'moment';

declare var Stripe;
@Component({
  selector: 'app-booking-summary',
  templateUrl: './booking-summary.component.html',
  styleUrls: ['./booking-summary.component.scss'],
})
export class BookingSummaryComponent implements OnInit {

  // stripe = Stripe('pk_test_51LonaPHrqYp23LTOaGG8jWkMsITXNGuJ7vRIvKo28blmVx9C7XtcBT0bfOufKQvfJU6FUNZbiHfgA9cOAfLlMKN300JZWgyFVd');
  stripe;
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
  STRIPE_FLAG: boolean;
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
  ) { }

  ngOnInit() { }

  async ionViewWillEnter() {

    const customer_email = await this.dataService._getUserEmail();
    let owner_data = await this.dataService._getOwnerData();
    if (owner_data) {
      this.STRIPE_FLAG = owner_data.stripe;
    }

    this.auth.getUser().subscribe(
      async (response: any) => {
        if (response.hasOwnProperty('email')) {
          this.EMAIL = response.email;
        }
        else {
          this.EMAIL = await this.dataService._getUserEmail();
        }

        (await this.apiData.getMyProfile(this.EMAIL)).subscribe(
          async (user_info: any) => {
            this.userGMID = user_info.userGMID;
            if (user_info.givenName == 'null' || user_info?.givenName == '' || user_info.familyName == 'null' || user_info?.familyName == '' || user_info.givenName == undefined || user_info.familyName == undefined || user_info.phoneMobile == 'null' || user_info.phoneMobile == undefined || user_info.phoneMobile == '') {
              this.presentAlert(this.EMAIL);
            } else {
              this._onEnterData();
            }
          },
          () => {
          }
        );
      },
      (error: any) => {
      }
    );

    await (await this.apiData._getStripePublicKey()).subscribe(
      async (response: any) => {
      },
      async (error: any) => {
        if(error.status == 200){
          this.stripe = Stripe(error.error.text);
          await this._setupStripe();// Initialize stripe token
        }else{
          console.log('error-----', error)
        }
      }
    );

    // this.stripe = Stripe("pk_test_51LonaPHrqYp23LTOaGG8jWkMsITXNGuJ7vRIvKo28blmVx9C7XtcBT0bfOufKQvfJU6FUNZbiHfgA9cOAfLlMKN300JZWgyFVd");
    //       await this._setupStripe();// Initialize stripe token
    
    
  }
  confirm() {
    if (this.STRIPE_FLAG) {
      this.PAYMENT_MODEL_OPEN = true;
    }
    else {
      this._createBookingWithPayment("");
    }
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


    this.STARTING_TIME = `${start_time}${am_pm}`;

    for (let service of this.BOOKINGS_DETAILS.servises) {
      this.TOTAL_DURATION += service.serviceDuration;
      this.TOTAL_AMOUNT += service.servicePrice;
    }

    let owner_details = await this.dataService._getOwnerData();

    this.STUDIO_NAME = owner_details != '' ? owner_details['site_name'] + " " + owner_details['businessAddress'] : '';

    let [year, month, day] = this.BOOKINGS_DETAILS.date.split('-');
    let new_date = new Date(this.BOOKINGS_DETAILS.date);
    let get_month_name = await this.dataService.MONTHS_NAME[new_date.getMonth()];

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
          class: 'vijay'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    this.card = elements.create('card', { style: style, hidePostalCode: true });
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
    form.addEventListener('submit', async event => {
      if(this.apiData.isLoading == true)  return;
      await this.apiData.presentLoading();
      event.preventDefault();
      this.stripe.createToken(this.card).then(async result => {
        if (result.error) {
          await this.apiData.dismiss();
          var errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
        } else {
          this._createBookingWithPayment(result.token.id);
        }
      });
      
    });
  }

  async _getCurrentDateTime() {

    var currentdate = new Date();

    let year = currentdate.getFullYear();
    let month = (currentdate.getMonth() + 1) < 10 ? "0" + (currentdate.getMonth() + 1) : (currentdate.getMonth() + 1);
    let date = currentdate.getDate() < 10 ? "0" + currentdate.getDate() : currentdate.getDate();
    let hour = currentdate.getHours() < 10 ? "0" + currentdate.getHours() : currentdate.getHours();
    let minutes = currentdate.getMinutes() < 10 ? "0" + currentdate.getMinutes() : currentdate.getMinutes();
    let seconds = currentdate.getSeconds() < 10 ? "0" + currentdate.getSeconds() : currentdate.getSeconds();

    return await `${year}-${month}-${date} ${hour}:${minutes}:${seconds}`;
  }

  async _createBookingWithPayment(token: any) {
    // Hardcoded deposit value
    let amount = 100;

    if (!this.IS_LOGIN) {
      this.auth.loginWithRedirect({
        appState: { target: '/booking-summary' }
      })
      return;
    }

    let starting_date_time = `${this.BOOKINGS_DETAILS.date}T${this.BOOKINGS_DETAILS.timing_id.value}:00.000`;
    let end_time = await this.addHours(this.BOOKINGS_DETAILS.timing_id.value, this.TOTAL_DURATION);
    let ending_date_time = `${this.BOOKINGS_DETAILS.date}T${end_time}:00.000`;
    let data = [];
    console.clear();

    await this.auth.getUser().subscribe(
      async (response: any) => {
        // Get auth data
        let userEmail;
        if (response.hasOwnProperty('email')) {
          userEmail = response.email;
        }
        else {
          userEmail = await this.dataService._getUserEmail();
        }
        (await this.apiData.getMyProfile(userEmail)).subscribe(
          async (user_info: any) => {
            // Get current user data
            let last_service_end_time = '';
            for (let service of this.BOOKINGS_DETAILS.servises) {
              let start_time = '';
              let end_time = '';

              if (last_service_end_time == '') {
                start_time = `${this.BOOKINGS_DETAILS.date}T${this.BOOKINGS_DETAILS.timing_id.value}:00`;
                last_service_end_time = await this.addHours(this.BOOKINGS_DETAILS.timing_id.value, service.serviceDuration);
                end_time = `${this.BOOKINGS_DETAILS.date}T${last_service_end_time}:00`;
              } else {
                start_time = `${this.BOOKINGS_DETAILS.date}T${last_service_end_time}:00`;
                last_service_end_time = await this.addHours(
                  last_service_end_time,
                  service.serviceDuration
                );
                end_time = `${this.BOOKINGS_DETAILS.date}T${last_service_end_time}:00`;
              }

              const original_start_time = await this.returnDateTimeFormat(start_time);
              const original_end_time = await this.returnDateTimeFormat(end_time);

              data.push({
                //booking data
                employeeId: this.BOOKINGS_DETAILS.staff_id,
                clientId: user_info.userGMID,
                description: '',
                endTime: original_end_time,
                startTime: original_start_time,
                isAllDay: false,
                customer: null,
                service: service.serviceName,
                serviceId: service.id,
                firstName: this.BOOKINGS_DETAILS.staff_details[0].firstName,
                lastName: this.BOOKINGS_DETAILS.staff_details[0].lastName,
                email: user_info.email,
                phoneNumber: user_info.phoneMobile,
                paymentReceipt: this.RECIPT_URL,
                isApp: true, // 1 means booking booked from app side

                //stripe data
                stripeEmail : this.EMAIL,
                token : token,
                amount : amount.toString(),
                transactionType : String(1),
                stripeDescription : 'Booking Deposit Payment'
              });
            }
            (await this.apiData._createBookingWithPayment(data)).subscribe(
              async (response: any) => {
                this.PAYMENT_MODEL_OPEN = false;
                await this.apiData.presentAlertWithHeader("Payment successful", "Please check your email for further details");
                setTimeout(async () => {
                  await this.apiData.dismiss();
                  this.router.navigate(['/booking-complete']);
                }, 300);
              },
              async (error: any) => {
                await this.apiData.dismiss();
                await this.apiData.presentAlertWithHeader("Payment Failed", "Something Went Wrong. Please try later.");
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

  async returnDateTimeFormat(date_time) {

    let today_date = new Date(date_time);
    let year: any = today_date.getFullYear();
    let month: any = today_date.getMonth() + 1; // Months start at 0!
    let day: any = today_date.getDate();
    let hours: any = today_date.getHours();
    let minutes: any = today_date.getMinutes();

    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;
    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;

    return await year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':00';
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
          text: 'Cancel',
          cssClass: 'danger',
          role: 'cancel',
          handler: () => {
            alert.dismiss();
          }
        },
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
        if (error.status === 200) {
          await this.apiData.dismiss();
          this._onEnterData();
          return true;
        }
        else {
          await this.apiData.dismiss();
          await this.apiData.presentAlert('Server error, Please try again later');
        }

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
