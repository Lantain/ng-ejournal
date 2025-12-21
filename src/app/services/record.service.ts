import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_HEADERS, API_URL } from '../app.config';
import { map, of } from 'rxjs';
import { ApiResponse, Record } from '../model';

interface AddRecordResponse {
  user_faculty_id: number;
  user_department_id: number;
  user_id: number;
  discipline_id: string;
  topic_id: number | null;
  kind_id: string;
  hour: number;
  date: string;
  group_faculty: string;
  course_id: string;
  form_id: string;
  group: string;
  is_custom_group: boolean;
  semester: string;
  updated_at: string;
  created_at: string;
  id: number;
}

export interface AddRecordRequest {
  user_faculty_id: number;
  user_department_id: number;
  user_id: number;
  topic_id: number | null;
  group_faculty: string;
  course_id: string;
  group: string;
  kind_id: string;
  hour: number;
  discipline_id: string;
  form_id: string;
  date: string;
  is_custom_group: boolean;
  semester: string;
}

@Injectable()
export class RecordService {
  constructor(private http: HttpClient) {}

  getByUserId(userId: number) {
    return this.http
      .get<ApiResponse<'records', Record[]>>(API_URL + '/record/' + userId, {
        headers: API_HEADERS,
      })
      .pipe(map((res) => res.records.sort((a, b) => a.date.localeCompare(b.date))));
  }

  getById(recordId: number) {
    return this.http.get<ApiResponse<'record', Record>>(API_URL + '/record/elem/' + recordId);
  }

  create(value: AddRecordRequest) {
    return this.http.post<ApiResponse<'record', AddRecordResponse>>(API_URL + '/record', value);
  }

  update(value: any, recordId: number) {
    return this.http.patch<ApiResponse<'record', AddRecordResponse>>(
      API_URL + '/record/' + recordId,
      value
    );
  }

  delete(recordId: number) {
    return this.http.delete(API_URL + '/record/' + recordId);
  }
}
