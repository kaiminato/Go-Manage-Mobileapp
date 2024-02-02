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
      this.stripe = Stripe(owner_data.stripe_publishable_key ? owner_data.stripe_publishable_key : "pk_test_51LonaPHrqYp23LTOaGG8jWkMsITXNGuJ7vRIvKo28blmVx9C7XtcBT0bfOufKQvfJU6FUNZbiHfgA9cOAfLlMKN300JZWgyFVd");
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
    await this._setupStripe();// Initialize stripe token
  }
  confirm() {
    if (this.STRIPE_FLAG) {
      this.PAYMENT_MODEL_OPEN = true;
    }
    else {
      this.saveBooking();
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
    form.addEventListener('submit', event => {
      event.preventDefault();

      this.stripe.createToken(this.card).then(result => {
        if (result.error) {
          var errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
        } else {
          this._createPayment(result.token.id);
        }
      });
    });
  }

  async _createPayment(token: any) {
    // Hardcoded deposit value
    let amount = 100;
    let formData = new FormData();
    formData.append('email', this.EMAIL);
    formData.append('token', token);
    formData.append('amount', amount.toString());
    formData.append('transactionType', String(1));
    formData.append('description', 'Booking Deposit Payment');
    await this.apiData.presentLoading();

    await (await this.apiData._createPayment(formData)).subscribe(
      async (response: any) => {

        await this.apiData.dismiss();
        if (response.id) {
          this.RECIPT_URL = response.receiptUrl;

          this.BOOKINGS_DETAILS.reciept_url = this.RECIPT_URL;
          await this.dataService.setBookingData(this.BOOKINGS_DETAILS)
          this.saveBooking();

          await this.apiData.presentAlertWithHeader("Payment successful", "Please check your email for further details");
        } else {
          await this.apiData.presentAlertWithHeader("Payment Failed", "Something Went Wrong. Please try later.");
        }
      },
      async (error: any) => {
        await this.apiData.dismiss();
        await this.apiData.presentAlertWithHeader("Payment Failed", "Something Went Wrong. Please try later.");
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
  stdTimezoneOffset(date) {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  }
  isDstObserved(date) {
    return date.getTimezoneOffset() < this.stdTimezoneOffset(date);
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

    let starting_date_time = `${this.BOOKINGS_DETAILS.date}T${this.BOOKINGS_DETAILS.timing_id.value}:00.000`;
    let end_time = await this.addHours(this.BOOKINGS_DETAILS.timing_id.value, this.TOTAL_DURATION);
    let ending_date_time = `${this.BOOKINGS_DETAILS.date}T${end_time}:00.000`;
    let data = [];
    console.clear();

    await this.apiData.presentLoading();

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

              const original_start_time = new Date(start_time);
              const original_end_time = new Date(end_time);
              var daylight_saving_time;
              if (this.isDstObserved(original_start_time)) {
                daylight_saving_time = 1;
              }
              else {
                daylight_saving_time = 0;
              }
              let new_start_time = new Date(original_start_time.setHours(original_start_time.getHours() - daylight_saving_time));
              let new_end_time = new Date(original_end_time.setHours(original_end_time.getHours() - daylight_saving_time));

              let offset = new_start_time.getTimezoneOffset();
              new_start_time = new Date(new_start_time.getTime() - (offset*60*1000));
              offset = new_end_time.getTimezoneOffset()
              new_end_time = new Date(new_end_time.getTime() - (offset*60*1000));
              data.push({
                employeeId: this.BOOKINGS_DETAILS.staff_id,
                clientId: user_info.userGMID,
                description: '',
                endTime: new_end_time.toISOString().slice(0, -5),
                startTime: new_start_time.toISOString().slice(0, -5),
                isAllDay: false,
                customer: null,
                service: service.serviceName,
                serviceId: service.id,
                firstName: this.BOOKINGS_DETAILS.staff_details[0].firstName,
                lastName: this.BOOKINGS_DETAILS.staff_details[0].lastName,
                email: user_info.email,
                phoneNumber: user_info.phoneMobile,
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
