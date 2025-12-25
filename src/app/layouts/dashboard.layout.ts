import { Component, inject, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SemesterService } from '../services/semester.service';
import { NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Component({
  imports: [
    MatSidenavModule,
    RouterOutlet,
    MatListModule,
    MatIconModule,
    RouterLink,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatButtonToggleModule,
  ],
  providers: [AuthService],
  template: `
    <div class="h-full w-full">
      <mat-toolbar>
        <div class="flex flex-row items-start pr-4 gap-2">
          <button matButton extended [routerLink]="'disciplines'">
            <mat-icon>workspaces</mat-icon>
            Дисципліни
          </button>
          <button matButton extended [routerLink]="'themes'">
            <mat-icon>bookmarks</mat-icon>
            Теми
          </button>
          <button matButton extended [routerLink]="'records'">
            <mat-icon>event_note</mat-icon>
            Записи
          </button>
        </div>
        <span style="flex: 1 1 auto;"></span>
        @if (isRecordsPage()) {
        <div class="flex flex-row items-center mr-4">
          <mat-button-toggle-group
            [value]="semesterService.semester()"
            (change)="semesterService.setSemester($event.value)"
            class="semester-toggles mr-4"
            [class.autumn-active]="semesterService.isAutumn()"
            [class.spring-active]="semesterService.isSpring()"
          >
            <mat-button-toggle [value]="1">Осінній</mat-button-toggle>
            <mat-button-toggle [value]="2">Весняний</mat-button-toggle>
          </mat-button-toggle-group>
        </div>
        }
        <div class="flex flex-col items-end pr-4">
          <p class="font-bold text-sm">{{ user?.name }}</p>
          <p class="text-xs">{{ department?.faculties?.name }}</p>
        </div>
        <button matIconButton [matMenuTriggerFor]="logoutMenu">
          <mat-icon>logout</mat-icon>
        </button>
        <mat-menu #logoutMenu="matMenu">
          <button mat-menu-item (click)="logout()">Вийти</button>
        </mat-menu>
      </mat-toolbar>
      <div class="container mx-auto mt-4">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [
    `
      .semester-toggles.autumn-active {
        --mat-button-toggle-selected-state-background-color: #f5c857;
      }
      .semester-toggles.spring-active {
        --mat-button-toggle-selected-state-background-color: #a3d78a;
      }
    `,
  ],
})
export class DashboardLayout {
  private authService = inject(AuthService);
  private router = inject(Router);
  public semesterService = inject(SemesterService);

  private routeSignal = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  public isRecordsPage = computed(() => this.routeSignal()?.includes('records'));

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get user() {
    return this.authService.getUser();
  }

  get department() {
    const departments = this.user?.departments;
    if (departments) {
      const ds = Array.isArray(departments) ? departments : [departments];
      return ds.length ? ds.at(0) : null;
    } else {
      return null;
    }
  }
}
