import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'conFusion';

  isShow = false;

  toggleDisplay() {
    this.isShow = !this.isShow;
  }
}
