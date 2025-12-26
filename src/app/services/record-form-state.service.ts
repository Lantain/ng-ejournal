import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RecordFormStateService {
  private storageKey = 'record-form-state';
  state = signal<any | null>(null);

  constructor() {
    this.loadState();
  }

  saveState(state: any) {
    this.state.set(state);
    // Optional: persist to localStorage so it survives refresh
    // localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  loadState() {
    // Optional: load from localStorage
    // const saved = localStorage.getItem(this.storageKey);
    // if (saved) {
    //   this.state.set(JSON.parse(saved));
    // }
  }

  clearState() {
    this.state.set(null);
    // localStorage.removeItem(this.storageKey);
  }
}
