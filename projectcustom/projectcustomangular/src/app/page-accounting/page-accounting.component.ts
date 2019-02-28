import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router"
import {Observable} from 'rxjs';
import cloneDeep from 'lodash/cloneDeep';

@Component({
  selector: 'app-page-accounting',
  templateUrl: './page-accounting.component.html',
  styleUrls: ['./page-accounting.component.scss']
})
export class PageAccountingComponent implements OnInit {
  API_CLIENT_CREDIT = 'http://103.35.65.67:8000/custom_sale/api/client-credit/1/';
  API_DISCOUNT = 'http://103.35.65.67:8000/custom_sale/api/discount-percentage/';
  is_showing_credit: boolean;
  is_showing_discount: boolean;
  current_user: any;
  discount_data: any;
  is_showing_create_user: boolean;
  can_show_credit: boolean;
  all_client_credit: any;
  error_update_credit: boolean;
  clicked: boolean;
  username: string | any;
  old_data_all_client_credit: any;
  error_change_credit: boolean;
  is_showing_revenue: boolean = false;
  API_REVENUE: string;
  current_revenue: any;

  constructor(public httpClient: HttpClient, private router: Router) {

  }

  value_money_input = '';

  get_client_credit() {
    this.httpClient.get(this.API_CLIENT_CREDIT).subscribe((data: any) => {
      this.all_client_credit = data;
      this.all_client_credit.forEach(element => {
        element.money_add = 0
      });
      this.old_data_all_client_credit = cloneDeep(data);
    });
  }

  get_discount() {
    this.httpClient.get(this.API_DISCOUNT).subscribe(data => {
      this.discount_data = data
    });
  }

  get_revenue() {
    let user_id = localStorage.getItem('user');
    this.httpClient.get(this.API_REVENUE, {params:{'user':user_id}}).subscribe(data => {
      this.current_revenue = data[0]
    });
  }
  ngOnInit() {
    let user_id = localStorage.getItem('user');
    let is_staff = localStorage.getItem('is_staff');
    let is_superuser = localStorage.getItem('is_superuser');
    this.username = localStorage.getItem('username');
    this.is_showing_create_user = false;
    this.can_show_credit = false;
    this.error_update_credit = false;
    if (user_id) {
      this.API_CLIENT_CREDIT = 'http://103.35.65.67:8000/custom_sale/api/client-credit/?user_relation=' + user_id;
      this.API_DISCOUNT = 'http://103.35.65.67:8000/custom_sale/api/discount-percentage/?user_relation=' + user_id;
      this.API_REVENUE = 'http://103.35.65.67:8000/custom_sale/api/client-credit-revenue/';
    } else {
      this.router.navigate(['login']);
    }

    if (is_staff == 'false' && is_superuser == 'false') {
      this.router.navigate(['client']);
    }
    if (is_staff == 'true') {
      this.is_showing_create_user = true;
    }
    if (is_staff == 'true' || is_superuser == 'true') {
      this.can_show_credit = true;
    }

    this.get_client_credit();
    this.get_discount();
    this.get_revenue();
    this.is_showing_credit = false;
    this.is_showing_discount = false;
    this.is_showing_revenue = false;
  }

  show_credit() {
    this.is_showing_discount = false;
    this.is_showing_revenue = false;
    this.is_showing_credit = !this.is_showing_credit;
  }

  show_discount() {
    this.is_showing_credit = false;
    this.is_showing_revenue = false;
    this.is_showing_discount = !this.is_showing_discount;
  }

  show_revenue() {
    this.is_showing_credit = false;
    this.is_showing_discount = false;
    this.is_showing_revenue = !this.is_showing_revenue;
  }

  redirect_page(page_name) {
    this.router.navigate([page_name]);
  }

  update(value: string) {
    this.value_money_input = value;
  }

  updateData() {
    if (this.clicked) {
      return
    }
    this.clicked = true;
    this.error_update_credit = false;
    this.error_change_credit = false;
    let total = 0;
    this.all_client_credit.forEach(element => {
      if (element.money_add){
        total += parseFloat(element.money_add);
      }
      // let old_item = this.old_data_all_client_credit.find(x=>x.id == element.id);
      // if (old_item){
      //   if (parseFloat(old_item.money_input) <= parseFloat(element.money_input)){
      //     total += parseFloat(element.money_input);
      //   }else{
      //     this.error_change_credit = true;
      //     this.clicked = false;
      //   }
      // }
    });
    if (total <= 0) {
      this.error_change_credit = true;
      this.clicked = false;
      return
    }

    let user_id = localStorage.getItem('user');
    let API_CHECK_BUDGET = 'http://103.35.65.67:8000/custom_sale/api/client-credit/check_budget';
    this.httpClient.get(API_CHECK_BUDGET, {params: {'total': total.toString(), 'user': user_id}, responseType: 'text'}).subscribe(
      response => {
        this.error_update_credit = false;
        this.all_client_credit.forEach(element => {
          let CURRENT_API = 'http://103.35.65.67:8000/custom_sale/api/client-credit/';
          let current_api = CURRENT_API + element.id + '/';
          this.httpClient.put(current_api, element).subscribe(data => {
          });
        });
        window.location.reload();
        this.clicked = false;
      }, error => {
        if (!this.error_change_credit){
          this.error_update_credit = true;
        }
        this.clicked = false;
      }
    );
  }

  updateDiscount() {
    this.discount_data.forEach(element => {
      let CURRENT_API_DISCOUNT = 'http://103.35.65.67:8000/custom_sale/api/discount-percentage/';
      let current_api = CURRENT_API_DISCOUNT + element.id + '/';
      this.httpClient.put(current_api, element).subscribe(data => {
      });
    });
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('is_active');
    localStorage.removeItem('is_staff');
    localStorage.removeItem('is_superuser');
    this.router.navigate(['login']);
  }


}
