import { Component, computed, input, signal } from '@angular/core';
import { Record } from '../model';
import { MatCardModule } from '@angular/material/card';
import { RecordComponent } from './record.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  imports: [MatCardModule, RecordComponent, MatFormFieldModule, MatSelectModule],
  selector: 'app-records-list',
  template: `
    <div class="flex flex-row gap-4 my-8 justify-center container">
      <mat-form-field class="w-4/12" subscriptSizing="dynamic">
        <mat-label>Дисципліна</mat-label>
        <mat-select
          [value]="selectedDiscipline()"
          (selectionChange)="selectedDiscipline.set($event.value)"
        >
          <mat-option [value]="null">Всі</mat-option>
          @for (d of uniqueDisciplines(); track d.id) {
          <mat-option [value]="d.id">{{ d.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field class="w-3/12" subscriptSizing="dynamic">
        <mat-label>Курс</mat-label>
        <mat-select [value]="selectedCourse()" (selectionChange)="selectedCourse.set($event.value)">
          <mat-option [value]="null">Всі</mat-option>
          @for (c of uniqueCourses(); track c.id) {
          <mat-option [value]="c.id">{{ c.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field class="w-3/12" subscriptSizing="dynamic">
        <mat-label>Група</mat-label>
        <mat-select [value]="selectedGroup()" (selectionChange)="selectedGroup.set($event.value)">
          <mat-option [value]="null">Всі</mat-option>
          @for (g of uniqueGroups(); track g.id) {
          <mat-option [value]="g.id">{{ g.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field class="w-2/12" subscriptSizing="dynamic">
        <mat-label>Форма навчання</mat-label>
        <mat-select [value]="selectedForm()" (selectionChange)="selectedForm.set($event.value)">
          <mat-option [value]="null">Всі</mat-option>
          @for (f of uniqueForms(); track f.id) {
          <mat-option [value]="f.id">{{ f.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>

    @for(group of groupedRecords(); track group.date) {
    <mat-card appearance="outlined" class="mt-4">
      <mat-card-header>
        <mat-card-title>{{ group.date }} - {{ group.records.length }} records</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        @for(record of group.records; track record.id) {
        <app-record [record]="record"></app-record>
        }
      </mat-card-content>
    </mat-card>
    }
  `,
})
export class RecordsListComponent {
  records = input.required<Record[]>();

  selectedDiscipline = signal<number | null>(null);
  selectedForm = signal<number | null>(null);
  selectedCourse = signal<number | null>(null);
  selectedGroup = signal<string | null>(null);

  uniqueDisciplines = computed(() => {
    const disciplines = new Map<number, { id: number; name: string }>();
    this.records().forEach((r) => {
      if (r.disciplines) {
        disciplines.set(r.disciplines.id, r.disciplines);
      }
    });
    return Array.from(disciplines.values()).sort((a, b) => a.name.localeCompare(b.name));
  });

  uniqueForms = computed(() => {
    const forms = new Map<number, { id: number; name: string }>();
    this.records().forEach((r) => {
      if (r.forms) {
        forms.set(r.forms.id, r.forms);
      }
    });
    return Array.from(forms.values()).sort((a, b) => a.name.localeCompare(b.name));
  });

  uniqueCourses = computed(() => {
    const courses = new Map<number, { id: number; name: string }>();
    this.records().forEach((r) => {
      if (r.courses) {
        courses.set(r.courses.id, r.courses);
      }
    });
    return Array.from(courses.values()).sort((a, b) => a.name.localeCompare(b.name));
  });

  uniqueGroups = computed(() => {
    const groupsMap = new Map<string, string>();
    this.records().forEach((r) => {
      if (r.group) {
        const ids = r.group.split(',').map((id) => id.trim());
        const names = r.group_name ? r.group_name.split(',').map((name) => name.trim()) : [];
        ids.forEach((id, index) => {
          if (!groupsMap.has(id)) {
            groupsMap.set(id, names[index] || id);
          }
        });
      }
    });
    return Array.from(groupsMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  filteredRecords = computed(() => {
    let records = this.records();
    const dId = this.selectedDiscipline();
    const fId = this.selectedForm();
    const cId = this.selectedCourse();
    const g = this.selectedGroup();

    if (dId !== null) {
      records = records.filter((r) => r.discipline_id === dId);
    }
    if (fId !== null) {
      records = records.filter((r) => r.form_id === fId);
    }
    if (cId !== null) {
      records = records.filter((r) => r.course_id === cId);
    }
    if (g !== null) {
      records = records.filter((r) => {
        if (!r.group) return false;
        const ids = r.group.split(',').map((id) => id.trim());
        return ids.includes(g);
      });
    }

    return records;
  });

  groupedRecords = computed(() => {
    const recordsMap = this.filteredRecords().reduce((acc, record) => {
      const date = record.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    }, {} as { [key: string]: Record[] });
    const recordGroups = Object.entries(recordsMap).map(([date, records]) => ({
      date,
      records,
    }));
    return recordGroups;
  });
}
