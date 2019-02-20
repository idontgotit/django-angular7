import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router"
@Component({
  selector: 'app-page-accounting',
  templateUrl: './page-accounting.component.html',
  styleUrls: ['./page-accounting.component.scss']
})
export class PageAccountingComponent implements OnInit {
  API_CLIENT_CREDIT = 'http://127.0.0.1:8000/custom_sale/api/client-credit/1/';
  API_DISCOUNT = 'http://127.0.0.1:8000/custom_sale/api/discount-percentage/';
  private is_showing_credit: boolean;
  private is_showing_discount: boolean;
  private current_user: any;
  private discount_data: any;
  private is_showing_create_user: boolean;
  private can_show_credit: boolean;

  constructor(public httpClient: HttpClient, private router: Router) {

  }

  value_money_input = '';

  get_client_credit() {
    this.httpClient.get(this.API_CLIENT_CREDIT).subscribe((data: any) => {
      this.current_user = data;
      this.value_money_input = data.money_input;
    });
  }

  get_discount() {
    this.httpClient.get(this.API_DISCOUNT).subscribe(data => {
      this.discount_data = data
    });
  }

  ngOnInit() {
    let user_id = localStorage.getItem('user');
    let is_staff = localStorage.getItem('is_staff');
    let is_superuser = localStorage.getItem('is_superuser');
    this.is_showing_create_user = false;
    this.can_show_credit = false;
    if (is_staff == 'true') {
      this.is_showing_create_user = true;
    }
    if (is_staff == 'true' || is_superuser == 'true') {
      this.can_show_credit = true;
    }

    if (user_id) {
      this.API_CLIENT_CREDIT = 'http://127.0.0.1:8000/custom_sale/api/client-credit/' + user_id + '/';
      this.API_DISCOUNT = 'http://127.0.0.1:8000/custom_sale/api/discount-percentage/?user_relation=' + user_id ;
    } else {
      this.API_CLIENT_CREDIT = 'http://127.0.0.1:8000/custom_sale/api/client-credit/1/';
    }
    this.get_client_credit();
    this.get_discount()
    this.is_showing_credit = false;
    this.is_showing_discount = false;
  }

  show_credit() {
    this.is_showing_discount = false;
    this.is_showing_credit = !this.is_showing_credit;
  }

  show_discount() {
    this.is_showing_credit = false;
    this.is_showing_discount = !this.is_showing_discount;
  }

  redirect_page(page_name) {
    this.router.navigate([page_name]);
  }

  update(value: string) {
    this.value_money_input = value;
  }

  updateData() {
    this.current_user.money_input = this.value_money_input;
    this.httpClient.put(this.API_CLIENT_CREDIT, this.current_user).subscribe(data => {
    });
  }

  updateDiscount() {
    this.discount_data.forEach(element => {
      let CURRENT_API_DISCOUNT = 'http://127.0.0.1:8000/custom_sale/api/discount-percentage/';
      let current_api = CURRENT_API_DISCOUNT + element.id + '/';
      this.httpClient.put(current_api, element).subscribe(data => {
      });
    });
  }


}
