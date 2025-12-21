import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_HEADERS, API_URL } from '../app.config';
import { ApiResponse, Group } from '../model';
import { map, of, tap } from 'rxjs';

@Injectable()
export class GroupService {
  constructor(private http: HttpClient) {}

  private storeGroups(groups: Group[]) {
    sessionStorage.setItem('groups', JSON.stringify(groups));
  }
  private getGroupsFromStorage() {
    const groups = JSON.parse(sessionStorage.getItem('groups') || '[]');
    return groups;
  }

  clearGroupsCache() {
    sessionStorage.removeItem('groups');
  }

  getGroups() {
    const groups = this.getGroupsFromStorage();
    if (groups.length > 0) {
      return of(groups);
    }
    return this.http.get<ApiResponse<'groups', Group[]>>(API_URL + '/group').pipe(
      map((res) => res.groups),
      tap((groups) => this.storeGroups(groups))
    );
  }
}
