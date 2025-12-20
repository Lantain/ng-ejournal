import { Component, inject, signal, computed } from '@angular/core';
import { DisciplineService } from '../services/discipline.service';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../services/auth.service';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { semestr } from '../constants/semestr';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { Discipline } from '../model';
import { toObservable } from '@angular/core/rxjs-interop';
import { DialogDisciplineComponent } from '../components/dialogs/dialog-discipline.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  imports: [
    MatListModule,
    MatCardModule,
    MatDividerModule,
    AsyncPipe,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonToggleModule,
  ],
  providers: [DisciplineService, AuthService],
  template: `
    <mat-card class="p-4 container mx-auto" appearance="outlined">
      <mat-card-header class="mb-4">
        <div class="flex flex-row justify-between w-full items-center ">
          <mat-card-title>Дисципліни</mat-card-title>
          <div>
            <mat-button-toggle-group
              name="semester"
              [value]="selectedSemester()"
              (change)="onSemesterChange($event.value)"
            >
              <mat-button-toggle [value]="null">Всі</mat-button-toggle>
              @for (semester of semesters; track semester.id) {
              <mat-button-toggle [value]="semester.id">{{ semester.name }}</mat-button-toggle>
              }
            </mat-button-toggle-group>
          </div>
          <div>
            <button (click)="openCreateDialog()" mat-stroked-button color="primary">
              <mat-icon>add</mat-icon>
              Додати
            </button>
          </div>
        </div>
      </mat-card-header>
      @if (filtereddisciplines$ | async; as courses) {
      <mat-list>
        @for (course of courses; track course.id) {
        <mat-list-item class="my-2 w-full">
          <div class="flex flex-row justify-between w-full">
            <div class="flex-1 pr-8 md:w-10/12 w-8/12 flex flex-row">
              <div class="w-12 flex items-center justify-start">
                <mat-icon
                  [class]="course.semesters.id === 1 ? 'autumn-icon' : 'spring-icon'"
                  [matTooltip]="course.semesters.name"
                  >eco_leaf</mat-icon
                >
              </div>
              <div class="flex-1">
                <div class="mb-0.5 truncate">{{ course.name }}</div>
                <p class="text-gray-600 text-sm truncate italic w-full">
                  {{ course.departments.name }}
                </p>
              </div>
            </div>
            <div class="md:w-2/12 w-4/12 flex flex-row justify-end items-center">
              <button matIconButton (click)="openEditDialog(course)">
                <mat-icon>edit</mat-icon>
              </button>
              <button matIconButton class="ml-2">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </mat-list-item>
        <mat-divider></mat-divider>
        }
      </mat-list>
      }
    </mat-card>
  `,
  styles: `
    .autumn-icon {
      color: #e67e22;
    }
    .autumn-icon svg {
      fill: #e67e22;
    }
    .spring-icon {
      color: #2ecc71;
    }
    .spring-icon svg {
      fill: #2ecc71;
    }
  `,
})
export class DisciplinesPage {
  displayedColumns: string[] = ['id', 'name', 'departments', 'semesters', 'actions'];

  private disciplineService = inject(DisciplineService);
  private authService = inject(AuthService);
  readonly dialog = inject(MatDialog);

  semesters = semestr;
  selectedSemester = signal<number | null>(null);
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  disciplines$ = this.refreshTrigger$.pipe(
    switchMap(() => this.disciplineService.getDisciplinesByUserId(this.authService.getUser()!.id))
  );

  filtereddisciplines$ = combineLatest([
    this.disciplines$,
    toObservable(this.selectedSemester),
  ]).pipe(
    map(([discipline, semester]) => {
      if (semester === null) return discipline;
      return discipline.filter((d: Discipline) => d.semesters.id === semester);
    })
  );

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(DialogDisciplineComponent, {
      data: {},
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.disciplineService.create(result).subscribe((res) => {
          console.log('Discipline created:', res);
          this.refreshDisciplines();
        });
      }
    });
  }

  openEditDialog(discipline: Discipline): void {
    const dialogRef = this.dialog.open(DialogDisciplineComponent, {
      data: {
        discipline,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        const { id, ...payload } = result;
        this.disciplineService.update(id, payload).subscribe((res) => {
          console.log('Discipline updated:', res);
          this.refreshDisciplines();
        });
      }
    });
  }

  refreshDisciplines() {
    this.refreshTrigger$.next();
  }

  onSemesterChange(value: number | null) {
    this.selectedSemester.set(value);
  }
}
