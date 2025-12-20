import { Component, computed, inject, input, model, signal, effect, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AddRecordRequest, RecordService } from '../services/record.service';
import { AuthService } from '../services/auth.service';
import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
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
import { combineLatest, map, startWith } from 'rxjs';

import { GroupService } from '../services/group.service';

import { GroupsInputComponent } from './inputs/groups-autocomplete.component';
import { TopicSelectComponent } from './inputs/topic-select.component';
import { toFormatedDateString } from '../utils';

@Component({
  selector: 'app-record-form',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCalendar,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatRadioGroup,
    MatRadioButton,
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
              <div class="mb-4 flex flex-row justify-end">
                <mat-radio-group formControlName="semester" aria-label="Семестр">
                  <mat-radio-button class="mr-2" [value]="1">Осінній</mat-radio-button>
                  <mat-radio-button [value]="2">Весняний</mat-radio-button>
                </mat-radio-group>
              </div>

              <div class="flex flex-row justify-between">
                <mat-button-toggle-group formControlName="formId" aria-label="Форма навчання">
                  <mat-button-toggle value="1">Денна форма</mat-button-toggle>
                  <mat-button-toggle value="2">Заочна форма</mat-button-toggle>
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
                    (groupIds)="recordForm.patchValue({ groupIds: $event })"
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

  public record = input<AppRecord>();
  public onFormSubmit = output<AddRecordRequest>();
  public onDateChange = output<Date>();

  disciplines$ = this.disciplineService.getDisciplinesByUserId(this.authService.getUser()!.id);

  recordForm = this.record() ? this.fromRecord(this.record()!) : this.createDefaultFormGroup();

  // Create an observable that filters disciplines based on selected semester
  filteredDisciplines$ = combineLatest([
    this.disciplines$,
    this.recordForm.controls.semester.valueChanges.pipe(
      startWith(this.recordForm.controls.semester.value)
    ),
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
      customGroup: [null],
      isCustomGroup: [false],

      groupIds: [[] as number[], Validators.required],
      kindId: [0, Validators.required],
      hour: ['2', Validators.required],
      disciplineId: [0, Validators.required],
      formId: [null, Validators.required],
      date: ['', Validators.required],
      semester: [
        new Date().getMonth() > 9 || new Date().getMonth() < 2 ? 1 : 2,
        Validators.required,
      ],
    });

    return group;
  }

  fromRecord(record: AppRecord) {
    const group = this.fb.group({
      userFacultyId: [record.user_faculty_id, Validators.required],
      userDepartmentId: [record.user_department_id, Validators.required],
      userId: [record.user_id, Validators.required],
      topicId: [record.topic_id],
      groupFacultyId: [+record.group_faculty, Validators.required],
      courseId: [record.course_id, Validators.required],
      groupIds: [record.group.split(',').map((g) => Number(g))],
      customGroup: [record.group],
      isCustomGroup: [record.is_custom_group],

      kindId: [record.kind_id, Validators.required],
      hour: [record.hour, Validators.required],
      disciplineId: [+record.discipline_id, Validators.required],
      formId: [record.form_id, Validators.required],
      date: [record.date, Validators.required],
      semester: [record.semester, Validators.required],
    });

    if (record.is_custom_group) {
      group.controls.customGroup.setValidators(Validators.required);
      group.controls.groupIds.clearValidators();
    } else {
      group.controls.customGroup.clearValidators();
      group.controls.groupIds.setValidators(Validators.required);
    }

    return group;
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
      const formValue = this.recordForm.value;
      const payload: AddRecordRequest = {
        user_faculty_id: formValue.userFacultyId!,
        user_department_id: formValue.userDepartmentId!,
        user_id: formValue.userId!,
        topic_id: formValue.topicId ?? null,
        group_faculty: formValue.groupFacultyId!.toString(),
        course_id: formValue.courseId!.toString(),
        group: formValue.isCustomGroup
          ? formValue.customGroup || ''
          : (formValue.groupIds || []).join(','),
        kind_id: formValue.kindId!.toString(),
        hour: Number(formValue.hour),
        discipline_id: formValue.disciplineId!.toString(),
        form_id: formValue.formId!.toString(),
        date: formValue.date!,
        is_custom_group: !!formValue.isCustomGroup,
        semester: formValue.semester!.toString(),
      };

      this.onFormSubmit.emit(payload);
    } else {
      console.log('Form is invalid', this.recordForm.errors);
    }
  }
}
