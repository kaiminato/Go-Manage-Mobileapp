import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { DataService } from '../services/data.service';
import { ImageService } from '../services/image.service';
import { AuthService } from '@auth0/auth0-angular';
import { IonTextarea } from '@ionic/angular';

@Component({
  selector: 'app-add-review',
  templateUrl: './add-review.component.html',
  styleUrls: ['./add-review.component.scss'],
})
export class AddReviewComponent implements OnInit {
  @ViewChild('myTextarea') myTextarea: IonTextarea;
  HEADING: string = "";
  REVIEW_TEXT: string;
  user_id: number;
  BOOKINGS_DETAILS: any;
  currentRating: number = 0;
  STAFF_LIST: any = [];
  STAFF_ID: any = '';
  SELECTED_STAFF_DETAIL:any ;

  selectedOption: any;

  constructor(
    private router: Router,
    private apiData: ApiDataService,
    public imageService: ImageService,
    public dataService: DataService,
    public auth: AuthService,
    private activateRoute: ActivatedRoute
  ) { 
  }

  ngOnInit() { }
  async ionViewWillEnter() {
    this.getUserInfo();
    this.STAFF_ID = this.activateRoute.snapshot.paramMap.get('id');
    this.BOOKINGS_DETAILS = await this.dataService.getInitialBookingdata();
  }
  ionViewDidEnter() {
    this.myTextarea.setFocus();
    this.getStaffList();
  }
  async getUserInfo() {
    await this.auth.getUser().subscribe(
      async (response: any) => {
        (await this.apiData.getMyProfile(response.email)).subscribe(
          async (user_info: any) => {
            this.user_id = user_info.UserGMID;
          });
      },
      async (error: any) => {
        console.log("this is error", error);
      })
  }
  setRating(rating: number) {
    this.currentRating = rating;
  }
  onOptionChange() {
    this.STAFF_ID = this.selectedOption;
    this.SELECTED_STAFF_DETAIL = this.STAFF_LIST.filter(staff => staff.employee_id == this.STAFF_ID)[0];
  }
  async addReview() {
    let data = {
      client_id: this.user_id,
      employeeId: this.SELECTED_STAFF_DETAIL.employee_id,
      reviewText: this.REVIEW_TEXT,
      rating: this.currentRating,
    };
    if((data.reviewText == null || data.reviewText == '') || (data.rating == null || data.rating <= 0)){
      await this.apiData.presentAlertWithHeader("Failed", "Please try to enter into respective fields.");
      return 0;
    }
    await this.apiData.presentLoading();
    (await this.apiData.addReview(data)).subscribe(
      async (response: any) => {
        await this.apiData.dismiss();
        await this.apiData.presentAlertWithHeader("Review Confirmed", "Thanks for your feedback!");
        this.REVIEW_TEXT = "";
        this.currentRating = 0;
      },
      async (error: any) => {

        await this.apiData.dismiss();
        await this.apiData.presentAlertWithHeader("Failed", "Something Went Wrong. Please try later.");
      }
    );
  }

  async getStaffList() {

    await this.apiData.presentLoading();

    await (await this.apiData.getStaffList()).subscribe(
      async (response: any) => {
        await this.apiData.dismiss();
        if (response.length > 0) {
          this.STAFF_LIST = response;
          this.SELECTED_STAFF_DETAIL = this.STAFF_LIST.filter(staff => staff.employee_id == this.STAFF_ID)[0];
          if(this.SELECTED_STAFF_DETAIL == null){
            this.SELECTED_STAFF_DETAIL = this.STAFF_LIST[0];
          }
          this.selectedOption = this.SELECTED_STAFF_DETAIL.employee_id;
        }
      },
      async (error: any) => {
        await this.apiData.dismiss();
        alert(JSON.stringify(error));
      }
    );
  }

  navigation() {
    this.router.navigate(['/']);
  }
}
