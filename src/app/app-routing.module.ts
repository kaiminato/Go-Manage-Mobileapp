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


const routes: Routes = [
  // {
  //   path: 'home',
  //   loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  // },

  
  {
    path: 'home',
    component: HomePageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'make-a-booking',
    component: MakeABookingComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'staff-service-details/:id',
    component: StaffServiceDetailsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'select-a-time',
    component: SelectTimingComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'booking-summary',
    component: BookingSummaryComponent,
    canActivate: [AuthGuard]
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
    path: 'about-us',
    component: AboutUsComponent,
    canActivate: [AuthGuard]
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
    path: '',
    component: HomePageComponent,
    canActivate: [AuthGuard]
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
