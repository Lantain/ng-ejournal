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
import { BehaviorSubject, switchMap } from 'rxjs';

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
          <app-add-records
            [records]="records"
            (recordCreated)="refreshRecords()"
            (onRemoveRecord)="removeRecord($event)"
          ></app-add-records>
        </div>
      </mat-tab>
      <mat-tab label="Перегляд записів">
        <app-records-list
          [records]="records"
          (onRemoveRecord)="removeRecord($event)"
        ></app-records-list>
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
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  records$ = this.refreshTrigger$.pipe(
    switchMap(() => this.recordService.getByUserId(this.authService.getUser()!.id))
  );

  refreshRecords() {
    this.refreshTrigger$.next();
  }

  removeRecord(id: number) {
    this.recordService.delete(id).subscribe(() => this.refreshRecords());
  }
}
