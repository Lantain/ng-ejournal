import { Routes } from '@angular/router';
import { LoginPage } from './components/login.page';
import { CoursesPage } from './components/courses.page';
import { DashboardLayout } from './components/dashboard.layout';
import { ThemesPage } from './components/themes.page';
import { RecordsPage } from './components/records.page';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardLayout,
    children: [
      {
        path: '',
        redirectTo: 'courses',
        pathMatch: 'full',
      },
      {
        path: 'courses',
        component: CoursesPage,
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
