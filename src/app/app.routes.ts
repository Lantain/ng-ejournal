import { Routes } from '@angular/router';
import { LoginPage } from './pages/login.page';
import { DisciplinesPage } from './pages/disciplines.page';
import { DashboardLayout } from './layouts/dashboard.layout';
import { ThemesPage } from './pages/themes.page';
import { RecordsPage } from './pages/records.page';

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
