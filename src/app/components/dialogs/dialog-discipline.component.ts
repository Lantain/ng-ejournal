import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Discipline } from '../../model';
import { AuthService } from '../../services/auth.service';
import { semestr } from '../../constants/semestr';

@Component({
  selector: 'app-dialog-discipline',
  providers: [AuthService],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode() ? 'Редагувати дисципліну' : 'Створити дисципліну' }}</h2>
    <mat-dialog-content>
      <div class="flex flex-col gap-4 ">
        <mat-form-field class="w-full">
          <mat-label>Кафедра</mat-label>
          <mat-select [disabled]="userDepartments.length === 1" [(ngModel)]="departmentId" required>
            @for (department of userDepartments; track department.id) {
            <mat-option [value]="department.id">{{ department.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field class="w-full">
          <mat-label>Назва дисципліни</mat-label>
          <input matInput [(ngModel)]="name" required />
        </mat-form-field>

        <mat-button-toggle-group [(ngModel)]="semesterId" aria-label="Семестр" class="mb-8">
          @for (semester of semesters; track semester.id) {
          <mat-button-toggle class="px-6" [value]="semester.id"
            >{{ semester.name }} семестр</mat-button-toggle
          >
          }
        </mat-button-toggle-group>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Скасувати</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="!isFormValid()"
        (click)="onSubmit()"
        cdkFocusInitial
      >
        {{ isEditMode() ? 'Зберегти' : 'Створити' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class DialogDisciplineComponent {
  readonly dialogRef = inject(MatDialogRef<DialogDisciplineComponent>);
  readonly authService = inject(AuthService);
  readonly data = inject<{ discipline?: Discipline }>(MAT_DIALOG_DATA);

  readonly semesters = semestr;
  readonly userDepartments = this.authService.getUser()?.departments || [];

  get discipline() {
    return this.data?.discipline;
  }

  // Signals for form fields
  name = signal(this.discipline?.name || '');
  departmentId = signal(
    this.discipline?.department_id
      ? +this.discipline.department_id
      : this.userDepartments.length === 1
      ? this.userDepartments[0].id
      : null
  );
  semesterId = signal(this.discipline?.semester_id || 1);

  // Computed values
  isEditMode = computed(() => !!this.data?.discipline);
  isFormValid = computed(() => {
    return this.name().trim() !== '' && this.departmentId() !== null && this.semesterId() !== null;
  });

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    const result = {
      name: this.name(),
      department_id: this.departmentId()!.toString(),
      semester_id: this.semesterId()!.toString(),
      ...(this.isEditMode() ? { id: this.discipline!.id } : {}),
    };

    this.dialogRef.close(result);
  }
}
