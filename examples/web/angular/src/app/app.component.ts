import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShenaiSdkService } from './shenai-sdk.service';

const API_KEY = '';
const USER_ID = '';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  constructor(private sdkService: ShenaiSdkService) {}

  ngOnInit() {
    this.sdkService.whenReady((shenai: any) => {
      shenai.initialize(
        API_KEY,
        USER_ID,
        {
          hideShenaiLogo: false,
          measurementPreset:
            shenai.MeasurementPreset.THIRTY_SECONDS_UNVALIDATED,
          eventCallback: (event: any) => {
            console.log('Shen.AI event:', event);
          },
          onCameraError: () => console.log('camera error'),
        },
        (result: any) => {
          if (result === shenai.InitializationResult.OK) {
            console.log('Shen.AI initialized (license activated)');
          } else {
            alert('Shen.AI license activation error ' + result.toString());
          }
        }
      );
    });
  }
}
