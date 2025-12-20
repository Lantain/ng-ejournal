import { Component, computed, input } from '@angular/core';
import { Record } from '../model';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { DecimalPipe } from '@angular/common';

interface KindGroup {
  name: string;
  hours: number;
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
  imports: [MatListModule, MatDividerModule, DecimalPipe],
  template: `
    <div class="container max-w-4xl mx-auto p-4">
      <p class="my-2 text-lg">
        Сума годин: <span class="font-bold">{{ totalHours() }}</span>
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

      <mat-list>
        @for (discipline of reportData(); track discipline.name) {
        <div class="mb-4 border rounded-lg overflow-hidden">
          <div class="bg-gray-100 p-3 font-bold flex justify-between items-center">
            <span>{{ discipline.name }}</span>
            <span>{{ discipline.hours | number : '1.0-2' }} год.</span>
          </div>

          @for (form of discipline.forms; track form.name) {
          <div class="pl-4 pr-3 py-2 border-t flex flex-col">
            <div class="flex justify-between items-center font-semibold text-gray-700">
              <span>{{ form.name }}</span>
              <span>{{ form.hours | number : '1.0-2' }} год.</span>
            </div>

            <mat-list class="pt-0! pb-0!">
              @for (kind of form.kinds; track kind.name) {
              <mat-list-item class="h-auto! py-1!">
                <div class="flex justify-between w-full text-sm text-gray-600">
                  <span>{{ kind.name }}</span>
                  <span>{{ kind.hours | number : '1.0-2' }} год.</span>
                </div>
              </mat-list-item>
              }
            </mat-list>
          </div>
          }
        </div>
        } @empty {
        <div class="p-4 text-center text-gray-500">Записів не знайдено</div>
        }
      </mat-list>
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
  records = input.required<Record[]>();

  totalHours = computed(() => {
    const records = this.records();
    return records.reduce((total, record) => total + Number(record.hour), 0);
  });

  dayTotalHours = computed(() => {
    const records = this.records();
    return records
      .filter((r) => r.form_id === 1)
      .reduce((total, record) => total + Number(record.hour), 0);
  });

  correspondenceTotalHours = computed(() => {
    const records = this.records();
    return records
      .filter((r) => r.form_id === 2)
      .reduce((total, record) => total + Number(record.hour), 0);
  });

  reportData = computed<DisciplineGroup[]>(() => {
    const records = this.records();
    const disciplinesMap = new Map<string, DisciplineGroup>();

    for (const record of records) {
      // Get names, defaulting to Unknown if missing
      const disciplineName = record.disciplines?.name || 'Невідома дисципліна';
      const formName = record.forms?.name || 'Невідома форма';
      const kindName = record.discipline_kinds?.name || 'Невідомий тип';
      const hours = Number(record.hour) || 0;

      // 1. Get or create Discipline Group
      let disciplineGroup = disciplinesMap.get(disciplineName);
      if (!disciplineGroup) {
        disciplineGroup = { name: disciplineName, hours: 0, forms: [] };
        disciplinesMap.set(disciplineName, disciplineGroup);
      }
      disciplineGroup.hours += hours;

      // 2. Get or create Form Group within Discipline
      let formGroup = disciplineGroup.forms.find((f) => f.name === formName);
      if (!formGroup) {
        formGroup = { name: formName, hours: 0, kinds: [] };
        disciplineGroup.forms.push(formGroup);
      }
      formGroup.hours += hours;

      // 3. Get or create Kind Group within Form
      let kindGroup = formGroup.kinds.find((k) => k.name === kindName);
      if (!kindGroup) {
        kindGroup = { name: kindName, hours: 0 };
        formGroup.kinds.push(kindGroup);
      }
      kindGroup.hours += hours;
    }

    // Sort by name for consistency
    const result = Array.from(disciplinesMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    // Sort nested
    result.forEach((d) => {
      d.forms.sort((a, b) => a.name.localeCompare(b.name));
      d.forms.forEach((f) => {
        f.kinds.sort((a, b) => a.name.localeCompare(b.name));
      });
    });

    return result;
  });
}
