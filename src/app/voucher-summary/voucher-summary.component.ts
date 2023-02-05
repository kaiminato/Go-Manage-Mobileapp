import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { DataService } from '../services/data.service';
import { AuthService } from '@auth0/auth0-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

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
  CANDISMISS: boolean = false;
  form: FormGroup;
  submitted = false;

  constructor(
    private router: Router,
    private apiData: ApiDataService,
    private dataService: DataService,
    public auth: AuthService,
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private alertController: AlertController,
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
    
    await this.formInitialize();

  }

  async ionViewDidLeave () {
    
    
    await this.closeModel();
  }

  async closeModel (){

    this.modalController.dismiss();
  }

  async formInitialize (){

    this.form = this.formBuilder.group({
      caredit_card_number: [null, [Validators.required, Validators.minLength(16) , Validators.maxLength(16) , Validators.pattern('[0-9]*')]],
      credit_month: [null, [Validators.required, Validators.minLength(1) , Validators.maxLength(2) , Validators.pattern('[0-9]*')]],
      caredit_year: [null, [Validators.required, Validators.minLength(4) , Validators.maxLength(4) , Validators.pattern('[0-9]*')]],
      caredit_cvc: [null, [Validators.required, Validators.minLength(3) , Validators.maxLength(3) , Validators.pattern('[0-9]*')]],
      
    });
  }

  async payPayment () {

    this.submitted = true;
    
    // stop here if form is invalid
    if (this.form.invalid) return;
      
    
    
    let data = {
      card_number: this.form.value.caredit_card_number,
      expiry_month: this.form.value.credit_month,
      expiry_year: this.form.value.caredit_year,
      cvc: this.form.value.caredit_cvc,
      amount: this.TOTAL_AMOUNT,
    };


    await this.apiData.presentLoading();

    (await this.apiData.purchaseVoucher(data)).subscribe(
      async (response: any) => {

        await this.apiData.dismiss();

        if (response.code == 200){
          
          await this.alertPresent(response.msg)
        } else {
          await this.apiData.presentAlert(response.msg)
        }
      },
      async (error : any) => {
        await this.apiData.dismiss();
        
        await this.apiData.presentAlert('Please start node js first for payment')
      }
    );

  }

  async alertPresent(msg) {

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Alert',
      message: msg,
      buttons: ['OK']
    }).then((res) => {
      
      res.present();
      res.onDidDismiss().then(async (dis) => {
        await this.dataService.removeVoucherData()
        this.router.navigate(['/'])
      })
    });
  }


  async buy () {
  }

  navigation() {

    this.router.navigate(['/buy-a-voucher']);
  }

}
