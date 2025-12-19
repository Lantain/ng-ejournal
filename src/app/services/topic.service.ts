import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_HEADERS, API_URL } from '../app.config';
import { ApiResponse, Topic } from '../model';
import { map, of, tap } from 'rxjs';

@Injectable()
export class TopicService {
  constructor(private http: HttpClient) {}

  private storeTopics(topics: Topic[]) {
    sessionStorage.setItem('topics', JSON.stringify(topics));
  }

  private getTopicsFromStorage() {
    const topics = JSON.parse(sessionStorage.getItem('topics') || '[]');
    return topics;
  }

  clearTopicsCache() {
    sessionStorage.removeItem('topics');
  }

  getByUserId(userId: number) {
    const topics = this.getTopicsFromStorage();
    if (topics.length > 0) {
      return of(topics);
    }
    return this.http
      .get<ApiResponse<'topics', Topic[]>>(API_URL + '/topic/' + userId, {
        headers: API_HEADERS,
      })
      .pipe(
        map((res) => res.topics),
        tap((topics) => this.storeTopics(topics))
      );
  }

  update(topic: Partial<Topic>) {
    return this.http.patch(API_URL + '/topic/' + topic.id, topic, { headers: API_HEADERS });
  }

  create(topic: Partial<Topic>) {
    return this.http.post(API_URL + '/topic', topic, { headers: API_HEADERS });
  }

  delete(id: number) {
    return this.http.delete(API_URL + '/topic/' + id, { headers: API_HEADERS });
  }
}
