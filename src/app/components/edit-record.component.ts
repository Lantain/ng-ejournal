import { Component, inject } from '@angular/core';
import { RecordService } from '../services/record.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordFormComponent } from './record-form.component';
import { RecordsStateService } from '../services/records-state.service';

@Component({
  selector: 'app-edit-record',
  imports: [RecordFormComponent],
  template: ` <div>
    @if (record) {
    <app-record-form [record]="record" (onFormSubmit)="updateRecord($event)"></app-record-form>
    } @else {
    <div class="p-4 text-center text-gray-500">Запис не знайдено</div>
    }
  </div>`,
})
export class EditRecordComponent {
  private recordsState = inject(RecordsStateService);
  private snackBar = inject(MatSnackBar);
  private recordService = inject(RecordService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  get record() {
    return this.recordsState
      .records()
      .find((record) => record.id === +this.route.snapshot.params['id']);
  }

  updateRecord(payload: any) {
    const currentRecord = this.record;
    if (!currentRecord) return;

    this.recordService.update(payload, currentRecord.id).subscribe({
      next: () => {
        this.snackBar.open('Запис оновлено успішно', 'Закрити', { duration: 4000 });
        this.recordsState.refresh();
        this.router.navigate(['dashboard', 'records', 'list']);
      },
      error: (err) => {
        console.error('Error updating record', err);
        this.snackBar.open('Помилка оновлення запису', 'Закрити', { duration: 4000 });
      },
    });
  }
}
