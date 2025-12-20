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
import { Topic, Discipline } from '../../model';
import { AuthService } from '../../services/auth.service';
import { DisciplineService } from '../../services/discipline.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-dialog-theme',
  standalone: true,
  providers: [AuthService],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    AsyncPipe,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode() ? 'Редагувати тему' : 'Створити тему' }}</h2>
    <mat-dialog-content>
      <div class="flex flex-col gap-4 min-w-lg pt-2">
        <mat-form-field class="w-full">
          <mat-label>Дисципліна</mat-label>
          <mat-select [(ngModel)]="disciplineId" required>
            @if (disciplines$ | async; as disciplines) { @for (discipline of disciplines; track
            discipline.id) {
            <mat-option [value]="discipline.id">{{ discipline.name }}</mat-option>
            } }
          </mat-select>
        </mat-form-field>

        <mat-form-field class="w-full">
          <mat-label>Назва теми</mat-label>
          <textarea matInput [(ngModel)]="name" required rows="3"></textarea>
        </mat-form-field>
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
export class DialogThemeComponent {
  readonly dialogRef = inject(MatDialogRef<DialogThemeComponent>);
  readonly authService = inject(AuthService);
  readonly disciplineService = inject(DisciplineService);
  readonly data = inject<{ theme?: Topic }>(MAT_DIALOG_DATA);

  readonly disciplines$ = this.disciplineService.getDisciplinesByUserId(
    this.authService.getUser()!.id
  );

  get theme() {
    return this.data?.theme;
  }

  // Signals for form fields
  name = signal(this.theme?.name || '');
  disciplineId = signal<number | null>(this.theme?.discipline_id || null);

  // Computed values
  isEditMode = computed(() => !!this.data?.theme);
  isFormValid = computed(() => {
    return this.name().trim() !== '' && this.disciplineId() !== null;
  });

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    const result = {
      name: this.name(),
      discipline_id: this.disciplineId(),
      ...(this.isEditMode() ? { id: this.theme!.id } : {}),
    };

    this.dialogRef.close(result);
  }
}
