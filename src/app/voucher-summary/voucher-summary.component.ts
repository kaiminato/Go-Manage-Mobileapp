import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { DataService } from '../services/data.service';
import { AuthService } from '@auth0/auth0-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { ImageService } from "../services/image.service";
import { HttpClient } from '@angular/common/http';
declare var Stripe;

@Component({
  selector: 'app-voucher-summary',
  templateUrl: './voucher-summary.component.html',
  styleUrls: ['./voucher-summary.component.scss'],
})
export class VoucherSummaryComponent implements OnInit {

  HEADING: string = "Buy a Voucher";
  TOTAL_AMOUNT: any = 0;
  SEND_REEIPT_TO: string = 'aonghustierney@gmail.com';
  SEND_VOUCHER_TO: string = '';
  Voucher_Code: string = '';
  CANDISMISS: boolean = false;
  PAYMENT_MODEL_OPEN: boolean = false;
  STRIPE_FLAG: boolean;
  PAID: boolean = false;
  form: FormGroup;
  submitted = false;
  EMAIL: string;
  userInfo: any;
  voucherData: any;
  private httpClient: HttpClient;

  stripe;
  card: any;

  constructor(
    private router: Router,
    private apiData: ApiDataService,
    private dataService: DataService,
    public imageService: ImageService,
    public auth: AuthService,
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private alertController: AlertController,
    private http: HttpClient,
  ) { this.httpClient = http; }

