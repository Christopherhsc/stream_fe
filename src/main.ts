import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; // Assuming you have a routes file

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(), // Add this to enable animations
    provideRouter(routes), // Add this to configure the router
  ],
}).catch((err) => console.error(err));
