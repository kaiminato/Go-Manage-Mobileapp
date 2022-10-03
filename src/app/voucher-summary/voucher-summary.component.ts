import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { DataService } from '../services/data.service';
import { AuthService } from '@auth0/auth0-angular';

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
  

  constructor(
    private router: Router,
    private apiData: ApiDataService,
    private dataService: DataService,
    public auth: AuthService,
  ) { }

  ngOnInit() {}

  async ionViewWillEnter () {

    await this.apiData.presentLoading();

    await this.auth.getUser().subscribe(
      async (response: any) => {

        let voucher_data = await this.dataService.getVoucherData();
        this.TOTAL_AMOUNT = voucher_data.price;
        this.SEND_REEIPT_TO = voucher_data.info.email;
        this.SEND_VOUCHER_TO = response.email;

        await this.apiData.dismiss()
      },
      async (error: any) => {

        await this.apiData.dismiss()
        await this.apiData.presentAlert('server error')
      }
    )
    
    

  }


  async buy () {

    console.log('buy a voucer')
  }

  navigation() {

    console.log('back  button is triggered')
    this.router.navigate(['/buy-a-voucher']);
  }

}
