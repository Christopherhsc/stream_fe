import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { switchMap, startWith } from 'rxjs/operators';
import { streamerData } from '../data/streamer-data';

@Injectable({ providedIn: 'root' })
export class ViewerService {
  private clientId = environment.twitchClientId;
  private accessToken = environment.twitchAccessToken;

  private viewersSubject = new BehaviorSubject<Record<string, any>>({}); // Hold detailed streamer data
  viewers$ = this.viewersSubject.asObservable();

  private currentGroup: string = 'OnlyFangs'; // Default group
  private pollingStarted = false;

  constructor(private http: HttpClient) {}

  /**
   * Start polling viewer counts with an immediate fetch.
   */
  fetchViewerCounts(): void {
    if (this.pollingStarted) return;
    this.pollingStarted = true;

    interval(60000)
      .pipe(
        startWith(0),
        switchMap(() => this.getViewerCounts())
      )
      .subscribe((viewerData) => {
        this.viewersSubject.next(viewerData);
        console.log('Updated Viewer Data:', viewerData);
      });
  }

  /**
   * Fetch viewer counts for streamers in the current group.
   */
  private getViewerCounts() {
    const streamerNames = this.getStreamersForGroup(this.currentGroup);

    if (!streamerNames.length) {
      console.warn('No streamers found for group:', this.currentGroup);
      return of({});
    }

    const url = `https://api.twitch.tv/helix/streams?user_login=${streamerNames.join(
      '&user_login='
    )}`;

    return this.http.get<any>(url, {
      headers: {
        'Client-ID': this.clientId,
        Authorization: `Bearer ${this.accessToken}`,
      },
    }).pipe(
      switchMap((response) => {
        const liveStreamers: Record<string, any> = {};

        response.data.forEach((stream: any) => {
          if (stream.type === 'live') {
            liveStreamers[stream.user_name.toLowerCase()] = {
              viewer_count: stream.viewer_count,
              thumbnail_url: stream.thumbnail_url,
              title: stream.title,
              started_at: stream.started_at,
            };
          }
        });

        return [liveStreamers];
      })
    );
  }

  /**
   * Get streamers dynamically based on the selected group.
   */
  private getStreamersForGroup(group: string): string[] {
    const groupData = streamerData.find((g) => g.group === group);
    return groupData ? groupData.streamers.map((s) => s.name.toLowerCase()) : [];
  }

  /**
   * Set the active group for fetching streamers.
   */
  setActiveGroup(group: string): void {
    this.currentGroup = group;
    this.getViewerCounts().subscribe((viewerData) => {
      this.viewersSubject.next(viewerData);
    });
  }
}
