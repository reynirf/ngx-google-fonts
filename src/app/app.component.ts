import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  tentativeApiKey$ = new BehaviorSubject('');
  apiKey$ = new BehaviorSubject<string | null>(null);

  selectedFont$ = new BehaviorSubject('<none>');
  hoverFont$ = new BehaviorSubject('<none>');

  onApiKeyChange(event: Event): void {
    const value = (event.target as any).value;
    this.tentativeApiKey$.next(value);
  }

  onKeySubmit(): void {
    this.apiKey$.next(this.tentativeApiKey$.value);
    console.log('Submitting key: ' + this.tentativeApiKey$.value);
  }

  onFontChange(event: string): void {
    this.selectedFont$.next(event);
  }

  onFontHover(font: string | null): void {
    this.hoverFont$.next(font ?? '<none>');
  }
}
