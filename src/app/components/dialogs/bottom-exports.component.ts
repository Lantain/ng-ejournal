import { Component, inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../services/auth.service';
import { reports } from '../../constants/reports';
import { intervals } from '../../constants/intervals';

@Component({
  selector: 'app-bottom-exports',
  imports: [MatListModule],
  providers: [AuthService],
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
  private authService = inject(AuthService);

  reportsRaw = reports;
  intervals = intervals;

  get reports() {
    return this.reportsRaw.filter((r) => !r.role || r.role <= (this.user.role || 0));
  }
  get user() {
    return this.authService.getUser()!;
  }

  runExport(departmentId: number, reportType: number, intervalId: number) {
    console.log(departmentId, reportType, intervalId);
    this._bottomSheetRef.dismiss();
  }
}
