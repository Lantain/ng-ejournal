import { Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { reports } from '../../constants/reports';
import { intervals } from '../../constants/intervals';
import { ReportService } from '../../services/report.service';
import { SemesterService } from '../../services/semester.service';

@Component({
  selector: 'app-bottom-exports',
  imports: [MatListModule],
  providers: [AuthService, SemesterService, ReportService],
  template: `
    <mat-nav-list class="max-w-lg">
      @for (department of user.departments; track department.id) {
      <p class="truncate text-lg font-bold my-2 px-2">Кафедра {{ department.name }}</p>

      @for (report of reports; track report.type) { @for (interval of intervals; track interval.id)
      {
      <a mat-list-item (click)="runExport(department.id, report.type, interval.id)">
        <span matListItemTitle>{{ interval.name }}</span>
        <span matLine>{{ report.name }}</span>
      </a>
      } } }
    </mat-nav-list>
  `,
})
export class BottomExportsComponent {
  private _bottomSheetRef = inject<MatBottomSheetRef<BottomExportsComponent>>(MatBottomSheetRef);
  private _authService = inject(AuthService);
  private _reportService = inject(ReportService);
  private _destroyRef = inject(DestroyRef);
  private message = inject(MatSnackBar);
  private _semesterService = inject(SemesterService);

  reportsRaw = reports;
  intervals = intervals;

  get reports() {
    return this.reportsRaw.filter((r) => !r.role || r.role <= (this.user.role || 0));
  }
  get user() {
    return this._authService.getUser()!;
  }

  private getDateFormat(
    year: number,
    month: number,
    day: number,
    locale: string = 'en-GB'
  ): string {
    return this.replaceDateFormat(
      new Date(year, month, day).toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    );
  }

  private replaceDateFormat(originalDate: string): string {
    const parts = originalDate.split('/');
    const rearrangedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    return rearrangedDate;
  }

  runExport(departmentId: number, reportType: number, intervalId: number) {
    const params: any = {
      department_id: departmentId,
      //   interval_id: intervalId,
      user_id: this.user.id,
      semester: this._semesterService.semester(),
      year: `${this._semesterService.semester()} семестр ${this._semesterService.getIntervalStr()} н.р.`,
    };
    if (intervalId == 1) {
      params.start_date = this._semesterService.getYearStartDate();
      params.end_date = this._semesterService.getYearEndDate();
    } else {
      params.semester = this._semesterService.semester();
    }
    const request =
      reportType === 1
        ? this._reportService.getReportByUser(params)
        : this._reportService.getReportByDepartment(params);
    request.pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next: (result: any) => {
        const url = window.URL.createObjectURL(new Blob([result], { type: 'application/pdf' }));
        window.open(url, '_blank');
        this._bottomSheetRef.dismiss();
      },
      error: (error) => {
        this.message.open(error.error?.message || 'Помилка експорту', 'Закрити', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }
}
