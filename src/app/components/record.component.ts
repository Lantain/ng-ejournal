import { Component, input, output } from '@angular/core';
import { Record } from '../model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';

@Component({
  imports: [MatCardModule, MatChipsModule, MatIconModule, MatButtonModule],
  selector: 'app-record',
  template: `
    <mat-card appearance="outlined" class="my-4">
      <mat-card-content>
        <div class="flex flex-row items-start justify-between">
          <div>
            <div class="text-lg">
              <span class="italic inline-block">{{ record().discipline_kinds?.name }}</span> –
              {{ record().disciplines?.name }}
            </div>
            <mat-chip-set class="mt-2.5">
              <mat-chip>
                <div class="flex flex-row items-center">
                  <mat-icon>school</mat-icon>
                  <span class="inline-block ml-2">{{ record().forms?.name }}</span>
                </div>
              </mat-chip>
              <mat-chip>
                <div class="flex flex-row items-center">
                  <mat-icon>diversity_3</mat-icon>
                  <span class="inline-block ml-2">{{ record().courses?.name }}</span>
                </div>
              </mat-chip>
              <mat-chip class="flex flex-row items-center justify-center">
                <div class="flex flex-row items-center">
                  <mat-icon>group</mat-icon>
                  <span class="inline-block ml-2">{{
                    record().group_name.split(',').join(', ')
                  }}</span>
                </div>
              </mat-chip>
            </mat-chip-set>
          </div>
          <div>
            <mat-chip-set>
              <mat-chip>
                <div class="flex flex-row items-center">
                  <mat-icon>event</mat-icon>
                  <span class="inline-block ml-2">{{ record().date }}</span>
                </div>
              </mat-chip>
              <br />
              <mat-chip>
                <div class="flex flex-row items-center">
                  <mat-icon>alarm</mat-icon>
                  <span class="inline-block ml-2">
                    @if(record().hour == 1) {
                    {{ record().hour }} година } @else { {{ record().hour }} години }
                  </span>
                </div>
              </mat-chip>
            </mat-chip-set>
            <div class="flex flex-row items-end justify-end gap-2 my-1">
              <button class="text-orange-500 btn-edit" mat-icon-button (click)="edit.emit()">
                <mat-icon>edit</mat-icon>
              </button>
              <button class="text-red-500 btn-delete" mat-icon-button (click)="remove.emit()">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </div>

        @if(record().topics) {
        <p class="mt-2">Topic: {{ record().topics?.name }}</p>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .btn-edit {
      color: oklch(70.5% 0.213 47.604);
    }
    .btn-delete {
      color: #fb2c36;
    }
  `,
})
export class RecordComponent {
  record = input.required<Record>();
  remove = output<void>();
  edit = output<void>();
}
