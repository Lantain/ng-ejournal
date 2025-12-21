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
    return this.http.get<ApiResponse<'topics', Topic[]>>(API_URL + '/topic/' + userId).pipe(
      map((res) => res.topics),
      tap((topics) => this.storeTopics(topics))
    );
  }

  update(topic: Partial<Topic>) {
    this.clearTopicsCache();
    return this.http.patch(API_URL + '/topic/' + topic.id, topic);
  }

  create(topic: Partial<Topic>) {
    this.clearTopicsCache();
    return this.http.post(API_URL + '/topic', topic);
  }

  delete(id: number) {
    this.clearTopicsCache();
    return this.http.delete(API_URL + '/topic/' + id, { headers: API_HEADERS });
  }
}
