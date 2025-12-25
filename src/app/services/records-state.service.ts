import { Injectable, signal, inject } from '@angular/core';
import { Record } from '../model';
import { RecordService } from './record.service';
import { AuthService } from './auth.service';
import { BehaviorSubject, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RecordsStateService {
  private recordService = inject(RecordService);
  private authService = inject(AuthService);

  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  public records = signal<Record[]>([]);
  public loading = signal(false);

  records$ = this.refreshTrigger$.pipe(
    tap(() => this.loading.set(true)),
    switchMap(() => {
      const user = this.authService.getUser();
      if (!user) return [];
      return this.recordService.getByUserId(user.id);
    }),
    tap((records) => {
      this.records.set(records);
      this.loading.set(false);
    })
  );

  refresh() {
    this.refreshTrigger$.next();
  }
}
