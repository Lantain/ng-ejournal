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
import { GroupService } from '../services/group.service';
import { toFormatedDateString } from '../utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RecordFormComponent } from './record-form.component';

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
      <app-record (remove)="removeRecord(record.id)" [record]="record"></app-record>
      }
    </div>
    }
  `,
})
export class AddRecordsComponent {
  records = input.required<AppRecord[]>();
  recordCreated = output<void>();
  onRemoveRecord = output<number>();
  private recordService = inject(RecordService);
  private snackBar = inject(MatSnackBar);

  selectedDateValue = model<Date | null>(null);

  formattedSelectedDay = computed(() => {
    const selectedDate = this.selectedDateValue();
    return selectedDate ? toFormatedDateString(selectedDate) : null;
  });

  dayRecords = computed(() =>
    this.records().filter((record) => record.date === this.formattedSelectedDay())
  );

  onFormSubmit(payload: AddRecordRequest) {
    this.recordService.create(payload as any).subscribe({
      next: (response) => {
        console.log('Record created successfully', response);
        this.snackBar.open('Запис створений успішно', 'Закрити', {
          duration: 4000,
        });
        this.recordCreated.emit();
      },
      error: (err) => {
        console.error('Error creating record', err);
      },
    });
  }

  removeRecord(id: number) {
    this.onRemoveRecord.emit(id);
  }
}