  ngOnInit() {
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
      if (this.apiData.isLoading == true) return;
      await this.apiData.presentLoading();
      event.preventDefault();

      this.stripe.createToken(this.card).then(async result => {
        if (result.error) {
          await this.apiData.dismiss();
          var errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
        } else {
          this._createPayment(result.token.id);
        }
      });
    });
  }

  async _createPayment(token: any) {
    let amount = this.voucherData.price * 100;
    let formData = new FormData();
    // formData.append('email', this.EMAIL);
    formData.append('email', this.SEND_REEIPT_TO);
    formData.append('token', token);
    formData.append('amount', amount.toString());
    formData.append('transactionType', String(4));
    formData.append('description', 'Booking Deposit Payment');
    await this.apiData.presentLoading();

    await (await this.apiData._createPayment(formData)).subscribe(
      async (response: any) => {

        await this.apiData.dismiss();
        if (response.id) {
          /*this.RECIPT_URL = response.receiptUrl;

          this.BOOKINGS_DETAILS.reciept_url = this.RECIPT_URL;
          await this.dataService.setBookingData(this.BOOKINGS_DETAILS);
          this.saveBooking();*/
          await this.apiData.presentAlertWithHeader("Payment successful", "Please check your email for further details");
          this.setupVoucher(response);

        } else {
          // alert(response.details);
          await this.apiData.presentAlertWithHeader("Payment Failed", "Something Went Wrong. Please try later.");
        }
      },
      async (error: any) => {
        await this.apiData.dismiss();
        await this.apiData.presentAlertWithHeader("Payment Failed", "Something Went Wrong. Please try later.");
        // alert('server error');
      }
    );
  }

  async ionViewWillEnter() {
    this.voucherData = await this.dataService.getVoucherData();
    await this.apiData.presentLoading();

    let owner_data = await this.dataService._getOwnerData();
    if (owner_data) {
      //this.stripe = Stripe(owner_data.stripe_publishable_key);
      this.STRIPE_FLAG = owner_data.stripe;
    }

    await this.auth.getUser().subscribe(
      async (response: any) => {
        let voucher_data = await this.dataService.getVoucherData();
        (await this.apiData.getMyProfile(response.email)).subscribe(
          async (user_info: any) => {
            this.userInfo = user_info;
          },
          async (error: any) => {
            await this.apiData.dismiss();
          }
        );



        this.TOTAL_AMOUNT = voucher_data.price;
        this.SEND_REEIPT_TO = voucher_data.info.email;
        this.SEND_VOUCHER_TO = response.email;

        await this.apiData.dismiss()
      },
      async (error: any) => {

        await this.apiData.dismiss()
        await this.apiData.presentAlert('server error')
      }
    );
    await (await this.apiData._getStripePublicKey()).subscribe(
      async (response: any) => {
      },
      async (error: any) => {
        if (error.status == 200) {
          this.stripe = Stripe(error.error.text);
          await this._setupStripe();// Initialize stripe token
        } else {
          console.log('error-----', error)
        }
      }
    );
    //await this._setupStripe();// Initialize stripe token
    await this.formInitialize();

  }

  async ionViewDidLeave() {


    await this.closeModel();
  }

  async closeModel() {

    this.modalController.dismiss();
  }

  async formInitialize() {

    this.form = this.formBuilder.group({
      caredit_card_number: [null, [Validators.required, Validators.minLength(16), Validators.maxLength(16), Validators.pattern('[0-9]*')]],
      credit_month: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(2), Validators.pattern('[0-9]*')]],
      caredit_year: [null, [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern('[0-9]*')]],
      caredit_cvc: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(3), Validators.pattern('[0-9]*')]],

    });
  }

  async payPayment() {

    this.submitted = true;

    // stop here if form is invalid
    if (this.form.invalid) return;



    let data = {
      card_number: this.form.value.caredit_card_number,
      expiry_month: this.form.value.credit_month,
      expiry_year: this.form.value.caredit_year,
      cvc: this.form.value.caredit_cvc,
      amount: this.TOTAL_AMOUNT,
    };


    await this.apiData.presentLoading();

    (await this.apiData.purchaseVoucher(data)).subscribe(
      async (response: any) => {

        await this.apiData.dismiss();

        if (response.code == 200) {

          await this.alertPresent(response.msg)
        } else {
          await this.apiData.presentAlert(response.msg)
        }
      },
      async (error: any) => {
        await this.apiData.dismiss();

        await this.apiData.presentAlert('Please start node js first for payment')
      }
    );

  }

  async alertPresent(msg) {

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Alert',
      message: msg,
      buttons: ['OK']
    }).then((res) => {

      res.present();
      res.onDidDismiss().then(async (dis) => {
        await this.dataService.removeVoucherData()
        this.router.navigate(['/'])
      })
    });
  }


  async buy() {
    this.PAYMENT_MODEL_OPEN = true;
  }

  navigation() {

    this.router.navigate(['/buy-a-voucher']);
  }

  async sendEmail(data: any) {

    await (await this.apiData.sendMarketingEmailTemplate(data)).subscribe(
      async (response: any) => {
      },
      async (error: any) => {
        if (error.status == 200) {
          setTimeout(async () => {
            await this.apiData.dismiss();
            this.router.navigate(['/voucher-summary']);
          }, 300);
        } else {
          await this.apiData.dismiss();
          await this.apiData.presentAlert(
            'profile error' + JSON.stringify(error)
          );
        }
      }
    );
  }

  private async setupVoucher(response: any) {
    let today = new Date();
    let fiveYearsFromNow = new Date(today.getFullYear() + 5, today.getMonth(), today.getDate(), 23, 59, 59);
    let f = fiveYearsFromNow.toISOString().split('T')[0];
    let data = [
      {
        initialBalance: this.voucherData.price,
        remainingBalance: this.voucherData.price,
        clientEmail: this.SEND_VOUCHER_TO,
        clientFirstName: this.voucherData.info.first_name,
        clientSurname: '',
        description: 'Gift',
        emailTo: this.SEND_REEIPT_TO,
        expire: f
      }
    ];
    (await this.apiData.addNewVoucher(data)).subscribe(
      async (s: any) => {
        if (Array.isArray(s)) {
          const res = s[0];
          this.PAID = true;
          this.PAYMENT_MODEL_OPEN = false;
          this.Voucher_Code = res.uniqueVoucherCode;

          this.httpClient.get('../../assets/html/template.html', { responseType: 'text' })
            .subscribe(data => {
              var str = data;
              var mapObj = {
                '{{TOTAL_PAYMENT}}': this.voucherData.price,
                '{{VOUCHER_CODE}}': res.uniqueVoucherCode,
              };
              str = str.replace(/{{TOTAL_PAYMENT}}|{{VOUCHER_CODE}}/gi, function (matched) {
                return mapObj[matched];
              });

              let post_data = {
                to: this.SEND_REEIPT_TO,
                subject: "voucher",
                content: str
              };
              this.sendEmail(post_data);
            });

        }
      },
      async (error: any) => {
        await this.apiData.dismiss();

        await this.apiData.presentAlert(
          'profile error' + JSON.stringify(error)
        );

      });
  }
}
