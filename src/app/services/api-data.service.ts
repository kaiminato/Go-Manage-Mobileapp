import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root'
})
export class ApiDataService {

  constructor(
    private http: HttpClient,
    public loadingController: LoadingController,
    public alertController: AlertController,
    public auth: AuthService,
  ) { }

  token: string = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InNkaklfNkdqWVk1ZkxlMDlhTlZ3MiJ9.eyJpc3MiOiJodHRwczovL2dvLW1hbmFnZS10ZXN0aW5nLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJobWNkbFdQOXVQTjZpZEtXSHFYbEVUNTRJaVRNYVpMTUBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9nby1tYW5hZ2UtdGVzdGluZy5ldS5hdXRoMC5jb20vYXBpL3YyLyIsImlhdCI6MTY2Mzc2MTM3OCwiZXhwIjoxNjY2MzUzMzc4LCJhenAiOiJobWNkbFdQOXVQTjZpZEtXSHFYbEVUNTRJaVRNYVpMTSIsInNjb3BlIjoicmVhZDpjbGllbnRfZ3JhbnRzIGNyZWF0ZTpjbGllbnRfZ3JhbnRzIGRlbGV0ZTpjbGllbnRfZ3JhbnRzIHVwZGF0ZTpjbGllbnRfZ3JhbnRzIHJlYWQ6dXNlcnMgdXBkYXRlOnVzZXJzIGRlbGV0ZTp1c2VycyBjcmVhdGU6dXNlcnMgcmVhZDp1c2Vyc19hcHBfbWV0YWRhdGEgdXBkYXRlOnVzZXJzX2FwcF9tZXRhZGF0YSBkZWxldGU6dXNlcnNfYXBwX21ldGFkYXRhIGNyZWF0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgcmVhZDp1c2VyX2N1c3RvbV9ibG9ja3MgY3JlYXRlOnVzZXJfY3VzdG9tX2Jsb2NrcyBkZWxldGU6dXNlcl9jdXN0b21fYmxvY2tzIGNyZWF0ZTp1c2VyX3RpY2tldHMgcmVhZDpjbGllbnRzIHVwZGF0ZTpjbGllbnRzIGRlbGV0ZTpjbGllbnRzIGNyZWF0ZTpjbGllbnRzIHJlYWQ6Y2xpZW50X2tleXMgdXBkYXRlOmNsaWVudF9rZXlzIGRlbGV0ZTpjbGllbnRfa2V5cyBjcmVhdGU6Y2xpZW50X2tleXMgcmVhZDpjb25uZWN0aW9ucyB1cGRhdGU6Y29ubmVjdGlvbnMgZGVsZXRlOmNvbm5lY3Rpb25zIGNyZWF0ZTpjb25uZWN0aW9ucyByZWFkOnJlc291cmNlX3NlcnZlcnMgdXBkYXRlOnJlc291cmNlX3NlcnZlcnMgZGVsZXRlOnJlc291cmNlX3NlcnZlcnMgY3JlYXRlOnJlc291cmNlX3NlcnZlcnMgcmVhZDpkZXZpY2VfY3JlZGVudGlhbHMgdXBkYXRlOmRldmljZV9jcmVkZW50aWFscyBkZWxldGU6ZGV2aWNlX2NyZWRlbnRpYWxzIGNyZWF0ZTpkZXZpY2VfY3JlZGVudGlhbHMgcmVhZDpydWxlcyB1cGRhdGU6cnVsZXMgZGVsZXRlOnJ1bGVzIGNyZWF0ZTpydWxlcyByZWFkOnJ1bGVzX2NvbmZpZ3MgdXBkYXRlOnJ1bGVzX2NvbmZpZ3MgZGVsZXRlOnJ1bGVzX2NvbmZpZ3MgcmVhZDpob29rcyB1cGRhdGU6aG9va3MgZGVsZXRlOmhvb2tzIGNyZWF0ZTpob29rcyByZWFkOmFjdGlvbnMgdXBkYXRlOmFjdGlvbnMgZGVsZXRlOmFjdGlvbnMgY3JlYXRlOmFjdGlvbnMgcmVhZDplbWFpbF9wcm92aWRlciB1cGRhdGU6ZW1haWxfcHJvdmlkZXIgZGVsZXRlOmVtYWlsX3Byb3ZpZGVyIGNyZWF0ZTplbWFpbF9wcm92aWRlciBibGFja2xpc3Q6dG9rZW5zIHJlYWQ6c3RhdHMgcmVhZDppbnNpZ2h0cyByZWFkOnRlbmFudF9zZXR0aW5ncyB1cGRhdGU6dGVuYW50X3NldHRpbmdzIHJlYWQ6bG9ncyByZWFkOmxvZ3NfdXNlcnMgcmVhZDpzaGllbGRzIGNyZWF0ZTpzaGllbGRzIHVwZGF0ZTpzaGllbGRzIGRlbGV0ZTpzaGllbGRzIHJlYWQ6YW5vbWFseV9ibG9ja3MgZGVsZXRlOmFub21hbHlfYmxvY2tzIHVwZGF0ZTp0cmlnZ2VycyByZWFkOnRyaWdnZXJzIHJlYWQ6Z3JhbnRzIGRlbGV0ZTpncmFudHMgcmVhZDpndWFyZGlhbl9mYWN0b3JzIHVwZGF0ZTpndWFyZGlhbl9mYWN0b3JzIHJlYWQ6Z3VhcmRpYW5fZW5yb2xsbWVudHMgZGVsZXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRzIGNyZWF0ZTpndWFyZGlhbl9lbnJvbGxtZW50X3RpY2tldHMgcmVhZDp1c2VyX2lkcF90b2tlbnMgY3JlYXRlOnBhc3N3b3Jkc19jaGVja2luZ19qb2IgZGVsZXRlOnBhc3N3b3Jkc19jaGVja2luZ19qb2IgcmVhZDpjdXN0b21fZG9tYWlucyBkZWxldGU6Y3VzdG9tX2RvbWFpbnMgY3JlYXRlOmN1c3RvbV9kb21haW5zIHVwZGF0ZTpjdXN0b21fZG9tYWlucyByZWFkOmVtYWlsX3RlbXBsYXRlcyBjcmVhdGU6ZW1haWxfdGVtcGxhdGVzIHVwZGF0ZTplbWFpbF90ZW1wbGF0ZXMgcmVhZDptZmFfcG9saWNpZXMgdXBkYXRlOm1mYV9wb2xpY2llcyByZWFkOnJvbGVzIGNyZWF0ZTpyb2xlcyBkZWxldGU6cm9sZXMgdXBkYXRlOnJvbGVzIHJlYWQ6cHJvbXB0cyB1cGRhdGU6cHJvbXB0cyByZWFkOmJyYW5kaW5nIHVwZGF0ZTpicmFuZGluZyBkZWxldGU6YnJhbmRpbmcgcmVhZDpsb2dfc3RyZWFtcyBjcmVhdGU6bG9nX3N0cmVhbXMgZGVsZXRlOmxvZ19zdHJlYW1zIHVwZGF0ZTpsb2dfc3RyZWFtcyBjcmVhdGU6c2lnbmluZ19rZXlzIHJlYWQ6c2lnbmluZ19rZXlzIHVwZGF0ZTpzaWduaW5nX2tleXMgcmVhZDpsaW1pdHMgdXBkYXRlOmxpbWl0cyBjcmVhdGU6cm9sZV9tZW1iZXJzIHJlYWQ6cm9sZV9tZW1iZXJzIGRlbGV0ZTpyb2xlX21lbWJlcnMgcmVhZDplbnRpdGxlbWVudHMgcmVhZDphdHRhY2tfcHJvdGVjdGlvbiB1cGRhdGU6YXR0YWNrX3Byb3RlY3Rpb24gcmVhZDpvcmdhbml6YXRpb25zX3N1bW1hcnkgcmVhZDpvcmdhbml6YXRpb25zIHVwZGF0ZTpvcmdhbml6YXRpb25zIGNyZWF0ZTpvcmdhbml6YXRpb25zIGRlbGV0ZTpvcmdhbml6YXRpb25zIGNyZWF0ZTpvcmdhbml6YXRpb25fbWVtYmVycyByZWFkOm9yZ2FuaXphdGlvbl9tZW1iZXJzIGRlbGV0ZTpvcmdhbml6YXRpb25fbWVtYmVycyBjcmVhdGU6b3JnYW5pemF0aW9uX2Nvbm5lY3Rpb25zIHJlYWQ6b3JnYW5pemF0aW9uX2Nvbm5lY3Rpb25zIHVwZGF0ZTpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgZGVsZXRlOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyBjcmVhdGU6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyByZWFkOm9yZ2FuaXphdGlvbl9tZW1iZXJfcm9sZXMgZGVsZXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJfcm9sZXMgY3JlYXRlOm9yZ2FuaXphdGlvbl9pbnZpdGF0aW9ucyByZWFkOm9yZ2FuaXphdGlvbl9pbnZpdGF0aW9ucyBkZWxldGU6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIn0.jFgTLOy2BPH-tyX4lGa_dQbL3lQTePy3Fb680ZCLCB3KSeTzRTFhJvSQ2ulq6in85Qz9iIs5PzinfQOCiB5T3orTEbeN5L7r2aeyNnXQY7jRHtgToXcvrRRjsMiVAiRxPaJhfvVgSypSGXtk8cD23t20Fjoi-eC6UzdLbMnVBIrfL5bww4Kz74Y3n1dEzMch_es9eEDUqQl5K4DGDySaUCWGOoHESUMkBB1BC5dsPf0Zyoh-JsMVqUTlhtlKzJYK_rS-qzOo0ubZUULNVCJCnhIoPFmr1q60-Daaqdpd9VuSGogmWG8uckTkrKAtYK8D9RqQp85aLAZCHkN4e-ML4g';
  apiUrl: string = `${environment.auth.apiUri}`;
  isLoading: boolean = false;

