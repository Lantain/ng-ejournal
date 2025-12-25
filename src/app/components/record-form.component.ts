import { Component, computed, inject, input, model, signal, effect, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AddRecordRequest, RecordService, UpdateRecordRequest } from '../services/record.service';
import { AuthService } from '../services/auth.service';
import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { DisciplineService } from '../services/discipline.service';
import { AsyncPipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { courses } from '../constants/courses';
import { faculties } from '../constants/faculty';
import { lessonKinds } from '../constants/lesson-kinds';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Record as AppRecord, Discipline } from '../model';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map } from 'rxjs';

import { GroupService } from '../services/group.service';

import { GroupsInputComponent } from './inputs/groups-autocomplete.component';
import { TopicSelectComponent } from './inputs/topic-select.component';
import { toFormatedDateString } from '../utils';
import { SemesterService } from '../services/semester.service';

@Component({
  selector: 'app-record-form',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCalendar,
    MatDatepickerModule,
    MatButtonToggleModule,
    AsyncPipe,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    GroupsInputComponent,
    TopicSelectComponent,
  ],
  providers: [provideNativeDateAdapter(), GroupService],
  template: `
    <mat-card class="p-4 container mx-auto" appearance="outlined">
      <mat-card-content>
        <form [formGroup]="recordForm" (ngSubmit)="onSubmit()">
          <div class="flex flex-row">
            <mat-calendar class="w-80" [(selected)]="selectedDateValue"></mat-calendar>
            <div class="flex-1 ml-4">
              <div class="flex flex-row justify-between">
                <mat-button-toggle-group formControlName="formId" aria-label="Форма навчання">
                  <mat-button-toggle [value]="1">Денна форма</mat-button-toggle>
                  <mat-button-toggle [value]="2">Заочна форма</mat-button-toggle>
                </mat-button-toggle-group>

                <mat-button-toggle-group formControlName="hour" aria-label="Години">
                  <mat-button-toggle value="1">1 година</mat-button-toggle>
                  <mat-button-toggle value="2">2 години</mat-button-toggle>
                  <mat-button-toggle value="3">3 години</mat-button-toggle>
                  <mat-button-toggle value="4">4 години</mat-button-toggle>
                </mat-button-toggle-group>
              </div>

              <mat-form-field class="w-full mt-8">
                <mat-label>Дисципліна</mat-label>
                <mat-select required formControlName="disciplineId">
                  @if (filteredDisciplines$ | async; as disciplines) { @for (discipline of
                  disciplines; track discipline.id) {
                  <mat-option [value]="discipline.id">{{ discipline.name }}</mat-option>
                  } }
                </mat-select>
              </mat-form-field>

              <div class="flex flex-row gap-4 mt-2">
                <div class="w-1/2">
                  <mat-form-field class="w-full">
                    <mat-label>Факультет</mat-label>
                    <mat-select required formControlName="groupFacultyId">
                      @for (faculty of faculties; track faculty.id) {
                      <mat-option [value]="faculty.id">{{ faculty.name }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </div>
                <div class="w-1/2">
                  <mat-form-field class="w-full">
                    <mat-label>Вид заняття</mat-label>
                    <mat-select required formControlName="kindId">
                      @for (kind of kinds; track kind.id) {
                      <mat-option [value]="kind.id">{{ kind.name }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>

              <div class="w-full flex flex-row gap-4 mt-2">
                <div class="w-2/6">
                  <mat-form-field class="w-full">
                    <mat-label>Курс</mat-label>
                    <mat-select required formControlName="courseId">
                      @for (course of courses; track course.id) {
                      <mat-option [value]="course.id">{{ course.name }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="w-4/6">
                  @if (!recordForm.value.isCustomGroup) {
                  <app-groups-input
                    [facultyId]="+recordForm.value.groupFacultyId!"
                    [courseId]="+recordForm.value.courseId!"
                    [formId]="+recordForm.value.formId!"
                    formControlName="groupIds"
                  ></app-groups-input>
                  } @else {
                  <mat-form-field class="w-full">
                    <mat-label>Ручний ввод груп</mat-label>
                    <input matInput formControlName="customGroup" />
                  </mat-form-field>
                  }
                </div>
              </div>

              @if (showAddTopic()) {
              <div class="mt-8">
                <app-topic-select
                  [disciplineId]="recordForm.value.disciplineId"
                  formControlName="topicId"
                ></app-topic-select>
              </div>
              }
              <div class="w-full flex flex-row justify-center items-center mt-8 gap-8">
                @if (!showAddTopic()) {
                <button matButton (click)="toggleAddTopic($event)">
                  <mat-icon>add_comment</mat-icon>
                  Додати тему
                </button>
                }
                <button
                  class="w-72"
                  matButton="filled"
                  type="submit"
                  [disabled]="recordForm.invalid"
                >
                  <mat-icon>add</mat-icon>
                  {{ record() ? 'Редагувати запис' : 'Створити новий запис' }}
                </button>
                @if (!recordForm.value.isCustomGroup) {
                <button matButton (click)="toggleCustomGroup($event)">
                  <mat-icon>group</mat-icon>
                  Ручний ввод групи
                </button>
                } @else {
                <button matButton (click)="toggleCustomGroup($event)">
                  <mat-icon>group</mat-icon>
                  Керований ввод групи
                </button>
                }
              </div>
            </div>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
})
export class RecordFormComponent {
  private authService = inject(AuthService);
  private disciplineService = inject(DisciplineService);
  private fb = inject(FormBuilder);
  private semesterService = inject(SemesterService);

  public record = input<AppRecord>();
  public onFormSubmit = output<AddRecordRequest | UpdateRecordRequest>();
  public onDateChange = output<Date>();

  disciplines$ = this.disciplineService.getDisciplinesByUserId(this.authService.getUser()!.id);

  recordForm = this.createDefaultFormGroup();

  // Create an observable that filters disciplines based on selected semester
  filteredDisciplines$ = combineLatest([
    this.disciplines$,
    toObservable(this.semesterService.semester),
  ]).pipe(
    map(([disciplines, semester]) => {
      if (!semester) return disciplines;
      return disciplines.filter((d: Discipline) => d.semester_id === semester);
    })
  );

  public courses = courses;
  public kinds = lessonKinds;

  public faculties = faculties.sort((a, b) => {
    const userFacultyIds = this.authService.getUser()?.departments.map((d) => d.faculty_id);
    if (userFacultyIds?.includes(a.id)) return -1;
    if (userFacultyIds?.includes(b.id)) return 1;
    return a.name.localeCompare(b.name);
  });

  public showAddTopic = signal(false);

  selectedDateValue = model<Date | null>(null);

  constructor() {
    effect(() => {
      const date = this.selectedDateValue();
      if (date) {
        this.onDateChange.emit(date);
        // Update form date when calendar selection changes
        this.recordForm.patchValue({ date: toFormatedDateString(date) });
      }
    });

    effect(() => {
      const record = this.record();
      if (record) {
        this.patchFormFromRecord(record);
      }
    });
  }

  get user() {
    return this.authService.getUser()!;
  }

  createDefaultFormGroup() {
    const group = this.fb.group({
      userFacultyId: [this.user.departments[0].faculty_id, Validators.required],
      userDepartmentId: [this.user.departments[0].id, Validators.required],
      userId: [this.user.id, Validators.required],
      topicId: [null as number | null],
      groupFacultyId: [this.user.departments[0].faculty_id, Validators.required],
      courseId: [0, Validators.required],
      customGroup: [null as string | null],
      isCustomGroup: [false],

      groupIds: [[] as number[], Validators.required],
      kindId: [0, Validators.required],
      hour: ['2', Validators.required],
      disciplineId: [0, Validators.required],
      formId: [null as number | null, Validators.required],
      date: ['', Validators.required],
    });

    return group;
  }

  patchFormFromRecord(record: AppRecord) {
    this.recordForm.patchValue({
      userFacultyId: record.user_faculty_id,
      userDepartmentId: record.user_department_id,
      userId: record.user_id,
      topicId: record.topic_id,
      groupFacultyId: +record.group_faculty,
      courseId: record.course_id,
      groupIds: record.group ? record.group.split(',').map((g) => Number(g)) : [],
      customGroup: record.group,
      isCustomGroup: record.is_custom_group,

      kindId: +record.kind_id,
      hour: record.hour ? record.hour.toString() : '2',
      disciplineId: +record.discipline_id,
      formId: record.form_id,
      date: record.date,
    });

    if (record.topic_id) {
      this.showAddTopic.set(true);
    }

    if (record.is_custom_group) {
      this.recordForm.controls.customGroup.setValidators(Validators.required);
      this.recordForm.controls.groupIds.clearValidators();
    } else {
      this.recordForm.controls.customGroup.clearValidators();
      this.recordForm.controls.groupIds.setValidators(Validators.required);
    }

    this.recordForm.controls.customGroup.updateValueAndValidity();
    this.recordForm.controls.groupIds.updateValueAndValidity();

    if (record.date) {
      const d = new Date(record.date);
      if (!isNaN(d.getTime())) {
        this.selectedDateValue.set(d);
      }
    }
  }

  toggleAddTopic($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.showAddTopic.set(!this.showAddTopic());
  }

  toggleCustomGroup($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();
    const isCustom = !this.recordForm.value.isCustomGroup;
    this.recordForm.patchValue({ isCustomGroup: isCustom });

    if (isCustom) {
      this.recordForm.controls.customGroup.setValidators(Validators.required);
      this.recordForm.controls.groupIds.clearValidators();
    } else {
      this.recordForm.controls.customGroup.clearValidators();
      this.recordForm.controls.groupIds.setValidators(Validators.required);
    }

    this.recordForm.controls.customGroup.updateValueAndValidity();
    this.recordForm.controls.groupIds.updateValueAndValidity();
  }

  onSubmit() {
    if (this.recordForm.valid) {
      const formValue = this.recordForm.getRawValue();
      const payload: AddRecordRequest = {
        user_faculty_id: formValue.userFacultyId!,
        user_department_id: formValue.userDepartmentId!,
        user_id: formValue.userId!,
        topic_id: formValue.topicId ?? null,
        group_faculty: String(formValue.groupFacultyId),
        course_id: String(formValue.courseId),
        group: formValue.isCustomGroup
          ? formValue.customGroup || ''
          : (formValue.groupIds || []).join(','),
        kind_id: String(formValue.kindId),
        hour: Number(formValue.hour),
        discipline_id: String(formValue.disciplineId),
        form_id: String(formValue.formId),
        date: formValue.date!,
        is_custom_group: !!formValue.isCustomGroup,
        semester: this.semesterService.semester().toString(),
      };

      this.onFormSubmit.emit(payload);
    } else {
      console.log('Form is invalid', this.recordForm.errors);
    }
  }
}
