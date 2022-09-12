import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AlertController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ApiDataService {

  constructor(
    private http: HttpClient,
    public loadingController: LoadingController,
    public alertController: AlertController,
  ) { }

  apiUrl : string  = `${environment.apiUrl}`;
  isLoading: boolean = false;

  async getStaffList () {

    return await this.http.get(this.apiUrl+'staff/retrieveStaff');
  }

  async getServiceList () {

    return await this.http.get(this.apiUrl+'services/retrieveServices');
  }

  async getStaffBookingList () {

    return await this.http.get(this.apiUrl+'bookings/retrieveBookings');
  }

  async saveBooking (data : any) {

    return await this.http.post(this.apiUrl+'bookings/saveBooking', data);
  }

  async presentLoading() {

    this.isLoading = true;

    return  await this.loadingController.create({
        cssClass: 'my-custom-class',
        message: 'Please wait...',
        
      }).then((res) => {
        
        res.present();
        
        res.onDidDismiss().then((dis) => {
          console.log("loader dismiss");
        })
      });
    
    }

    async dismiss() {
    
      this.isLoading = false;
      return await this.loadingController.dismiss().then(() => console.log('dismissed'));
    }


    async presentAlert(message : any) {
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Alert',
        message: message,
        buttons: ['OK']
      }).then((res) => {
  
        res.present();
        res.onDidDismiss().then((dis) => {
  
          console.log("alert closed");
        })
      });
  
    }
}
