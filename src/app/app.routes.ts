import { Routes } from '@angular/router';
import { LoginPage } from './pages/login.page';
import { DisciplinesPage } from './pages/disciplines.page';
import { DashboardLayout } from './layouts/dashboard.layout';
import { ThemesPage } from './pages/themes.page';
import { RecordsPage } from './pages/records.page';
import { AddRecordsComponent } from './components/add-records.component';
import { RecordsListComponent } from './components/records-list.component';
import { ReportsComponent } from './components/reports.component';
import { EditRecordComponent } from './components/edit-record.component';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardLayout,
    children: [
      {
        path: '',
        redirectTo: 'disciplines',
        pathMatch: 'full',
      },
      {
        path: 'disciplines',
        component: DisciplinesPage,
      },
      {
        path: 'themes',
        component: ThemesPage,
      },
      {
        path: 'records',
        component: RecordsPage,
        children: [
          { path: '', redirectTo: 'add', pathMatch: 'full' },
          { path: 'add', component: AddRecordsComponent },
          { path: 'list', component: RecordsListComponent },
          { path: 'report', component: ReportsComponent },
          { path: 'edit/:id', component: EditRecordComponent },
        ],
      },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginPage,
  },
];
