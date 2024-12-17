import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(), // Enables Angular animations
    provideRouter(routes), // Configures the Angular Router
    provideHttpClient(withInterceptorsFromDi()), // Replaces HttpClientModule
  ],
}).catch((err) => console.error(err));
