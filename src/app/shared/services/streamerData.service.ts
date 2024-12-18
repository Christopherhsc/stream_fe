import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, of, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { switchMap, startWith } from 'rxjs/operators';
import { streamerData } from '../data/streamer-data';

@Injectable({ providedIn: 'root' })
export class ViewerService {
  private clientId = environment.twitchClientId;
  private accessToken = environment.twitchAccessToken;

  private viewersSubject = new BehaviorSubject<Record<string, any>>({}); // Hold detailed streamer data
  viewers$ = this.viewersSubject.asObservable();

  private currentGroup: string | null = null; // Active group for polling
  private pollingSubscription: Subscription | null = null; // Track polling subscription

  constructor(private http: HttpClient) {}

  /**
   * Start polling viewer counts with an immediate fetch.
   */
  fetchViewerCounts(group: string | null): void {
    if (!group) {
      this.stopPolling(); // Stop polling if no valid group
      return;
    }

    if (this.currentGroup === group) {
      console.log('Polling already running for group:', group);
      return;
    }

    console.log('Starting polling for group:', group);

    this.stopPolling(); // Stop any existing polling
    this.currentGroup = group;

    this.pollingSubscription = interval(60000)
      .pipe(
        startWith(0),
        switchMap(() => this.getViewerCounts())
      )
      .subscribe((viewerData) => {
        this.viewersSubject.next(viewerData);
        const onlineStreamersCount = Object.keys(viewerData).length;
        console.log('Updated Viewer Data:', viewerData);
        console.log('Length of viewer data:', onlineStreamersCount);
      });
  }

  /**
   * Stop polling viewer counts.
   */
  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
      console.log('Polling stopped.');
    }
    this.currentGroup = null;
  }

  /**
   * Fetch viewer counts for streamers in the current group.
   */
  private getViewerCounts() {
    const streamerNames = this.getStreamersForGroup(this.currentGroup!);

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
            liveStreamers[stream.user_name] = {
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
    return groupData ? groupData.streamers.map((s) => s.name) : [];
  }

  /**
   * Set the active group for fetching streamers.
   */
  setActiveGroup(group: string): void {
    this.fetchViewerCounts(group); // Dynamically start polling for the selected group
  }
}
