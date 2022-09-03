import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AboutUsComponent } from './about-us/about-us.component';
import { AddReviewComponent } from './add-review/add-review.component';
import { BookingCompleteComponent } from './booking-complete/booking-complete.component';
import { BookingSummaryComponent } from './booking-summary/booking-summary.component';
import { BuyVoucherComponent } from './buy-voucher/buy-voucher.component';
import { HomePageComponent } from './home-page/home-page.component';
import { MakeABookingComponent } from './make-a-booking/make-a-booking.component';
import { SelectTimingComponent } from './select-timing/select-timing.component';
import { StaffServiceDetailsComponent } from './staff-service-details/staff-service-details.component';

const routes: Routes = [
  // {
  //   path: 'home',
  //   loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  // },

  {
    path: 'home',
    component: HomePageComponent
  },
  {
    path: 'make-a-booking',
    component: MakeABookingComponent
  },
  {
    path: 'staff-service-details/:id',
    component: StaffServiceDetailsComponent
  },
  {
    path: 'select-a-time',
    component: SelectTimingComponent
  },
  {
    path: 'booking-summary',
    component: BookingSummaryComponent
  },
  {
    path: 'booking-complete',
    component: BookingCompleteComponent
  },
  {
    path: 'buy-a-voucher',
    component: BuyVoucherComponent
  },
  {
    path: 'about-us',
    component: AboutUsComponent
  },
  {
    path: 'add-a-review',
    component: AddReviewComponent
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
