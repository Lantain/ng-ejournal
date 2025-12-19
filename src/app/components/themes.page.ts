import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { TopicService } from '../services/topic.service';
import { AsyncPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  imports: [MatListModule, MatCardModule, AsyncPipe, MatIconModule, MatButtonModule],
  providers: [TopicService],
  template: `
    <mat-card class="p-4 container mx-auto" appearance="outlined">
      <mat-card-header class="mb-4">
        <mat-card-title>Themes</mat-card-title>
      </mat-card-header>
      @if (themes$ | async; as themes) {
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
})
export class ThemesPage {
  private themeService = inject(TopicService);
  private authService = inject(AuthService);

  themes$ = this.themeService.getByUserId(this.authService.getUser()!.id);
}
