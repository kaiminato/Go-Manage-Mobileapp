import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AboutUsComponent } from './about-us/about-us.component';
import { AddReviewComponent } from './add-review/add-review.component';
import { BookingCompleteComponent } from './booking-complete/booking-complete.component';
import { BookingSummaryComponent } from './booking-summary/booking-summary.component';
import { BuyVoucherComponent } from './buy-voucher/buy-voucher.component';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginButtonComponent } from './login-button/login-button.component';
import { LogoutButtonComponentComponent } from './logout-button-component/logout-button-component.component';
import { MakeABookingComponent } from './make-a-booking/make-a-booking.component';
import { ProfileComponent } from './profile/profile.component';
import { SelectTimingComponent } from './select-timing/select-timing.component';
import { StaffServiceDetailsComponent } from './staff-service-details/staff-service-details.component';
import { AuthGuard } from '@auth0/auth0-angular';
import { SelectTimingWithServiceBookingComponent } from './select-timing-with-service-booking/select-timing-with-service-booking.component';
import { SelectStaffWithServiceBookingComponent } from './select-staff-with-service-booking/select-staff-with-service-booking.component';
import { MyBookingListComponent } from './my-booking-list/my-booking-list.component';
import { VoucherSummaryComponent } from './voucher-summary/voucher-summary.component';
import { StoreAllProductComponent } from './store-all-product/store-all-product.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { CartInfoComponent } from './cart-info/cart-info.component';
import { SelectDeliverComponent } from './select-deliver/select-deliver.component';
import { StripeTestComponent } from './stripe-test/stripe-test.component';
import { ContactUsComponent } from './contact-us/contact-us.component';


const routes: Routes = [
  // {
  //   path: 'home',
  //   loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  // },

  
  {
    path: 'home',
    component: HomePageComponent,
    //canActivate: [AuthGuard]
  },
  {
    path: 'make-a-booking',
    component: MakeABookingComponent,
    //canActivate: [AuthGuard]
  },
  {
    path: 'staff-service-details/:id',
    component: StaffServiceDetailsComponent,
    //canActivate: [AuthGuard]
  },
  {
    path: 'select-a-time',
    component: SelectTimingComponent,
    //canActivate: [AuthGuard]
  },
  {
    path: 'booking-summary',
    component: BookingSummaryComponent,
    //canActivate: [AuthGuard]
  },
  {
    path: 'booking-complete',
    component: BookingCompleteComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'buy-a-voucher',
    component: BuyVoucherComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'voucher-summary',
    component: VoucherSummaryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'about-us',
    component: AboutUsComponent,
    // canActivate: [AuthGuard]
  },
  {
    path: 'contact-us',
    component: ContactUsComponent,
    //canActivate: [AuthGuard]
  },
  {
    path: 'add-a-review',
    component: AddReviewComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginButtonComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'logout',
    component: LogoutButtonComponentComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'select-time-with-service-booking',
    component: SelectTimingWithServiceBookingComponent,
    //canActivate: [AuthGuard]
  },

  {
    path: 'select-staff-with-service-booking',
    component: SelectStaffWithServiceBookingComponent,
    //canActivate: [AuthGuard]
  },
  {
    path: 'my-booking-list',
    component: MyBookingListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'store-all-product',
    component: StoreAllProductComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'product-detail/:id',
    component: ProductDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'cart-detail',
    component: CartInfoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'select-deliver',
    component: SelectDeliverComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'stripe',
    component: StripeTestComponent,
  },
  {
    path: '',
    component: HomePageComponent,
    //canActivate: [AuthGuard]
  },
  // {
  //   path: '**',
  //   component: AboutUsComponent
  // },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
