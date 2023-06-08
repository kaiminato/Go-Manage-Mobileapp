import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { ApiDataService } from '../services/api-data.service';
import { DataService } from '../services/data.service';
import { ImageService } from '../services/image.service';
import { Location } from '@angular/common';
declare var Stripe;

@Component({
  selector: 'app-select-deliver',
  templateUrl: './select-deliver.component.html',
  styleUrls: ['./select-deliver.component.scss'],
})
export class SelectDeliverComponent implements OnInit {

  HEADING: string = "Select delivery";
  DELIVERY: boolean = false;
  SUB_TOTAL: number = 0;
  stripe ;
  card: any;
  EMAIL: any;
  constructor(
    private router: Router,
    private apiData: ApiDataService,
    private dataService: DataService,
    public imageService: ImageService,
    public activatedRoute: ActivatedRoute,
    public auth: AuthService,
    private location: Location,
  ) { }

  ngOnInit() {}
  async ionViewWillEnter(){
    this.SUB_TOTAL = Number(this.activatedRoute.snapshot.paramMap.get('SUB_TOTAL'));
    let owner_data = await this.dataService._getOwnerData();

    if (owner_data) {
      this.stripe = Stripe(owner_data.stripe_publishable_key);
    }
    console.log('owner_data.stripe_publishable_key-----' , owner_data.stripe_publishable_key)
    await this.auth.getUser().subscribe(
      async (response: any) => {
        // Get auth data
        this.EMAIL = response.email;
      },
      (error: any) => {
      }
    );
    await this._setupStripe();
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
          // this._createPayment(result.token.id);
        }
      });
    });
    }


    async _createPayment(token: any) {

      let amount = this.SUB_TOTAL;
      let formData = new FormData();
      console.log("this is eamil", this.EMAIL);
      console.log("this is amount", amount);
      formData.append('email' , this.EMAIL);
      formData.append('token' , token);
      formData.append('amount' , amount.toString());
      formData.append('description' , "Online Store Payment");
      await this.apiData.presentLoading();
      console.log('token----' , token);
      await (await this.apiData._createPayment(formData)).subscribe(
        async (response: any) => {

          console.log('stripe respnose' , response);

          if (response.id) {
            // this.RECIPT_URL = response.receiptUrl;
            await this.apiData.dismiss();
            await this.apiData.presentAlert("Submission Success");
          } else {
            // alert(response.details);

          }
        },
        async (error: any) => {
          // alert('server error');
          await this.apiData.dismiss();
          await this.apiData.presentAlert("Submission Failed");
        }
      );
    }
  navigation() {
    // this.router.navigate(['/cart-detail']);
    this.location.back();
  }
}
