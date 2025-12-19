import { Component, inject, input, output, signal } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { GroupService } from '../services/group.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Group } from '../model';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';

@Component({
  imports: [
    MatAutocompleteModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    AsyncPipe,
  ],
  selector: 'app-groups-input',
  template: `
    @if (groups$ | async; as groups) {

    <mat-form-field class="w-full">
      <mat-label>Групи*</mat-label>
      <div class="flex flex-row">
        <mat-chip-grid class="mr-4" #chipGrid>
          @for (group of selectedGroups(); track $index) {
          <mat-chip-row (removed)="remove(group)">
            {{ group.name }}
            <button matChipRemove>
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip-row>
          }
        </mat-chip-grid>

        <input
          name="currentGroup"
          placeholder="Ввести групу..."
          #fruitInput
          [value]="currentGroup()"
          (input)="currentGroup.set($any($event.target).value)"
          [matChipInputFor]="chipGrid"
          [matAutocomplete]="auto"
          [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
        />
        <mat-autocomplete
          #auto="matAutocomplete"
          (optionSelected)="selected($event); currentGroup.set('')"
        >
          @for (group of groups; track group.id) {
          <mat-option [value]="group.id">{{ group.name }}</mat-option>
          }
        </mat-autocomplete>
      </div>
    </mat-form-field>
    }
  `,
})
export class GroupsInputComponent {
  constructor() {}

  public facultyId = input<number>();
  public formId = input<number>();
  public courseId = input<number>();

  groupService = inject(GroupService);

  selectedGroups = signal<Group[]>([]);
  groupIds = output<number[]>();
  currentGroup = signal('');

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  groups$ = combineLatest([
    this.groupService.getGroups(),
    toObservable(this.facultyId),
    toObservable(this.formId),
    toObservable(this.courseId),
    toObservable(this.currentGroup),
  ]).pipe(
    map(([groups, facultyId, formId, courseId, filterText]) => {
      return groups
        .filter((group: Group) => {
          const facultyMatch = !facultyId || group.faculty_id === facultyId;
          const courseMatch = !courseId || group.course_id === courseId;
          const formMatch = !formId || group.form_id === formId;

          return facultyMatch && courseMatch && formMatch;
        })
        .filter((group: Group) => {
          if (filterText.length === 0) {
            return true;
          }
          return group.name.toLowerCase().includes(filterText.toLowerCase());
        });
    })
  );

  remove(group: Group): void {
    this.selectedGroups.update((groups) => {
      const index = groups.indexOf(group);
      if (index < 0) {
        return groups;
      }
      groups.splice(index, 1);
      this.groupIds.emit(groups.map((g) => g.id));
      return [...groups]; // Return new reference
    });
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.groups$.pipe(take(1)).subscribe((groups) => {
      const groupId = event.option.value;
      const group = groups.find((g: Group) => g.id === groupId);
      if (group) {
        this.selectedGroups.update((groups) => {
          const newGroups = [...groups, group];
          this.groupIds.emit(newGroups.map((g) => g.id));
          return newGroups;
        });
      }
    });
    this.currentGroup.set('');
    event.option.deselect();
  }

  // add(event: MatChipInputEvent): void {
  //   console.log('add', event);

  //   const value = (event.value || '').trim();

  //   if (value) {
  //     this.groupIds.update((groupIds) => {
  //       return [...groupIds, Number(value)];
  //     });
  //   }

  //   this.currentGroup.set('');
  // }
}
