import { Component, computed, inject } from '@angular/core';
import { Record } from '../model';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { BottomExportsComponent } from './dialogs/bottom-exports.component';
import { SemesterService } from '../services/semester.service';
import { RecordsStateService } from '../services/records-state.service';
import { MatIconModule } from '@angular/material/icon';

interface KindGroup {
  name: string;
  hours: number;
  id: number;
}

interface FormGroup {
  name: string;
  hours: number;
  kinds: KindGroup[];
}

interface DisciplineGroup {
  name: string;
  hours: number;
  forms: FormGroup[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [MatListModule, MatDividerModule, MatBottomSheetModule, MatButtonModule, MatIconModule],
  template: `
    <div class="relative container max-w-3xl mx-auto h-full mt-4">
      <div class="flex flex-row justify-between items-center">
        <div>
          <p class="my-2 text-lg">
            Сума годин: <span class="font-bold">{{ totalHours() }} год.</span>
          </p>
          <div class="flex flex-row gap-8 mb-4">
            <p class="text-sm text-gray-600">
              Денна форма: <span class="font-bold text-gray-900">{{ dayTotalHours() }} год.</span>
            </p>
            <p class="text-sm text-gray-600">
              Заочна форма:
              <span class="font-bold text-gray-900">{{ correspondenceTotalHours() }} год.</span>
            </p>
          </div>
        </div>
        @if (filteredRecords().length > 0) {
        <button mat-button="extended" (click)="openBottomSheet()">
          <mat-icon>download</mat-icon> Експорт
        </button>
        }
      </div>

      <div class="relative w-full">
        @for (discipline of reportData(); track discipline.name) {
        <div class="relative block mb-4 border rounded-lg overflow-hidden w-full">
          <div class="bg-gray-200 p-3 font-bold flex justify-between items-center">
            <span>{{ discipline.name }}</span>
            <span>{{ discipline.hours }} год.</span>
          </div>

          @for (form of discipline.forms; track form.name) {
          <div class="px-4 py-2 border-t flex flex-col w-full">
            <div class="flex justify-between items-center font-semibold text-gray-700">
              <span>{{ form.name }}</span>
              <span>{{ form.hours }} год.</span>
            </div>

            <div class="px-6 my-2 w-full">
              @for (kind of form.kinds; track kind.name) {
              <div class="py-1 w-full">
                <div class="flex justify-between w-full text-sm text-gray-600">
                  <span>{{ kind.name }}</span>
                  <span>{{ kind.hours }} год.</span>
                </div>
              </div>
              }
            </div>
          </div>
          }
        </div>
        } @empty {
        <div class="p-4 text-center text-gray-500">Записів не знайдено</div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ReportsComponent {
  private recordsState = inject(RecordsStateService);
  records = this.recordsState.records;

  private bottomSheet = inject(MatBottomSheet);
  private semesterService = inject(SemesterService);

  filteredRecords = computed(() => {
    const semester = this.semesterService.semester();
    return this.records().filter((r) => Number(r.semester) === semester);
  });

  totalHours = computed(() => {
    const records = this.filteredRecords();
    return records.reduce((total, record) => total + Number(record.hour), 0);
  });

  dayTotalHours = computed(() => {
    const records = this.filteredRecords();
    return records
      .filter((r) => r.form_id === 1)
      .reduce((total, record) => total + Number(record.hour), 0);
  });

  correspondenceTotalHours = computed(() => {
    const records = this.filteredRecords();
    return records
      .filter((r) => r.form_id === 2)
      .reduce((total, record) => total + Number(record.hour), 0);
  });

  reportData = computed<DisciplineGroup[]>(() => {
    const records = this.filteredRecords();
    const disciplinesMap = new Map<string, DisciplineGroup>();

    for (const record of records) {
      const disciplineName = record.disciplines?.name || 'Невідома дисципліна';
      const formName = record.forms?.name || 'Невідома форма';
      const kindName = record.discipline_kinds?.name || 'Невідомий тип';
      const hours = Number(record.hour) || 0;

      let disciplineGroup = disciplinesMap.get(disciplineName);
      if (!disciplineGroup) {
        disciplineGroup = { name: disciplineName, hours: 0, forms: [] };
        disciplinesMap.set(disciplineName, disciplineGroup);
      }
      disciplineGroup.hours += hours;

      let formGroup = disciplineGroup.forms.find((f) => f.name === formName);
      if (!formGroup) {
        formGroup = { name: formName, hours: 0, kinds: [] };
        disciplineGroup.forms.push(formGroup);
      }
      formGroup.hours += hours;

      let kindGroup = formGroup.kinds.find((k) => k.name === kindName);
      if (!kindGroup) {
        kindGroup = { name: kindName, hours: 0, id: record.discipline_kinds?.id! };
        formGroup.kinds.push(kindGroup);
      }
      kindGroup.hours += hours;
    }

    const result = Array.from(disciplinesMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    result.forEach((d) => {
      d.forms.sort((a, b) => a.name.localeCompare(b.name));
      d.forms.forEach((f) => {
        f.kinds.sort((a, b) => a.id - b.id);
      });
    });

    return result;
  });

  openBottomSheet() {
    this.bottomSheet.open(BottomExportsComponent);
  }
}
