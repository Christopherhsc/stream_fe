import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ViewerService {
  private clientId = environment.twitchClientId;
  private accessToken = environment.twitchAccessToken;

  private viewersSubject = new BehaviorSubject<Record<string, number>>({});
  viewers$ = this.viewersSubject.asObservable();

  constructor(private http: HttpClient) {}

  fetchViewerCounts(streamers: string[]): void {
    if (!streamers.length) return;

    const streamerNames = streamers.join('&user_login=');
    const url = `https://api.twitch.tv/helix/streams?user_login=${streamerNames}`;

    this.http
      .get<any>(url, {
        headers: {
          'Client-ID': this.clientId,
          Authorization: `Bearer ${this.accessToken}`,
        },
      })
      .subscribe((response) => {
        const viewerCounts: Record<string, number> = {};

        response.data.forEach((stream: any) => {
          viewerCounts[stream.user_name.toLowerCase()] = stream.viewer_count;
        });

        this.viewersSubject.next(viewerCounts);
      });
  }
}
