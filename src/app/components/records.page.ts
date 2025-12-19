import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RecordService } from '../services/record.service';
import { AuthService } from '../services/auth.service';
import { AddRecordsComponent } from './add-records.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { RecordComponent } from './record.component';
import { RecordsListComponent } from './records-list.component';
import { ReportsComponent } from './reports.component';

@Component({
  imports: [
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatTabGroup,
    MatTab,
    AsyncPipe,
    AddRecordsComponent,
    RecordsListComponent,
    ReportsComponent,
  ],
  providers: [RecordService, AuthService],
  template: `
    <mat-tab-group>
      @if (records$ | async; as records) {
      <mat-tab label="Додати запис">
        <div class="mt-4">
          <app-add-records [records]="records"></app-add-records>
        </div>
      </mat-tab>
      <mat-tab label="Перегляд записів">
        <app-records-list [records]="records"></app-records-list>
      </mat-tab>
      <mat-tab label="Звіт">
        <app-reports [records]="records"></app-reports>
      </mat-tab>
      }
    </mat-tab-group>
  `,
})
export class RecordsPage {
  private recordService = inject(RecordService);
  private authService = inject(AuthService);
  records$ = this.recordService.getByUserId(this.authService.getUser()!.id);
}
