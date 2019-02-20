import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {PageClientComponent} from './page-client/page-client.component';
import {PageAdminComponent} from './page-admin/page-admin.component';
import {PageAccountingComponent} from './page-accounting/page-accounting.component';
import {AuthenticationService} from "./api.service";
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {
  MatButtonModule, MatCheckboxModule, MatDialogModule, MatIconModule, MatInputModule, MatPaginatorModule, MatSortModule,
  MatTableModule, MatToolbarModule,
} from '@angular/material';
import {DataService} from './services/data.service';
import {AddDialogComponent} from './dialogs/add/add.dialog.component';
import {EditDialogComponent} from './dialogs/edit/edit.dialog.component';
import {DeleteDialogComponent} from './dialogs/delete/delete.dialog.component';
import { PageRegisterComponent } from './page-register/page-register.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PageClientComponent,
    PageAdminComponent,
    PageAccountingComponent,
    AddDialogComponent,
    EditDialogComponent,
    DeleteDialogComponent,
    PageRegisterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    NgbModule,
    MatIconModule,
    MatDialogModule,
    MatToolbarModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatDialogModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatCheckboxModule,
  ], entryComponents: [
    AddDialogComponent,
    EditDialogComponent,
    DeleteDialogComponent
  ],
  providers: [AuthenticationService, DataService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
