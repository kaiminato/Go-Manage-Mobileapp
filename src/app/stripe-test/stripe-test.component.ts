import { Component, OnInit } from '@angular/core';
declare var Stripe;
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-stripe-test',
  templateUrl: './stripe-test.component.html',
  styleUrls: ['./stripe-test.component.scss'],
})
export class StripeTestComponent implements OnInit {

  stripe = Stripe('pk_test_51HH3GwGydjsYHNe5yDlVlq7MRy6jQI8R2rftgCrrVbvXybAsdXv2is1JCWJfcHlPwgCdmXEX8Hz9v7rMnrak99w100NQV9mPhU');
  card: any;
  // constructor(private stripe: Stripe) { }
  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.setupStripe();
 }


 setupStripe() {
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

  this.card = elements.create('card', { style: style });
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

    this.stripe.createSource(this.card).then(result => {
      if (result.error) {
        var errorElement = document.getElementById('card-errors');
        errorElement.textContent = result.error.message;
      } else {
        alert('result  ----  ' + result.source.id);
        
      }
    });
  });
}
}
