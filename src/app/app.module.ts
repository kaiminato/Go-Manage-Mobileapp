import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { HomePageComponent } from './home-page/home-page.component';
import { MakeABookingComponent } from './make-a-booking/make-a-booking.component';
import { StaffServiceDetailsComponent } from './staff-service-details/staff-service-details.component';
import { SelectTimingComponent } from './select-timing/select-timing.component';
import { BookingSummaryComponent } from './booking-summary/booking-summary.component';
import { BookingCompleteComponent } from './booking-complete/booking-complete.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BuyVoucherComponent } from './buy-voucher/buy-voucher.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { AddReviewComponent } from './add-review/add-review.component';
import { CalendarModule } from 'ion2-calendar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthHttpInterceptor, AuthModule } from '@auth0/auth0-angular';
import config from '../../capacitor.config';
import { LoginButtonComponent } from './login-button/login-button.component';
import { LogoutButtonComponentComponent } from './logout-button-component/logout-button-component.component';
import { BookNowHeaderComponent } from './book-now-header/book-now-header.component';
import { ProfileComponent } from './profile/profile.component';

import { ApiDataService } from './services/api-data.service';
import { SelectTimingWithServiceBookingComponent } from './select-timing-with-service-booking/select-timing-with-service-booking.component';
import { SelectStaffWithServiceBookingComponent } from './select-staff-with-service-booking/select-staff-with-service-booking.component';
import { MyBookingListComponent } from './my-booking-list/my-booking-list.component';
import { VoucherSummaryComponent } from './voucher-summary/voucher-summary.component';
import { StoreAllProductComponent } from './store-all-product/store-all-product.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { CartInfoComponent } from './cart-info/cart-info.component';
import { SelectDeliverComponent } from './select-deliver/select-deliver.component';
import { StripeTestComponent } from './stripe-test/stripe-test.component';
import { environment } from '../environments/environment';
import { ContactUsComponent } from './contact-us/contact-us.component';

const redirectUri = window.location.origin + `/about-us`;

//alert(redirectUri); 

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomePageComponent,
    MakeABookingComponent,
    StaffServiceDetailsComponent,
    SelectTimingComponent,
    BookingSummaryComponent,
    BookingCompleteComponent,
    BuyVoucherComponent,
    AboutUsComponent,
    AddReviewComponent,
    LoginButtonComponent,
    LogoutButtonComponentComponent,
    BookNowHeaderComponent,
    ProfileComponent,
    SelectTimingWithServiceBookingComponent,
    SelectStaffWithServiceBookingComponent,
    MyBookingListComponent,
    VoucherSummaryComponent,
    StoreAllProductComponent,
    ProductDetailComponent,
    CartInfoComponent,
    SelectDeliverComponent,
    StripeTestComponent,
    ContactUsComponent
  ],
  imports: [
    BrowserModule,
    CalendarModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    AuthModule.forRoot(
      {
        domain: environment.auth.domain,
        clientId: environment.auth.clientId,
        redirectUri,
        cacheLocation: 'localstorage',
        httpInterceptor: {
          allowedList: ['http://localhost:8100'],
        },

      },


    ),
  ],
  providers: [
    ApiDataService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHttpInterceptor,
      multi: true,
    },

    {
      provide: Window,
      useValue: window,
    },

    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
