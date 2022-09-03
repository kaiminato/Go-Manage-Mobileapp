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
    AddReviewComponent
  ],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,HttpClientModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
