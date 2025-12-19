import { Component, computed, inject, input, model, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RecordService } from '../services/record.service';
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
import { Record } from '../model';
import { RecordComponent } from './record.component';

import { GroupService } from '../services/group.service';

import { GroupsInputComponent } from './groups-autocomplete.component';
import { toFormatedDateString } from '../utils';

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

    GroupsInputComponent,
  ],
  providers: [provideNativeDateAdapter(), TopicService, GroupService],
  template: `
    <mat-card class="p-4 container mx-auto" appearance="outlined">
      <mat-card-content>
        <form>
          <div class="flex flex-row">
            <mat-calendar class="w-80" [(selected)]="selectedDateValue"></mat-calendar>
            <div class="flex-1 ml-4">
              <div class="mb-4 flex flex-row justify-end">
                <mat-radio-group
                  [value]="record().semester"
                  (change)="onSemesterChange($event.value)"
                  aria-label="Семестр"
                >
                  <mat-radio-button class="mr-2" [value]="1">Осінній</mat-radio-button>
                  <mat-radio-button [value]="2">Весняний</mat-radio-button>
                </mat-radio-group>
              </div>

              <div class="flex flex-row justify-between">
                <section>
                  <mat-button-toggle-group
                    name="forma"
                    aria-label="Форма навчання"
                    [hideSingleSelectionIndicator]="hideSingleSelectionIndicator()"
                    [value]="record().form_id.toString()"
                    (change)="onFormChange($event.value)"
                  >
                    <mat-button-toggle value="1">Денна</mat-button-toggle>
                    <mat-button-toggle value="2">Заочна</mat-button-toggle>
                  </mat-button-toggle-group>
                </section>

                <section>
                  <mat-button-toggle-group
                    name="hours"
                    aria-label="Години"
                    [hideSingleSelectionIndicator]="hideSingleSelectionIndicator()"
                    [value]="record().hour.toString()"
                    (change)="onHourChange($event.value)"
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
                    <mat-select
                      required
                      [value]="record().discipline_id"
                      (valueChange)="onDisciplineChange($event)"
                    >
                      @if (courses$ | async; as disciplines) { @for (discipline of disciplines;
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
                    <mat-select
                      required
                      [value]="record().user_faculty_id"
                      (valueChange)="onFacultyChange($event)"
                    >
                      @for (faculty of faculties; track faculty.id) {
                      <mat-option [value]="faculty.id">{{ faculty.name }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </div>
                <div class="w-1/2">
                  <mat-form-field class="w-full">
                    <mat-label>Вид заняття</mat-label>
                    <mat-select
                      required
                      [value]="record().kind_id"
                      (valueChange)="onKindChange($event)"
                    >
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
                    <mat-select
                      required
                      [value]="record().course_id"
                      (valueChange)="onCourseChange($event)"
                    >
                      @for (course of courses; track course.id) {
                      <mat-option [value]="course.id">{{ course.name }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="w-4/6">
                  <app-groups-input
                    [facultyId]="record().user_faculty_id"
                    [courseId]="record().course_id"
                    [formId]="record().form_id"
                    (groupIds)="onGroupsChange($event)"
                  ></app-groups-input>
                </div>
              </div>

              @if (showAddTopic()) {
              <div class="mt-8">
                <mat-form-field class="w-full">
                  <mat-label>Тема заняття</mat-label>
                  <mat-select [value]="record().topic_id" (valueChange)="onTopicChange($event)">
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
                <button class="w-72" matButton="filled" type="submit">
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
      <app-record [record]="record"></app-record>
      }
    </div>
    }
  `,
})
export class AddRecordsComponent {
  records = input.required<Record[]>();
  private recordService = inject(RecordService);
  private authService = inject(AuthService);
  private topicService = inject(TopicService);
  private disciplineService = inject(DisciplineService);
  courses$ = this.disciplineService.getDisciplinesByUserId(this.authService.getUser()!.id);
  topics$ = this.topicService.getByUserId(this.authService.getUser()!.id);

  public courses = courses;
  public faculties = faculties;
  public kinds = disciplineKinds;
  public showAddTopic = signal(false);

  formattedSelectedDay = computed(() => {
    const selectedDate = this.selectedDateValue();
    return selectedDate ? toFormatedDateString(selectedDate) : null;
  });

  dayRecords = computed(() => {
    return this.records().filter((record) => record.date === this.formattedSelectedDay());
  });

  record = signal({
    user_faculty_id: this.authService.getUser()?.departments[0].faculty_id,
    user_department_id: 0,
    user_id: this.authService.getUser()?.id,
    topic_id: null,
    group_faculty: this.authService.getUser()?.departments[0].faculty_id,
    course_id: 0,
    group_ids: [] as number[],
    kind_id: 0,
    hour: 0,
    discipline_id: 0,
    form_id: 0,
    date: '',
    is_custom_group: false,
    semester: new Date().getMonth() > 9 || new Date().getMonth() < 2 ? 1 : 2,
  });

  selectedDateValue = model<Date | null>(null);

  hideSingleSelectionIndicator = signal(false);
  hideMultipleSelectionIndicator = signal(false);

  toggleSingleSelectionIndicator() {
    this.hideSingleSelectionIndicator.update((value) => !value);
  }

  toggleMultipleSelectionIndicator() {
    this.hideMultipleSelectionIndicator.update((value) => !value);
  }

  onCourseChange(event: any) {
    this.record.update((record) => {
      return {
        ...record,
        course_id: event,
      };
    });
  }

  onDisciplineChange(event: any) {
    this.record.update((record) => {
      return {
        ...record,
        discipline_id: event,
      };
    });
  }
  onSemesterChange(event: any) {
    this.record.update((record) => {
      return {
        ...record,
        semester: event,
      };
    });
  }

  onFacultyChange(event: any) {
    this.record.update((record) => {
      return {
        ...record,
        user_faculty_id: event,
      };
    });
  }

  onFormChange(event: any) {
    this.record.update((record) => {
      return {
        ...record,
        form_id: Number(event),
      };
    });
  }

  onGroupsChange(groupIds: number[]) {
    this.record.update((record) => {
      return {
        ...record,
        group_ids: groupIds,
      };
    });
  }

  onKindChange(event: any) {
    this.record.update((record) => {
      return {
        ...record,
        kind_id: event,
      };
    });
  }

  onTopicChange(event: any) {
    this.record.update((record) => {
      return {
        ...record,
        topic_id: event,
      };
    });
  }

  onHourChange(event: any) {
    this.record.update((record) => {
      return {
        ...record,
        hour: Number(event),
      };
    });
  }

  toggleAddTopic($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();

    this.showAddTopic.set(!this.showAddTopic());
  }
}
