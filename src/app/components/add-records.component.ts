import { Component, computed, inject, input, model, signal, effect, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AddRecordRequest, RecordService } from '../services/record.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { TopicService } from '../services/topic.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Record as AppRecord } from '../model';
import { RecordComponent } from './record.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RecordsStateService } from '../services/records-state.service';
import { Router } from '@angular/router';
import { GroupService } from '../services/group.service';
import { toFormatedDateString } from '../utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RecordFormComponent } from './record-form.component';
import { SemesterService } from '../services/semester.service';
import { RecordFormStateService } from '../services/record-form-state.service';

@Component({
  selector: 'app-add-records',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    RecordComponent,
    ReactiveFormsModule,
    RecordFormComponent,
  ],
  providers: [provideNativeDateAdapter(), TopicService, GroupService],
  template: `
    <app-record-form
      (onFormSubmit)="onFormSubmit($event)"
      (onDateChange)="selectedDateValue.set($event)"
    ></app-record-form>

    @if (dayRecords() && dayRecords().length > 0) {
    <h2 class="mt-8 text-xl">В цей день {{ formattedSelectedDay() }}</h2>
    <div>
      @for (record of dayRecords(); track record.id) {
      <app-record
        (remove)="removeRecord(record.id)"
        (edit)="onEditRecord(record)"
        [record]="record"
      ></app-record>
      }
    </div>
    }
  `,
})
export class AddRecordsComponent {
  private recordsState = inject(RecordsStateService);
  records = this.recordsState.records;

  private recordService = inject(RecordService);
  private snackBar = inject(MatSnackBar);
  private semesterService = inject(SemesterService);
  private router = inject(Router);
  private recordFormState = inject(RecordFormStateService);

  selectedDateValue = model<Date | null>(null);

  formattedSelectedDay = computed(() => {
    const selectedDate = this.selectedDateValue();
    return selectedDate ? toFormatedDateString(selectedDate) : null;
  });

  dayRecords = computed(() =>
    this.records().filter(
      (record) =>
        record.date === this.formattedSelectedDay() &&
        Number(record.semester) === this.semesterService.semester()
    )
  );

  onFormSubmit(payload: AddRecordRequest) {
    this.recordService.create(payload).subscribe({
      next: (response) => {
        console.log('Record created successfully', response);
        this.snackBar.open('Запис створений успішно', 'Закрити', {
          duration: 4000,
        });
        this.recordsState.refresh();
        this.recordFormState.clearState();
      },
      error: (err) => {
        console.error('Error creating record', err);
        this.snackBar.open(err.error.message, 'Закрити', {
          duration: 4000,
        });
      },
    });
  }

  removeRecord(id: number) {
    if (!confirm('Видалити запис?')) {
      return;
    }
    this.recordService.delete(id).subscribe(() => {
      this.snackBar.open('Запис видалений успішно', 'Закрити', {
        duration: 4000,
      });
      this.recordsState.refresh();
    });
  }

  onEditRecord(record: AppRecord) {
    this.router.navigate(['dashboard', 'records', 'edit', record.id]);
  }
}
