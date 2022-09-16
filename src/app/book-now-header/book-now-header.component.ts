import { Component, OnInit , Input ,  Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-book-now-header',
  templateUrl: './book-now-header.component.html',
  styleUrls: ['./book-now-header.component.scss'],
})
export class BookNowHeaderComponent implements OnInit {

  @Output() navigation = new EventEmitter<string>();
  @Input() HEADING_TEXT = '';
  @Input() IS_BACK = '';
  constructor() { }

  ngOnInit() {}

  back() {
    this.navigation.emit();
    console.log('cliked')
  }

}
