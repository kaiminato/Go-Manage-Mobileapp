import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DataService } from '../services/data.service';
import { ApiDataService } from '../services/api-data.service';
import { AuthService } from '@auth0/auth0-angular';
import { AlertController } from '@ionic/angular';
import { Model } from "survey-core";

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss'],
})
export class BookingFormComponent implements OnInit {
  IS_LOGIN: boolean = false;
  PAYMENT_MODEL_OPEN: boolean = false;
  EMAIL: string;
  userGMID: any;
  RECIPT_URL: string = '';
  FORM_ID: any = 0;
  CLIENT_FORM_TEMPLATE: any = {};
  surveyModel: Model;
  CLIENT_FORM: any = {};

  constructor(
    private router: Router,
    private location: Location,
    private dataService: DataService,
    private apiData: ApiDataService,
    private activateRoute: ActivatedRoute,
    public auth: AuthService,
    private alertController: AlertController
  ) { }

  async ngOnInit() { 
    await (this.activateRoute.params
      .subscribe(params => {
        this.FORM_ID = params.hasOwnProperty('formId') ? parseInt(params.formId) : 0;
      }
    ));
    if(this.FORM_ID !== 0) {
      await this.apiData.presentLoading();
      (await this.apiData.getMyProfile(this.EMAIL)).subscribe(
        async (user_info: any) => {
          this.userGMID = user_info.UserGMID;
          await (await this.apiData._getAllClientForms()).subscribe(
            async (response: any) => {
              const matchingItem = response.find(item => item.formId === this.FORM_ID && parseInt(item.clientId) === this.userGMID);
              if(matchingItem !== undefined) {
                if(matchingItem.isFormComplete) {
                  this.presentAlert("You have already filled the form.");
                  await this.apiData.dismiss();
                } else {
                  this.CLIENT_FORM = matchingItem;
                  await (await this.apiData._getAllForms()).subscribe(
                    async (response: any) => {
                      const matchedItem = response.find(item => item.formId === this.FORM_ID);
                      if(matchedItem !== undefined) {
                        this.CLIENT_FORM_TEMPLATE = matchedItem;
                        const survey = new Model(this.CLIENT_FORM_TEMPLATE.content);
                        survey.onComplete.add(this.completeSurvey.bind(this));
                        this.surveyModel = survey;
                      } else {
                        this.presentAlert("Form does not exist.");
                      }
                      await this.apiData.dismiss();
                    },
                    async (error: any) => {
                      await this.apiData.dismiss();
                      alert('Something went wrong on server side. Please try again later')
                    }
                  );
                }
              } else {
                this.presentAlert("Form does not exist.");
                await this.apiData.dismiss();
              }
            },
            async (error: any) => {
              alert('Something went wrong on server side. Please try again later')
            }
          );
        },
        () => {
        }
      );
    }
  }

  async completeSurvey(sender) {
    let clientFormdata = {
      clientId: this.userGMID,
      formData: JSON.stringify(sender.data),
      formId: this.FORM_ID,
      id: this.CLIENT_FORM.id,
    }
    await this.apiData.presentLoading();
    await (await this.apiData._updateClientForm(clientFormdata)).subscribe(
      async (response: any) => {
        this.apiData.dismiss();
      },
      async (error: any) => {
        if (error.status == 200) {
        } else {
          alert('server error');
        }
      }
    )
  }

  async ionViewWillEnter() {
    this.auth.getUser().subscribe(
      async (response: any) => {
        if (response.hasOwnProperty('email')) {
          this.EMAIL = response.email;
        }
        else {
          this.EMAIL = await this.dataService._getUserEmail();
        }

        (await this.apiData.getMyProfile(this.EMAIL)).subscribe(
          async (user_info: any) => {
            this.userGMID = user_info.UserGMID;
            if (user_info.givenName == 'null' || user_info?.givenName == '' || user_info.familyName == 'null' || user_info?.familyName == '' || user_info.givenName == undefined || user_info.familyName == undefined || user_info.phoneMobile == 'null' || user_info.phoneMobile == undefined || user_info.phoneMobile == '') {
              this.presentUserAlert(this.EMAIL);
            } else {
              this._onEnterData();
            }
          },
          () => {
          }
        );
      },
      (error: any) => {
      }
    );
  }

