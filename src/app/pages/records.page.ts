import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RecordService } from '../services/record.service';
import { AuthService } from '../services/auth.service';
import {
  ActivatedRoute,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  NavigationEnd,
  Router,
} from '@angular/router';
import { RecordsStateService } from '../services/records-state.service';
import { MatTabsModule } from '@angular/material/tabs';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Component({
  imports: [
    MatCardModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatTabsModule,
  ],
  providers: [RecordService, AuthService],
  template: `
    <nav mat-tab-nav-bar [tabPanel]="tabPanel">
      <a
        mat-tab-link
        routerLink="add"
        routerLinkActive
        #rlaAdd="routerLinkActive"
        [active]="rlaAdd.isActive"
      >
        Додати запис
      </a>
      <a
        mat-tab-link
        routerLink="list"
        routerLinkActive
        #rlaList="routerLinkActive"
        [active]="rlaList.isActive"
      >
        Перегляд записів
      </a>
      <a
        mat-tab-link
        routerLink="report"
        routerLinkActive
        #rlaReport="routerLinkActive"
        [active]="rlaReport.isActive"
      >
        Звіт
      </a>
      @if (isEditing()) {
      <a mat-tab-link [active]="true"> Редагування </a>
      }
    </nav>
    <mat-tab-nav-panel #tabPanel>
      <div class="mt-4">
        @if (records$ | async) {
        <router-outlet></router-outlet>
        }
      </div>
    </mat-tab-nav-panel>
  `,
})
export class RecordsPage {
  private recordsState = inject(RecordsStateService);
  private router = inject(Router);
  public route = inject(ActivatedRoute);

  records$ = this.recordsState.records$;

  isEditing = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url.includes('/edit/'))
    ),
    { initialValue: this.router.url.includes('/edit/') }
  );
}