  async getStaffList() {

    return await this.http.get(this.apiUrl + 'staff/retrieveStaff');
  }

  async getServiceList() {

    return await this.http.get(this.apiUrl + 'services/retrieveServices');
  }

  async _getBusinessOwnerDetails() {

    return await this.http.get(this.apiUrl + 'settings/getSettings');
  }

  async _getBusinessHoursDetails() {

    return await this.http.get(this.apiUrl + 'settings/getBusinessHours');
  }

  async getStaffBookingList() {

    return await this.http.get(this.apiUrl + 'bookings/retrieveBookings');
  }

  async saveBooking(data: any) {

    return await this.http.post(this.apiUrl + 'bookings/saveBooking', data);
  }

  async getUser() {

    let header = new HttpHeaders().set('Authorization', 'Bearer ' + this.token)
    let url = 'https://go-manage-production.eu.auth0.com/api/v2/users-by-email?email=test@gmail.com'
    return await this.http.get(this.apiUrl + 'user/retrieveUserDetails?email=test@gmail.com', { headers: header });
  }

  async getMyProfile(email: string) {
    //return await this.http.get('https://91.250.249.133:4601/user/retrieveUserDetails?email='+email);
    return await this.http.get(this.apiUrl + 'user/retrieveUserDetails?email=' + email);
  }

