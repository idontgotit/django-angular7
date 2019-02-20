import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PageClientComponent} from "./page-client/page-client.component";
import {PageAdminComponent} from "./page-admin/page-admin.component";
import {PageAccountingComponent} from "./page-accounting/page-accounting.component";
import {LoginComponent} from "./login/login.component";
import {PageRegisterComponent} from "./page-register/page-register.component";

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'client',
    component: PageClientComponent
  },
  {
    path: 'admin',
    component: PageAdminComponent
  },
  {
    path: 'accounting',
    component: PageAccountingComponent
  },
  {
    path: 'register',
    component: PageRegisterComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
