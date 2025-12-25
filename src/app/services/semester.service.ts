import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SemesterService {
  semester = signal<number>(this.getDefaultSemester());

  isAutumn = computed(() => this.semester() === 1);
  isSpring = computed(() => this.semester() === 2);

  toggle() {
    this.semester.update((v) => (v === 1 ? 2 : 1));
  }

  setSemester(value: number) {
    this.semester.set(value);
  }

  getYearStartDate(): string {
    const currentMonth = new Date().getMonth() + 1;
    const year = currentMonth < 9 ? new Date().getFullYear() - 1 : new Date().getFullYear();
    return `${year}-09-01`;
  }

  getYearEndDate(): string {
    const currentMonth = new Date().getMonth() + 1;
    const year = currentMonth < 9 ? new Date().getFullYear() : new Date().getFullYear() + 1;
    return `${year}-06-30`;
  }

  getStartDate(): string {
    if (this.isAutumn()) {
      if (new Date().getMonth() < 9) {
        return `${new Date().getFullYear() - 1}-09-01`;
      } else {
        return `${new Date().getFullYear()}-09-01`;
      }
    } else {
      if (new Date().getMonth() > 1) {
        return `${new Date().getFullYear() - 1}-02-01`;
      } else {
        return `${new Date().getFullYear()}-02-01`;
      }
    }
  }

  getEndDate(): string {
    if (this.isAutumn()) {
      if (new Date().getMonth() < 9) {
        return `${new Date().getFullYear() - 1}-06-30`;
      } else {
        return `${new Date().getFullYear()}-06-30`;
      }
    } else {
      if (new Date().getMonth() > 1) {
        return `${new Date().getFullYear() - 1}-01-31`;
      } else {
        return `${new Date().getFullYear()}-01-31`;
      }
    }
  }

  getIntervalStr(): string {
    const currentMonth = new Date().getMonth() + 1;

    if (currentMonth < 9) {
      return `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`;
    } else {
      return `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
    }
  }

  private getDefaultSemester(): number {
    const month = new Date().getMonth();
    return month > 9 || month < 2 ? 1 : 2;
  }
}
