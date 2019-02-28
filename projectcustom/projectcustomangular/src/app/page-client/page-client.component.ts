import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataService} from '../services/data.service';
import {HttpClient} from '@angular/common/http';
import {MatDialog, MatPaginator, MatSort} from '@angular/material';
import {Issue} from '../models/issue';
import {DataSource} from '@angular/cdk/collections';
import {AddDialogComponent} from '../dialogs/add/add.dialog.component';
import {EditDialogComponent} from '../dialogs/edit/edit.dialog.component';
import {DeleteDialogComponent} from '../dialogs/delete/delete.dialog.component';
import {BehaviorSubject, fromEvent, merge, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Router} from "@angular/router";

@Component({
  selector: 'app-page-client',
  templateUrl: './page-client.component.html',
  styleUrls: ['./page-client.component.scss']
})

export class PageClientComponent implements OnInit {
  displayedColumns = ['id', 'tel', 'money_input', 'money_output', 'status', 'note', 'actions'];
  exampleDatabase: DataService | null;
  dataSource: ExampleDataSource | null;
  index: number;
  id: number;
   discount_data: any;
   credit_data: any;
  API_DISCOUNT = 'http://103.35.65.67:8000/custom_sale/api/discount-percentage/';
  API_CLIENT_CREDIT = 'http://103.35.65.67:8000/custom_sale/api/client-credit/';
  API_CLIENT_DATA_TABLE = 'http://103.35.65.67:8000/custom_sale/api/client-table-data/?user=1';
  username: string | any;

  constructor(public httpClient: HttpClient,
              public dialog: MatDialog,
              public dataService: DataService,
              private modalService: NgbModal,
              private router: Router) {
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;

  get_discount() {
    this.httpClient.get(this.API_DISCOUNT).subscribe(data => {
      this.discount_data = data
    });
  }

  get_credit() {
    this.httpClient.get(this.API_CLIENT_CREDIT).subscribe(data => {
      this.credit_data = data[0]
    });
  }

  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'})
  }

  ngOnInit() {
    let user_id = localStorage.getItem('user');
    let is_staff = localStorage.getItem('is_staff');
    let is_superuser = localStorage.getItem('is_superuser');
    this.username = localStorage.getItem('username');
    if (user_id) {
      this.API_CLIENT_CREDIT = 'http://103.35.65.67:8000/custom_sale/api/client-credit/?user=' + user_id;
      this.API_DISCOUNT = 'http://103.35.65.67:8000/custom_sale/api/discount-percentage/?user=' + user_id;
    } else {
      this.router.navigate(['login']);
    }
    if (is_staff == 'false' && is_superuser == 'false'){
      this.displayedColumns = ['id', 'tel', 'money_input', 'money_output', 'status', 'note', 'actions'];
    }else{
      this.displayedColumns = ['id', 'tel', 'money_input', 'money_output', 'status', 'note', 'user_owner'];
    }
    this.loadData();
    this.get_credit();
    this.get_discount();
  }

  refresh() {
    this.loadData();
  }

  addNew(issue: Issue) {
    const dialogRef = this.dialog.open(AddDialogComponent, {
      data: {issue: issue}
    });

    dialogRef.afterClosed().subscribe(
      result => {
        if (result === 1) {
          // After dialog is closed we're doing frontend updates
          // For add we're just pushing a new row inside DataService
          let data = this.dataService.getDialogData();
          if (data.money_input != data.money_output){
            this.exampleDatabase.dataChange.value.push(data);
            this.credit_data.money_input = this.credit_data.money_input - data.money_input;
            this.refreshTable();
          }
        }
      },
      error => {
        console.log('oops', error)
      });
  }


  startEdit(i: number, id: number, tel: string, money_input: string, money_output: string) {
    this.id = id;
    // index row is used just for debugging proposes and can be removed
    this.index = i;
    console.log(this.index);
    const dialogRef = this.dialog.open(EditDialogComponent, {
      data: {id: id, tel: tel, money_input: money_input, money_output: money_output}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        // When using an edit things are little different, firstly we find record inside DataService by id
        const foundIndex = this.exampleDatabase.dataChange.value.findIndex(x => x.id === this.id);
        // Then you update that record using data from dialogData (values you enetered)
        this.exampleDatabase.dataChange.value[foundIndex] = this.dataService.getDialogData();
        // And lastly refresh table
        this.refreshTable();
      }
    });
  }

  deleteItem(i: number, id: number, tel: string, money_input: string) {
    this.index = i;
    this.id = id;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: {id: id, tel: tel, money_input: money_input}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        const foundIndex = this.exampleDatabase.dataChange.value.findIndex(x => x.id === this.id);
        // for delete we use splice in order to remove single object from DataService
        this.exampleDatabase.dataChange.value.splice(foundIndex, 1);
        this.refreshTable();
      }
    });
  }


  private refreshTable() {
    // Refreshing table using paginator
    // Thanks yeager-j for tips
    // https://github.com/marinantonio/angular-mat-table-crud/issues/12
    this.paginator._changePageSize(this.paginator.pageSize);
  }

  public loadData() {
    this.exampleDatabase = new DataService(this.httpClient);
    this.dataSource = new ExampleDataSource(this.exampleDatabase, this.paginator, this.sort);
    fromEvent(this.filter.nativeElement, 'keyup')
    // .debounceTime(150)
    // .distinctUntilChanged()
      .subscribe(() => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
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

export class ExampleDataSource extends DataSource<Issue> {
  _filterChange = new BehaviorSubject('');

  get filter(): string {
    return this._filterChange.value;
  }

  set filter(filter: string) {
    this._filterChange.next(filter);
  }

  filteredData: Issue[] = [];
  renderedData: Issue[] = [];

  constructor(public _exampleDatabase: DataService,
              public _paginator: MatPaginator,
              public _sort: MatSort) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => this._paginator.pageIndex = 0);
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Issue[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this._exampleDatabase.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page
    ];

    this._exampleDatabase.getAllIssues();


    return merge(...displayDataChanges).pipe(map(() => {
        // Filter data
        this.filteredData = this._exampleDatabase.data.slice().filter((issue: Issue) => {
          const searchStr = (issue.tel).toLowerCase();
          return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
        });

        // Sort filtered data
        const sortedData = this.sortData(this.filteredData.slice());

        // Grab the page's slice of the filtered sorted data.
        const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
        this.renderedData = sortedData.splice(startIndex, this._paginator.pageSize);
        return this.renderedData;
      }
    ));
  }

  disconnect() {
  }


  /** Returns a sorted copy of the database data. */
  sortData(data: Issue[]): Issue[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'id':
          [propertyA, propertyB] = [a.id, b.id];
          break;
        case 'tel':
          [propertyA, propertyB] = [a.tel, b.tel];
          break;
        case 'money_input':
          [propertyA, propertyB] = [a.money_input, b.money_input];
          break;
        case 'money_output':
          [propertyA, propertyB] = [a.money_output, b.money_output];
          break;
        case 'status':
          [propertyA, propertyB] = [a.status, b.status];
          break;
        case 'note':
          [propertyA, propertyB] = [a.note, b.note];
          break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
    });
  }
}
