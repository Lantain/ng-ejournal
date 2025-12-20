import { Component, inject, signal, computed } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { TopicService } from '../services/topic.service';
import { AsyncPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { DialogThemeComponent } from '../components/dialogs/dialog-theme.component';
import { Topic, Discipline } from '../model';
import { DisciplineService } from '../services/discipline.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  imports: [
    MatListModule,
    MatCardModule,
    AsyncPipe,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatOptionModule,
  ],
  providers: [TopicService, AuthService, DisciplineService],
  template: `
    <mat-card class="p-4 container mx-auto" appearance="outlined">
      <mat-card-header class="mb-4">
        <div class="flex flex-row justify-between w-full items-center gap-4">
          <mat-card-title>Теми занять</mat-card-title>

          <mat-form-field class="w-5/12 translate-y-2">
            <mat-label>Фільтр за дисципліною</mat-label>
            <mat-select
              [value]="selectedDisciplineId()"
              (selectionChange)="selectedDisciplineId.set($event.value)"
            >
              <mat-option [value]="null">Всі дисципліни</mat-option>
              @if (disciplines$ | async; as disciplines) { @for (discipline of disciplines; track
              discipline.id) {
              <mat-option [value]="discipline.id">{{ discipline.name }}</mat-option>
              } }
            </mat-select>
          </mat-form-field>
          <button (click)="openCreateDialog()" mat-stroked-button color="primary">
            <mat-icon>add</mat-icon>
            Додати
          </button>
        </div>
      </mat-card-header>
      @if (filteredThemes$ | async; as themes) {
      <mat-list>
        @for (theme of themes; track theme.id) {
        <mat-list-item class="my-1 w-full">
          <div class="flex flex-row justify-between w-full">
            <div class="flex-1 pr-8 sm:w-3/4 w-9/12">
              <div class="mb-0.5 truncate">{{ theme.name }}</div>
              <p class="text-sm truncate w-full italic text-gray-600">
                {{ theme.disciplines.name }}
              </p>
            </div>
            <div class="sm:w-1/4 w-3/12 flex flex-row justify-end items-center">
              <button matIconButton (click)="openEditDialog(theme)">
                <mat-icon>edit</mat-icon>
              </button>
              <button matIconButton class="ml-2" (click)="deleteTheme(theme.id)">
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
})
export class ThemesPage {
  private themeService = inject(TopicService);
  private disciplineService = inject(DisciplineService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  private refreshTrigger$ = new BehaviorSubject<void>(undefined);
  selectedDisciplineId = signal<number | null>(null);

  disciplines$ = this.disciplineService.getDisciplinesByUserId(this.authService.getUser()!.id);

  themes$ = this.refreshTrigger$.pipe(
    switchMap(() => this.themeService.getByUserId(this.authService.getUser()!.id))
  );

  filteredThemes$ = combineLatest([this.themes$, toObservable(this.selectedDisciplineId)]).pipe(
    map(([themes, disciplineId]) => {
      if (disciplineId === null) return themes;
      return themes.filter((t: Topic) => t.discipline_id === disciplineId);
    })
  );

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(DialogThemeComponent, {
      data: {},
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.themeService.create(result).subscribe(() => {
          this.refreshThemes();
        });
      }
    });
  }

  openEditDialog(theme: Topic): void {
    const dialogRef = this.dialog.open(DialogThemeComponent, {
      data: { theme },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.themeService.update(result).subscribe(() => {
          this.refreshThemes();
        });
      }
    });
  }

  deleteTheme(id: number): void {
    if (confirm('Ви впевнені, що хочете видалити цю тему?')) {
      this.themeService.delete(id).subscribe(() => {
        this.refreshThemes();
      });
    }
  }

  private refreshThemes() {
    this.themeService.clearTopicsCache();
    this.refreshTrigger$.next();
  }
}
