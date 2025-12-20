import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RecordService } from '../services/record.service';
import { AuthService } from '../services/auth.service';
import { AddRecordsComponent } from '../components/add-records.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { RecordsListComponent } from '../components/records-list.component';
import { ReportsComponent } from '../components/reports.component';
import { BehaviorSubject, switchMap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  private snackBar = inject(MatSnackBar);
  records$ = this.refreshTrigger$.pipe(
    switchMap(() => this.recordService.getByUserId(this.authService.getUser()!.id))
  );

  refreshRecords() {
    this.refreshTrigger$.next();
  }

  removeRecord(id: number) {
    if (!confirm('Видалити запис?')) {
      return;
    }
    this.recordService.delete(id).subscribe(() => {
      this.snackBar.open('Запис видалений успішно', 'Закрити', {
        duration: 4000,
      });
      this.refreshRecords();
    });
  }
}
