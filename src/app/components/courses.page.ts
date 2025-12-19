import { Component, inject } from '@angular/core';
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

@Component({
  imports: [
    MatListModule,
    MatCardModule,
    MatDividerModule,
    AsyncPipe,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  providers: [DisciplineService, AuthService],
  template: `
    <mat-card class="p-4 container mx-auto" appearance="outlined">
      <mat-card-header class="mb-4">
        <mat-card-title>Courses</mat-card-title>
      </mat-card-header>
      @if (courses$ | async; as courses) {
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
              <button matIconButton><mat-icon>edit</mat-icon></button>
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
export class CoursesPage {
  displayedColumns: string[] = ['id', 'name', 'departments', 'semesters', 'actions'];

  private disciplineService = inject(DisciplineService);
  private authService = inject(AuthService);

  courses$ = this.disciplineService.getDisciplinesByUserId(this.authService.getUser()!.id);
}
