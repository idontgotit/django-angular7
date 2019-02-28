import {Injectable, OnInit} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Issue} from '../models/issue';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';

@Injectable()
export class DataService implements OnInit {
  // private readonly API_URL = 'https://api.github.com/repos/angular/angular/issues';
  API_CLIENT_DATA_TABLE = 'http://103.35.65.67:8000/custom_sale/api/client-table-data/?user=1';
  API_PUT_CLIENT_DATA_TABLE = 'http://103.35.65.67:8000/custom_sale/api/client-table-data/';
  dataChange: BehaviorSubject<Issue[]> = new BehaviorSubject<Issue[]>([]);
  // Temporarily stores data from dialogs
  dialogData: any;

  constructor(private httpClient: HttpClient) {
  }

  ngOnInit(): void {
    let user_id = localStorage.getItem('user');
    if (user_id) {
      this.API_CLIENT_DATA_TABLE = 'http://103.35.65.67:8000/custom_sale/api/client-table-data/?user=' + user_id;
    } else {
      this.API_CLIENT_DATA_TABLE = 'http://103.35.65.67:8000/custom_sale/api/client-table-data/?user=1';
    }
  }

  get data(): Issue[] {
    return this.dataChange.value;
  }

  getDialogData() {
    // get correct money output
    let current_data:any = this.dataChange.value;
    if (current_data.money_output) {
      this.dialogData.money_output = current_data.money_output;
    }
    return this.dialogData;
  }

  /** CRUD METHODS */
  getAllIssues(): void {
    let user_id = localStorage.getItem('user');
    let is_staff = localStorage.getItem('is_staff');
    let is_superuser = localStorage.getItem('is_superuser');
    if (user_id) {
      this.API_CLIENT_DATA_TABLE = 'http://103.35.65.67:8000/custom_sale/api/client-table-data/?user=' + user_id;
    }
    this.httpClient.get<Issue[]>(this.API_CLIENT_DATA_TABLE).subscribe((data:any) => {
        this.dataChange.next(data);
      },
      (error: HttpErrorResponse) => {
        console.log(error.name + ' ' + error.message);
      });
  }

  // DEMO ONLY, you can find working methods below
  addIssue(issue: Issue): void {
    let user_id = localStorage.getItem('user');
    if (user_id) {
      this.API_CLIENT_DATA_TABLE = 'http://103.35.65.67:8000/custom_sale/api/client-table-data/?user=' + user_id;
    } else {
      this.API_CLIENT_DATA_TABLE = 'http://103.35.65.67:8000/custom_sale/api/client-table-data/?user=1';
    }
    this.dialogData = issue;
    issue.money_output = issue.money_input;
    return Observable.create(observer => {
      this.httpClient.post<Issue[]>(this.API_CLIENT_DATA_TABLE, issue).subscribe((data: any) => {
          this.dataChange.next(data);
          observer.next("complete");
          observer.complete();
        },
        error => {
          observer.next("oops");
          observer.complete();
        });
    });

  }

  updateIssue(issue: Issue): void {
    this.dialogData = issue;
    issue.report_change = true;
    let api = this.API_PUT_CLIENT_DATA_TABLE + issue.id + '/';
    this.httpClient.put<Issue[]>(api, issue).subscribe(data => {
    });
  }

  deleteIssue(id: number): void {
    console.log(id);
    let api = this.API_PUT_CLIENT_DATA_TABLE + id + '/';
    this.httpClient.delete<Issue[]>(api).subscribe(data => {
    });
  }
}


/* REAL LIFE CRUD Methods I've used in my projects. ToasterService uses Material Toasts for displaying messages:

 // ADD, POST METHOD
 addItem(kanbanItem: KanbanItem): void {
 this.httpClient.post(this.API_URL, kanbanItem).subscribe(data => {
 this.dialogData = kanbanItem;
 this.toasterService.showToaster('Successfully added', 3000);
 },
 (err: HttpErrorResponse) => {
 this.toasterService.showToaster('Error occurred. Details: ' + err.name + ' ' + err.message, 8000);
 });
 }

 // UPDATE, PUT METHOD
 updateItem(kanbanItem: KanbanItem): void {
 this.httpClient.put(this.API_URL + kanbanItem.id, kanbanItem).subscribe(data => {
 this.dialogData = kanbanItem;
 this.toasterService.showToaster('Successfully edited', 3000);
 },
 (err: HttpErrorResponse) => {
 this.toasterService.showToaster('Error occurred. Details: ' + err.name + ' ' + err.message, 8000);
 }
 );
 }

 // DELETE METHOD
 deleteItem(id: number): void {
 this.httpClient.delete(this.API_URL + id).subscribe(data => {
 console.log(data['']);
 this.toasterService.showToaster('Successfully deleted', 3000);
 },
 (err: HttpErrorResponse) => {
 this.toasterService.showToaster('Error occurred. Details: ' + err.name + ' ' + err.message, 8000);
 }
 );
 }
 */




