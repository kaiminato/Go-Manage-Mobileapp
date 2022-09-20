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
import { HttpClientModule } from '@angular/common/http';
import { BuyVoucherComponent } from './buy-voucher/buy-voucher.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { AddReviewComponent } from './add-review/add-review.component';
import { CalendarModule } from 'ion2-calendar';
import { FormsModule } from '@angular/forms';
import { AuthModule } from '@auth0/auth0-angular';
import config from '../../capacitor.config';
import { LoginButtonComponent } from './login-button/login-button.component';
import { LogoutButtonComponentComponent } from './logout-button-component/logout-button-component.component';
import { BookNowHeaderComponent } from './book-now-header/book-now-header.component';
import { ProfileComponent } from './profile/profile.component';

const redirectUri = `http://localhost:8100/about-us`;
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
  ],
  imports: [
    BrowserModule, 
    CalendarModule,
    FormsModule,
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule,
    AuthModule.forRoot({
      domain: "go-manage-testing.eu.auth0.com",
      clientId: "4ZAMH2lkhQfxjcKYXF7fN3KihrtlJNkY",
      redirectUri
    }),
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
