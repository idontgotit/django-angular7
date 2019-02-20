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

  constructor(public httpClient: HttpClient, private authenticationService: AuthenticationService) {

  }

  ngOnInit(): void {
    this.get_data()
    this.displayedColumns = ['select','id', 'tel', 'money_input'];
  }

  get_data() {
    let user_id = localStorage.getItem('user');
    if (user_id) {
      this.API_CLIENT_DATA_TABLE = 'http://127.0.0.1:8000/custom_sale/api/client-table-data/?user=' + user_id;
    } else {
      this.API_CLIENT_DATA_TABLE = 'http://127.0.0.1:8000/custom_sale/api/client-table-data/?user=1';
    }
    this.httpClient.get<Issue[]>(this.API_CLIENT_DATA_TABLE).subscribe((data: any) => {
      this.dataSource = data;
      },
      (error: HttpErrorResponse) => {
        console.log(error.name + ' ' + error.message);
      });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    let temp:any = this.dataSource;
    const numRows = temp.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  updateData() {
    let current_selected = this.selection.selected;
    this.removeSelectedRows(this.dataSource);
    this.dataSourceDict = new MatTableDataSource<Issue>(current_selected);
  }


  export_excel() {
    let EXPORT_API = 'http://127.0.0.1:8000/custom_sale/export_excel';
    this.authenticationService.export_data(this.dataSourceDict.data).subscribe(response => {
        Helper.exportExelFile(response, 'Results');
    });

  }

  removeSelectedRows(table_data) {
    this.selection.selected.forEach(item => {
      let index: number = table_data.findIndex(d => d === item);
      table_data.splice(index, 1);
      this.dataSource = table_data.slice();
      // this.dataSource = new MatTableDataSource<Element>(table_data);
    });
    this.selection = new SelectionModel<Issue>(true, []);
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear()
    } else {
      this.dataSource.data.forEach(row => {
        this.selection.select(row)
      });
    }
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
