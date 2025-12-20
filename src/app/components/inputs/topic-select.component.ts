import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
  model,
  effect,
  input,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { AsyncPipe } from '@angular/common';
import { TopicService } from '../../services/topic.service';
import { AuthService } from '../../services/auth.service';
import { combineLatest, map } from 'rxjs';
import { Topic } from '../../model';

@Component({
  selector: 'app-topic-select',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, MatOptionModule, AsyncPipe, ReactiveFormsModule],
  providers: [
    TopicService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TopicSelectComponent),
      multi: true,
    },
  ],
  template: `
    <mat-form-field class="w-full">
      <mat-label>Тема заняття</mat-label>
      <mat-select [formControl]="control" (selectionChange)="onSelectionChange($event.value)">
        <mat-option [value]="null">-----</mat-option>
        @if (topics$ | async; as topics) { @for (topic of topics; track topic.id) {
        <mat-option [value]="topic.id">
          {{ topic.name.length > 200 ? topic.name.slice(0, 200) + '...' : topic.name }}
        </mat-option>
        } }
      </mat-select>
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicSelectComponent implements ControlValueAccessor {
  private topicService = inject(TopicService);
  private authService = inject(AuthService);

  public value = model<number | null>(null);
  public disciplineId = input<number | string | null | undefined>(null);

  private allTopics$ = this.topicService.getByUserId(this.authService.getUser()!.id);

  topics$ = combineLatest([this.allTopics$, toObservable(this.disciplineId)]).pipe(
    map(([topics, disciplineId]) => {
      if (!disciplineId) return topics;
      return topics.filter((t: Topic) => t.discipline_id === Number(disciplineId));
    })
  );

  control = new FormControl<number | null>(null);

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // Keep internal control and external model in sync
    effect(() => {
      const val = this.value();
      if (this.control.value !== val) {
        this.control.setValue(val, { emitEvent: false });
      }
    });

    this.control.valueChanges.subscribe((val) => {
      this.value.set(val);
      this.onChange(val);
    });
  }

  onSelectionChange(value: number | null) {
    this.onTouched();
  }

  writeValue(value: number | null): void {
    this.control.setValue(value, { emitEvent: false });
    this.value.set(value);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }
}
