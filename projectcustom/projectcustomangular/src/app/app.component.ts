import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  title = 'projectcustomangular';
  private username: string | any;

  constructor(private router: Router,) {
  }

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('is_active');
    localStorage.removeItem('is_staff');
    localStorage.removeItem('is_superuser');
    this.router.navigate(['login']);
  }
}
