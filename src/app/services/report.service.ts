import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { API_HEADERS, API_URL } from '../app.config';

@Injectable()
export class ReportService {
  constructor(private http: HttpClient) {}

  getReports(data: any): Observable<any> {
    return this.http.get(API_URL + '/report', {
      params: data,
      responseType: 'blob',
    });
  }

  getReportByUser(value: any): Observable<any> {
    return this.http.get(API_URL + '/report/user', {
      params: value,
      responseType: 'blob' as 'json',
    });
  }

  getReportByDepartment(value: any): Observable<any> {
    return this.http.get(API_URL + '/report/department', {
      params: value,
      responseType: 'blob' as 'json',
    });
  }
}
