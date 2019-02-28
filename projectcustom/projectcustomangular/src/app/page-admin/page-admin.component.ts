import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatTable, MatTableDataSource} from '@angular/material';
import {DataSource} from "@angular/cdk/collections";
import {BehaviorSubject, Observable} from "rxjs/index";
import * as FileSaver from 'file-saver';
import {SelectionModel} from '@angular/cdk/collections';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {first, map} from "rxjs/internal/operators";
import {AuthenticationService} from "../api.service";
import {Issue} from "../models/issue";
import {Router} from "@angular/router";

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-page-admin',
  templateUrl: './page-admin.component.html',
  styleUrls: ['./page-admin.component.scss']
})
export class PageAdminComponent implements OnInit {
  private API_CLIENT_DATA_TABLE: string;

  // @ViewChild(MatTable) dataSource: MatTableDataSource<any>;

  displayedColumns: string[] = ['select', 'position', 'name', 'weight', 'symbol'];
  dataSourceDict = new MatTableDataSource<Issue>();
  dataSource = new MatTableDataSource<Issue>();
  selection = new SelectionModel<Issue>(true, []);
  selectionDict = new SelectionModel<Issue>(true, []);
  disabled_arrow_button: boolean = false;
  disabled_complete_button: boolean = true;
  username: string | any;

  constructor(public httpClient: HttpClient, private authenticationService: AuthenticationService, private router: Router) {

  }

  ngOnInit(): void {
    let user_id = localStorage.getItem('user');
    let is_staff = localStorage.getItem('is_staff');
    let is_superuser = localStorage.getItem('is_superuser');
    this.username = localStorage.getItem('username');
    if (user_id) {
    } else {
      this.router.navigate(['login']);
    }
    if (is_staff == 'false' && is_superuser == 'false') {
      this.router.navigate(['client']);
    }
    this.get_data();
    this.displayedColumns = ['select', 'id', 'tel', 'money_input'];
  }

  get_data() {
    let user_id = localStorage.getItem('user');
    if (user_id) {
      this.API_CLIENT_DATA_TABLE = 'http://103.35.65.67:8000/custom_sale/api/client-table-data/';
    } else {
      this.API_CLIENT_DATA_TABLE = 'http://103.35.65.67:8000/custom_sale/api/client-table-data/?user=1';
    }
    this.httpClient.get<Issue[]>(this.API_CLIENT_DATA_TABLE, {
      params: {
        'user': user_id,
        'status': 'not_done'
      }
    }).subscribe((data: any) => {
        this.dataSource.data = data;
      },
      (error: HttpErrorResponse) => {
        console.log(error.name + ' ' + error.message);
      });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    let temp: any = this.dataSource.data;
    const numRows = temp.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  updateData() {
    let current_selected = this.selection.selected;
    this.removeSelectedRows(this.dataSource.data);
    this.dataSourceDict = new MatTableDataSource<Issue>(current_selected);
    if (current_selected.length > 0) {
      this.disabled_arrow_button = true;
      this.disabled_complete_button = false;
    }
  }


  export_excel() {
    let EXPORT_API = 'http://103.35.65.67:8000/custom_sale/export_excel';
    this.authenticationService.export_data(this.dataSourceDict.data).subscribe(response => {
      Helper.exportExelFile(response, 'Results');
    });

  }

  complete_execute() {
    let all_data = this.dataSource.data;
    this.dataSource = new MatTableDataSource<Issue>();
    this.disabled_arrow_button = false;
    let current_dict_selected = this.selectionDict.selected;
    this.removeSelectedRowsDict(this.dataSourceDict.data, this.selectionDict);
    let dict_data: any = this.dataSourceDict.data;
    all_data.push(...dict_data);
    this.dataSource = new MatTableDataSource<Issue>(all_data);
    this.dataSourceDict = new MatTableDataSource<Issue>();
    this.disabled_complete_button = true;
    let user_id = localStorage.getItem('user');
    if (user_id) {
      let id_complete = [];
      current_dict_selected.forEach(item => {
        id_complete.push(item.id)
      });
      this.authenticationService.complete_execute_data(id_complete).subscribe(response => {
      });
    }

  }

  removeSelectedRows(table_data) {
    this.selection.selected.forEach(item => {
      let index: number = table_data.findIndex(d => d === item);
      table_data.splice(index, 1);
      this.dataSource.data = table_data.slice();
      // this.dataSource = new MatTableDataSource<Element>(table_data);
    });
    this.selection = new SelectionModel<Issue>(true, []);
  }

  removeSelectedRowsDict(table_data, selection) {
    selection.selected.forEach(item => {
      let index: number = table_data.findIndex(d => d === item);
      table_data.splice(index, 1);
      this.dataSourceDict.data = table_data.slice();
      // this.dataSource = new MatTableDataSource<Element>(table_data);
    });
    selection = new SelectionModel<Issue>(true, []);
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear()
    } else {
      let data: any = this.dataSource.data;
      data.forEach(row => {
        this.selection.select(row)
      });
    }
  }

  redirect_page(page_name) {
    this.router.navigate([page_name]);
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('is_active');
    localStorage.removeItem('is_staff');
    localStorage.removeItem('is_superuser');
    this.router.navigate(['login']);
  }

}

function exportExelFile(data, filename) {
  const blobValue = new Blob([data['body']], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  FileSaver.saveAs(blobValue, filename + '.xlsx');
}

export const Helper = {
  exportExelFile
};
