import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';

@Component({
  selector: 'app-buy-voucher',
  templateUrl: './buy-voucher.component.html',
  styleUrls: ['./buy-voucher.component.scss'],
})
export class BuyVoucherComponent implements OnInit {

  HEADING: string = "Buy a Voucher";
  constructor(
    private router: Router,
    private apiData: ApiDataService,
  ) { }

  ngOnInit() {}

  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/']);
  }

}
