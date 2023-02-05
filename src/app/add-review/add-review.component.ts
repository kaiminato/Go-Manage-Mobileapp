import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../services/api-data.service';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'app-add-review',
  templateUrl: './add-review.component.html',
  styleUrls: ['./add-review.component.scss'],
})
export class AddReviewComponent implements OnInit {

  HEADING: string = "Leave a review";

  constructor(
    private router: Router,
    private apiData: ApiDataService,
    public imageService: ImageService,
  ) { }

  ngOnInit() {}

  navigation() {
    this.router.navigate(['/']);
  }
}
