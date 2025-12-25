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

  private getDefaultSemester(): number {
    const month = new Date().getMonth();
    return month > 9 || month < 2 ? 1 : 2;
  }
}
