import { Component, OnInit , Input ,  Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

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