  async _onEnterData() {
    this.activateRoute.params.subscribe((params) => {
      this.FORM_ID = params.hasOwnProperty('formId') ? parseInt(params.formId) : 0;
    });
    await this.checkLogin();
  }

  async _getCurrentDateTime() {

    var currentdate = new Date();

    let year = currentdate.getFullYear();
    let month = (currentdate.getMonth() + 1) < 10 ? "0" + (currentdate.getMonth() + 1) : (currentdate.getMonth() + 1);
    let date = currentdate.getDate() < 10 ? "0" + currentdate.getDate() : currentdate.getDate();
    let hour = currentdate.getHours() < 10 ? "0" + currentdate.getHours() : currentdate.getHours();
    let minutes = currentdate.getMinutes() < 10 ? "0" + currentdate.getMinutes() : currentdate.getMinutes();
    let seconds = currentdate.getSeconds() < 10 ? "0" + currentdate.getSeconds() : currentdate.getSeconds();

    return await `${year}-${month}-${date} ${hour}:${minutes}:${seconds}`;
  }

  async returnDateTimeFormat(date_time) {

    let today_date = new Date(date_time);
    let year: any = today_date.getFullYear();
    let month: any = today_date.getMonth() + 1; // Months start at 0!
    let day: any = today_date.getDate();
    let hours: any = today_date.getHours();
    let minutes: any = today_date.getMinutes();

    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;
    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;

    return await year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':00';
  }

  async checkLogin() {
    await this.auth.getUser().subscribe((user_data: any) => {

      if (user_data !== undefined) {
        this.IS_LOGIN = true;
      }
    });
  }

  async presentUserAlert(email: string) {
    const alert = await this.alertController.create({
      header: 'Please enter your info',
      backdropDismiss: false,
      inputs: [
        {
          label: 'First Name',
          placeholder: 'Enter your first name ',
          name: 'first_name',
        },
        {
          label: 'Last Name',
          placeholder: 'Enter your last name',
          name: 'last_name',
        },
        {
          label: 'Phone',
          placeholder: 'Enter your phone number',
          name: 'phone',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          cssClass: 'danger',
          role: 'cancel',
          handler: () => {
            alert.dismiss();
          }
        },
        {
          text: 'Save',
          cssClass: 'secondary',
          handler: (save_data) => {
            if (
              save_data.first_name.trim() != '' ||
              save_data.last_name.trim() != '' || save_data.phone.trim() != ''
            ) {

              this._updateClient(save_data);

            } else {

              return false;
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async presentAlert(text: string) {
    const alert = await this.alertController.create({
      header: 'Mesage from System',
      backdropDismiss: false,
      message: text,
      buttons: [
        {
          text: 'Go to Home Page',
          handler: () => {
            alert.dismiss();
            this.router.navigate(['/home']);
          }
        },
      ],
    });

    await alert.present();
  }

  async _updateClient(save_data: any) {
    let data = {
      email: this.EMAIL,
      givenName: save_data.first_name,
      familyName: save_data.last_name,
      phoneMobile: save_data.phone,
      userGMID: this.userGMID
    };

    await this.apiData.presentLoading();

    (await this.apiData.updateProfile(data)).subscribe(
      async (response: any) => {
        await this.apiData.dismiss();
        this._onEnterData();
        return true;
      },
      async (error: any) => {
        if (error.status === 200) {
          await this.apiData.dismiss();
          this._onEnterData();
          return true;
        }
        else {
          await this.apiData.dismiss();
          await this.apiData.presentAlert('Server error, Please try again later');
        }

      }
    );
  }

  async formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let str_time = hours + ':' + minutes + ' ' + ampm;
    let str_time_without_space = hours + ':' + minutes + ampm;

    return await {
      with_space_time: str_time,
      without_space_time: str_time_without_space,
    };
  }

  async addHours(time: string, add_duration: number) {
    let [hours, minut] = time.split(':');


    let total_minuts = parseInt(hours) * 60 + parseInt(minut) + add_duration;
    let h: any = ~~(total_minuts / 60);
    let m: any = total_minuts % 60;
    h = h.toString().length == 1 ? '0' + h : h;
    m = m.toString().length == 1 ? '0' + m : m;
    time = `${h}:${m}`;

    return time;
  }

  navigation() {
    this.location.back();
  }
}