  async updateProfile(data: any, email: string) {

    let header = new HttpHeaders().set('Authorization', 'Bearer ' + this.token)
      .set('Cache-Control', 'no-cache')
      .set('Content-Type', 'application/json-patch+json')

    return await this.http.post(this.apiUrl + 'user/updateUserDetails?email=' + email, data, { headers: header, })
  }

  async deleteBooking(id: any) {

    return await this.http.delete(this.apiUrl + 'bookings/deleteBooking/' + id)
  }

  async retrievSingleUserBooking(user_id: any) {

    return await this.http.get(this.apiUrl + 'bookings/retrieveSingleUserBookings?userId=' + user_id);
  }

  async purchaseVoucher(data: any) {

    return await this.http.post('http://localhost:3001/my-testing', data)
  }

  async createPendingAppointment(data: any) {

    return await this.http.post(this.apiUrl + 'bookings/pendingBooking', data)
  }

  async removeUserPendingBoking(user_id: any) {

    return await this.http.get(this.apiUrl + 'bookings/removeUsersPendingBooking?userId=' + user_id);
  }

  async _createPayment(data: any) {

    let header = new HttpHeaders().set('Authorization', 'Bearer ' + this.token)
      .set('Cache-Control', 'no-cache');

    return await this.http.post(this.apiUrl + 'stripe/create-charge', data, { headers: header })
  }


  async _updateUserId() {

    await this.auth.getUser().subscribe(
      async (response: any) => {

        if (response !== undefined) {

          await this.http.get(this.apiUrl + 'user/validateUserExists?email=' + response.email).subscribe(
            (response: any) => { },
            (error: any) => { }
          );

        }
      },
      async (error: any) => {


      })
  }

  async presentLoading() {

    this.isLoading = true;

    return await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',

    }).then((res) => {

      res.present();

      res.onDidDismiss().then((dis) => {

      })
    });

  }

  async dismiss() {

    this.isLoading = false;
    return await this.loadingController.dismiss().then(() => { });
  }


  async presentAlert(message: any) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Alert',
      message: message,
      buttons: ['OK']
    }).then((res) => {

      res.present();
      res.onDidDismiss().then((dis) => {
      })
    });

  }

  async _getProducts() {
    return await this.http.get(this.apiUrl + 'product/retrieveProducts');
  }

  async _getCategories() {
    return await this.http.get(this.apiUrl + 'product/retrieveProductCategory');
  }
  async addReview(data: any) {

    return await this.http.post(this.apiUrl + 'feedBack/addNewFeedback', data);
  }

}
