import {Injectable} from '@angular/core';
import {Observable, Subject, asapScheduler, pipe, of, from, interval, merge, fromEvent, BehaviorSubject} from 'rxjs';
import {map, filter, scan} from 'rxjs/operators';
import {User} from "./_models/user";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {catchError, retry} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  LOGIN_URL = 'http://103.35.65.67:8000/custom_sale/login_authenticate';
  REGISTER_URL = 'http://103.35.65.67:8000/custom_sale/create_client_user';
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  is_active: any;
  is_staff: any;
  is_superuser: any;
  private hero: any;
  private options: any;

  constructor(private http: HttpClient) {
  }

  login(username: string, password: string) {
    return this.http.post(this.LOGIN_URL, {username, password})
      .pipe(map((data: any) => {
        if (data.is_active) {
          localStorage.setItem('user', data.user);
          localStorage.setItem('is_active', data.is_active);
          localStorage.setItem('is_staff', data.is_staff);
          localStorage.setItem('is_superuser', data.is_superuser);
          localStorage.setItem('username', data.username);
        }
        // login successful if there's a jwt token in the response
        // if (user && user.token) {
        //   // store user details and jwt token in local storage to keep user logged in between page refreshes
        //   localStorage.setItem('currentUser', JSON.stringify(user));
        //   this.currentUserSubject.next(user);
        // }
        return data;
      }));
  }

  create_user(data: any) {
    return this.http.post(this.REGISTER_URL, {data}).pipe(map((data: any) => {
      return data;
    }));
  }


  export_data(data: any) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.options = {
        observe: 'response',
        responseType: 'arraybuffer'
    };
    let EXPORT_API = 'http://103.35.65.67:8000/custom_sale/export_excel';
    return this.http.post(EXPORT_API, {data}, this.options).pipe(map((data: any) => {
      return data;
    }));
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  complete_execute_data(list_id_complete:any) {
    let user_id = localStorage.getItem('user');
    let current_api = 'http://103.35.65.67:8000/custom_sale/api/client-table-data/complete_execute/';
    return this.http.post(current_api, {
      params: {
        'user': user_id,
        'list_id_complete': list_id_complete
      }
    }).pipe(map((data: any) => {
      return data;
    }));
  }
}
