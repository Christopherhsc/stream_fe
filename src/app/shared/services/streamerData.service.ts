import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, of, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { switchMap, startWith } from 'rxjs/operators';
import { streamerData } from '../data/streamer-data';

@Injectable({ providedIn: 'root' })
export class ViewerService {
  private readonly clientId = environment.twitchClientId;
  private readonly accessToken = environment.twitchAccessToken;
  private readonly pollingInterval = 60000; // Poll every 60 seconds
  private readonly twitchApiBaseUrl = 'https://api.twitch.tv/helix/streams';

  private viewersSubject = new BehaviorSubject<Record<string, any>>({});
  viewers$ = this.viewersSubject.asObservable();

  private currentGroup: string | null = null;
  private pollingSubscription: Subscription | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Fetch and continuously update viewer data for the selected group.
   */
  fetchViewerData(group: string | null): void {
    if (!group) {
      this.stopPolling();
      return;
    }

    if (this.currentGroup === group) {
      console.log(`[ViewerService] Polling already active for group: ${group}`);
      return;
    }

    console.log(`[ViewerService] Starting polling for group: ${group}`);
    this.stopPolling();
    this.currentGroup = group;

    this.pollingSubscription = interval(this.pollingInterval)
      .pipe(
        startWith(0),
        switchMap(() => this.getViewerData())
      )
      .subscribe((viewerData) => {
        this.viewersSubject.next(viewerData);
        console.log(`[ViewerService] Viewer data updated:`, viewerData);
        console.log(
          `[ViewerService] Online streamers count: ${Object.keys(viewerData).length}`
        );
      });
  }

  /**
   * Stop the polling process.
   */
  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
      console.log('[ViewerService] Polling stopped.');
    }
    this.currentGroup = null;
  }

  /**
   * Fetch viewer data for the current group.
   */
  private getViewerData() {
    const streamerNames = this.getStreamersForGroup(this.currentGroup!);

    if (!streamerNames.length) {
      console.warn(`[ViewerService] No streamers found for group: ${this.currentGroup}`);
      return of({});
    }

    const url = `${this.twitchApiBaseUrl}?user_login=${streamerNames.join('&user_login=')}`;

    return this.http
      .get<any>(url, {
        headers: {
          'Client-ID': this.clientId,
          Authorization: `Bearer ${this.accessToken}`,
        },
      })
      .pipe(
        switchMap((response) => {
          const liveStreamers = this.mapLiveStreamers(response.data);
          return [liveStreamers];
        })
      );
  }

  /**
   * Map API response data to a structured object.
   */
  private mapLiveStreamers(data: any[]): Record<string, any> {
    const liveStreamers: Record<string, any> = {};
    data.forEach((stream: any) => {
      if (stream.type === 'live') {
        liveStreamers[stream.user_name] = {
          viewer_count: stream.viewer_count,
          thumbnail_url: stream.thumbnail_url,
          title: stream.title,
          started_at: stream.started_at,
        };
      }
    });
    return liveStreamers;
  }

  /**
   * Get a list of streamers for the specified group.
   */
  private getStreamersForGroup(group: string): string[] {
    const groupData = streamerData.find((g) => g.group === group);
    return groupData ? groupData.streamers.map((s) => s.name) : [];
  }

  /**
   * Set the active group for fetching streamer data.
   */
  setActiveGroup(group: string): void {
    this.fetchViewerData(group);
  }
}
