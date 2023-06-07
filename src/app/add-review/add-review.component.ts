import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
  HEADING: string = "Leave a review";
  REVIEW_TEXT: string;
  user_id: number;
  BOOKINGS_DETAILS: any;
  currentRating: number = 0;

  constructor(
    private router: Router,
    private apiData: ApiDataService,
    public imageService: ImageService,
    public dataService: DataService,
    public auth: AuthService,
  ) { }

  ngOnInit() {}
  async ionViewWillEnter() {
    this.getUserInfo();
    this.BOOKINGS_DETAILS = await this.dataService.getInitialBookingdata();
  }
  ionViewDidEnter() {
    this.myTextarea.setFocus();
  }
  async getUserInfo() {
    await this.auth.getUser().subscribe(
      async (response: any) => {
        (await this.apiData.getMyProfile(response.email)).subscribe(
          async (user_info: any) => {
            this.user_id = user_info.userGMID;
          });
      },
      async (error: any) => {
        console.log("this is error",error);
      })
  }
  setRating(rating: number) {
    this.currentRating = rating;
  }
  async addReview() {
    let data = {
      client_id: this.user_id,
      employeeId: this.BOOKINGS_DETAILS.staff_id,
      reviewText: this.REVIEW_TEXT,
      rating: this.currentRating,
    };
    await this.apiData.presentLoading();
    (await this.apiData.addReview(data)).subscribe(
      async (response: any) => {
        await this.apiData.dismiss();
        await this.apiData.presentAlert("Added New Feedback");
        this.REVIEW_TEXT = "";
      },
      async (error: any) => {

        await this.apiData.dismiss();
        await this.apiData.presentAlert("Something Went Wrong. Please try later.");
      }
    );
  }


  navigation() {
    this.router.navigate(['/']);
  }
}
