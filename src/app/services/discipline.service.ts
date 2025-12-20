import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { API_HEADERS, API_URL } from '../app.config';
import { ApiResponse, Discipline } from '../model';

interface EditDisciplineRequest {
  name: string;
  department_id: string;
  semester_id: string;
}

@Injectable({
  providedIn: 'root',
})
export class DisciplineService {
  constructor(private http: HttpClient) {}

  private storeDisciplines(disciplines: Discipline[]) {
    sessionStorage.setItem('disciplines', JSON.stringify(disciplines));
  }

  private getDisciplinesFromStorage() {
    const disciplines = JSON.parse(sessionStorage.getItem('disciplines') || '[]');
    return disciplines;
  }

  clearDisciplinesCache() {
    sessionStorage.removeItem('disciplines');
  }

  getDisciplinesByUserId(id: number) {
    const disciplines = this.getDisciplinesFromStorage();
    if (disciplines.length) {
      return of(disciplines);
    }
    return this.http
      .get<ApiResponse<'disciplines', Discipline[]>>(API_URL + '/discipline/' + id, {
        headers: API_HEADERS,
      })
      .pipe(
        map((res) => res.disciplines),
        tap((res) => this.storeDisciplines(res))
      );
  }

  create(value: any): Observable<any> {
    this.clearDisciplinesCache();
    return this.http.post(API_URL + '/discipline', value, { headers: API_HEADERS });
  }

  update(id: number, value: EditDisciplineRequest): Observable<any> {
    this.clearDisciplinesCache();
    return this.http.patch(API_URL + '/discipline/' + id, value, { headers: API_HEADERS });
  }

  detachBind(value: any): Observable<any> {
    this.clearDisciplinesCache();
    return this.http.post(API_URL + '/discipline/detach', value, { headers: API_HEADERS });
  }

  attachBind(value: any): Observable<any> {
    this.clearDisciplinesCache();
    return this.http.post(API_URL + '/discipline/attach', value, { headers: API_HEADERS });
  }
}
