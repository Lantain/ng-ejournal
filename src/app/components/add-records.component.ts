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
import { disciplineKinds } from '../constants/discipline.kinds';
import { TopicService } from '../services/topic.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Record as AppRecord } from '../model';
import { RecordComponent } from './record.component';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { GroupService } from '../services/group.service';

import { GroupsInputComponent } from './groups-autocomplete.component';
import { toFormatedDateString } from '../utils';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-records',
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
    RecordComponent,
    ReactiveFormsModule,

    GroupsInputComponent,
  ],
  providers: [provideNativeDateAdapter(), TopicService, GroupService],
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
                <section>
                  <mat-button-toggle-group
                    formControlName="formId"
                    aria-label="Форма навчання"
                    [hideSingleSelectionIndicator]="hideSingleSelectionIndicator()"
                  >
                    <mat-button-toggle value="1">Денна</mat-button-toggle>
                    <mat-button-toggle value="2">Заочна</mat-button-toggle>
                  </mat-button-toggle-group>
                </section>

                <section>
                  <mat-button-toggle-group
                    formControlName="hour"
                    aria-label="Години"
                    [hideSingleSelectionIndicator]="hideSingleSelectionIndicator()"
                  >
                    <mat-button-toggle value="1">1 година</mat-button-toggle>
                    <mat-button-toggle value="2">2 години</mat-button-toggle>
                    <mat-button-toggle value="3">3 години</mat-button-toggle>
                    <mat-button-toggle value="4">4 години</mat-button-toggle>
                  </mat-button-toggle-group>
                </section>
              </div>

              <div class="flex flex-row gap-4 mt-8">
                <div class="flex-1">
                  <mat-form-field class="w-full">
                    <mat-label>Дисципліна</mat-label>
                    <mat-select required formControlName="discipline_id">
                      @if (disciplines$ | async; as disciplines) { @for (discipline of disciplines;
                      track discipline.id) {
                      <mat-option [value]="discipline.id">{{ discipline.name }}</mat-option>
                      } }
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>

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
                  <app-groups-input
                    [facultyId]="+recordForm.value.groupFacultyId!"
                    [courseId]="+recordForm.value.courseId!"
                    [formId]="+recordForm.value.formId!"
                    (groupIds)="onGroupsChange($event)"
                  ></app-groups-input>
                </div>
              </div>

              @if (showAddTopic()) {
              <div class="mt-8">
                <mat-form-field class="w-full">
                  <mat-label>Тема заняття</mat-label>
                  <mat-select formControlName="topic_id">
                    <mat-option>-----</mat-option>
                    @if (topics$ | async; as topics) { @for (topic of topics; track topic.id) {
                    <mat-option [value]="topic.id">{{
                      topic.name.length > 200 ? topic.name.slice(0, 200) + '...' : topic.name
                    }}</mat-option>
                    } }
                  </mat-select>
                </mat-form-field>
              </div>
              } @else {
              <div class="w-full flex flex-row justify-center items-center">
                <button class="w-42" matButton (click)="toggleAddTopic($event)">
                  <mat-icon>add_comment</mat-icon>
                  Додати тему
                </button>
              </div>
              }
              <div class="w-full flex flex-row justify-center items-center mt-8">
                <button
                  class="w-72"
                  matButton="filled"
                  type="submit"
                  [disabled]="recordForm.invalid"
                >
                  <mat-icon>add</mat-icon>
                  Створити новий запис
                </button>
              </div>
            </div>
          </div>
        </form>
      </mat-card-content>
    </mat-card>

    @if (dayRecords() && dayRecords().length > 0) {
    <h2 class="mt-8 text-xl">В цей день {{ formattedSelectedDay() }}</h2>
    <div>
      @for (record of dayRecords(); track record.id) {
      <app-record (remove)="removeRecord(record.id)" [record]="record"></app-record>
      }
    </div>
    }
  `,
})
export class AddRecordsComponent {
  records = input.required<AppRecord[]>();
  recordCreated = output<void>();
  onRemoveRecord = output<number>();
  private recordService = inject(RecordService);
  private authService = inject(AuthService);
  private topicService = inject(TopicService);
  private disciplineService = inject(DisciplineService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  disciplines$ = this.disciplineService.getDisciplinesByUserId(this.authService.getUser()!.id);
  topics$ = this.topicService.getByUserId(this.authService.getUser()!.id);

  public courses = courses;
  public faculties = faculties.sort((a, b) => {
    const userFacultyId = this.authService.getUser()?.departments[0].faculty_id;
    if (userFacultyId === a.id) return -1;
    if (userFacultyId === b.id) return 1;
    return a.name.localeCompare(b.name);
  });
  public kinds = disciplineKinds;
  public showAddTopic = signal(false);

  recordForm = this.fb.group({
    userFacultyId: [this.authService.getUser()?.departments[0].faculty_id, Validators.required],
    userDepartmentId: [this.authService.getUser()?.departments[0].id, Validators.required],
    userId: [this.authService.getUser()?.id, Validators.required],
    topic_id: [null as number | null],
    groupFacultyId: [this.authService.getUser()?.departments[0].faculty_id?.toString()],
    courseId: [0, Validators.required],
    groupIds: [[] as number[], Validators.required],
    kindId: [0, Validators.required],
    hour: ['2', Validators.required],
    discipline_id: [0, Validators.required],
    formId: ['0', Validators.required],
    date: ['', Validators.required],
    // isCustomGroup: [false],
    semester: [new Date().getMonth() > 9 || new Date().getMonth() < 2 ? 1 : 2, Validators.required],
  });

  selectedDateValue = model<Date | null>(null);

  constructor() {
    effect(() => {
      const date = this.selectedDateValue();
      if (date) {
        // Update form date when calendar selection changes
        this.recordForm.patchValue({ date: toFormatedDateString(date) });
      }
    });
  }

  // Helper computed for display
  formattedSelectedDay = computed(() => {
    const selectedDate = this.selectedDateValue();
    return selectedDate ? toFormatedDateString(selectedDate) : null;
  });

  dayRecords = computed(() => {
    return this.records().filter((record) => record.date === this.formattedSelectedDay());
  });

  hideSingleSelectionIndicator = signal(false);

  onGroupsChange(groupIds: number[]) {
    this.recordForm.patchValue({ groupIds: groupIds });
  }

  toggleAddTopic($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.showAddTopic.set(!this.showAddTopic());
  }

  onSubmit() {
    if (this.recordForm.valid) {
      const formValue = this.recordForm.value;
      const payload: AddRecordRequest = {
        user_faculty_id: formValue.userFacultyId!,
        user_department_id: formValue.userDepartmentId!,
        user_id: formValue.userId!,
        topic_id: formValue.topic_id ?? null,
        group_faculty: formValue.groupFacultyId!.toString(),
        course_id: formValue.courseId!.toString(),
        group: (formValue.groupIds || []).join(','),
        kind_id: formValue.kindId!.toString(),
        hour: Number(formValue.hour),
        discipline_id: formValue.discipline_id!.toString(),
        form_id: formValue.formId!.toString(),
        date: formValue.date!,
        is_custom_group: false,
        semester: formValue.semester!.toString(),
      };

      // Call service
      this.recordService.create(payload as any).subscribe({
        next: (response) => {
          console.log('Record created successfully', response);
          this.snackBar.open('Запис створений успішно', 'Закрити', {
            duration: 2000,
          });
          this.recordCreated.emit();
        },
        error: (err) => {
          console.error('Error creating record', err);
        },
      });
    } else {
      console.log('Form is invalid', this.recordForm.errors);
    }
  }

  removeRecord(id: number) {
    this.onRemoveRecord.emit(id);
  }
}
