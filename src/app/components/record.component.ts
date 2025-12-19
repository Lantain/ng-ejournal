import { Component, input } from '@angular/core';
import { Record } from '../model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  imports: [MatCardModule, MatChipsModule, MatIconModule],
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
          <div class="w-32">
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
          </div>
        </div>

        @if(record().topics) {
        <p class="mt-2">Topic: {{ record().topics?.name }}</p>
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class RecordComponent {
  record = input.required<Record>();
}
