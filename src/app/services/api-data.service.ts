import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '@auth0/auth0-angular';
import { AuthUserService } from '../AuthUserService';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiDataService {

  constructor(
    private http: HttpClient,
    public loadingController: LoadingController,
    public alertController: AlertController,
    public auth: AuthService,
    public authService: AuthUserService
  ) { }

  apiUrl: string = `${environment.auth.apiUri}`;
  isLoading: boolean = false;

  private addBearerTokenHeader(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const token = this.authService.accessToken;
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      //headers = headers.set('Cache-Control', 'no-cache');

    }
    return headers;
  }

  private async makeRequest(method: string, endpoint: string, data?: any) {
    const requestOptions = {
      headers: this.addBearerTokenHeader()
    };
    switch (method) {
      case 'GET':
        return await this.http.get<any>(endpoint);
      case 'POST':
        return await this.http.post<any>(endpoint, data, requestOptions);
      case 'DELETE':
        return await this.http.delete<any>(endpoint, requestOptions);
      default:
        throw new Error('Invalid HTTP method');
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }

  async getStaffList() {

    return await this.makeRequest('GET', this.apiUrl + 'staff/retrieveStaff');
  }

  async getServiceList() {

    return await this.makeRequest('GET', this.apiUrl + 'services/retrieveServices');
  }

  async _getBusinessOwnerDetails() {
    return await this.makeRequest('GET', this.apiUrl + 'settings/getSettings');
  }

  async _getStripePublicKey() {
    return await this.makeRequest('GET', this.apiUrl + 'settings/getStripePublicKey');
  }

  async _getBusinessHoursDetails() {

    return await this.makeRequest('GET', this.apiUrl + 'settings/getBusinessHours');
  }

  async getStaffBookingList() {

    return await this.makeRequest('GET', this.apiUrl + 'bookings/retrieveBookings');
  }

  async saveBooking(data: any) {

    return await this.makeRequest('POST', this.apiUrl + 'bookings/saveBooking', data);
  }

  async getMyProfile(email: string) {
    return await this.makeRequest('GET', this.apiUrl + 'user/retrieveUserDetails?email=' + email);
  }

  async updateProfile(data: any) {
    const body = JSON.stringify(data);
    return await this.makeRequest('POST', this.apiUrl + 'user/updateUserDetails', body)
  }

  async addUser(data: any) {
    const body = JSON.stringify(data);
    return await this.makeRequest('POST', this.apiUrl + 'user/addUser', body)
  }

  async deleteBooking(id: any) {

    return await this.makeRequest('DELETE', this.apiUrl + 'bookings/deleteBooking/' + id)
  }

  async retrievSingleUserBooking(user_id: any) {
    return await this.makeRequest('GET', this.apiUrl + 'bookings/retrieveSingleUserBookings?userId=' + user_id);
  }

  async purchaseVoucher(data: any) {

    return await this.makeRequest('POST', this.apiUrl +'http://localhost:3001/my-testing', data)
  }

  async addNewVoucher(data: any) {
    return await this.makeRequest('POST', this.apiUrl +'voucher/addNewVoucher', data);
  }

  async sendVoucher(data: any) {
    return await this.makeRequest('POST', this.apiUrl +'send-email/sendVoucher', data);
  }

  async createPendingAppointment(data: any) {

    return await this.makeRequest('POST', this.apiUrl + 'bookings/pendingBooking', data)
  }

  async removeUserPendingBoking(user_id: any) {

    return await this.makeRequest('GET', this.apiUrl + 'bookings/removeUsersPendingBooking?userId=' + user_id);
  }

  async _createPayment(data: any) {
    return this.http.post(this.apiUrl + 'stripe/create-charge', data);
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
  async presentAlertWithHeader(header: any, message: any) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: header,
      message: message,
      buttons: ['OK']
    }).then((res) => {

      res.present();
      res.onDidDismiss().then((dis) => {
      })
    });

  }

  async _getProducts() {
    return await this.makeRequest('GET', this.apiUrl + 'product/retrieveProducts');
  }

  async _getCategories() {
    return await this.makeRequest('GET', this.apiUrl + 'product/retrieveProductCategory');
  }
  async addReview(data: any) {

    return await this.makeRequest('POST', this.apiUrl + 'feedBack/addNewFeedback', data);
  }

  async retrieveClientInformation(clientId:string) {
    return await this.makeRequest('GET', this.apiUrl + 'user/retrieveClientInformation?clientId='+clientId);
  }
}
