import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ShenaiSdkService {
  sdk: any = null;
  readyCallback: ((sdk: any) => void) | undefined;

  constructor() {
      const sdkModuleUrl = '/shenai-sdk/index.mjs';
      (import(/* @vite-ignore */ sdkModuleUrl) as Promise<typeof import('shenai-sdk')>)
      .then((LoadSDK) => {
      LoadSDK.default({
        onRuntimeInitialized: () => {
          console.log('Shen.AI Runtime initialized');
        },
      }).then((shenaiSDK: any) => {
        this.sdk = shenaiSDK;
        if (this.readyCallback) this.readyCallback(this.sdk);
      });
    });
  }

  whenReady(callback: (sdk: any) => void) {
    if (this.sdk) callback(this.sdk);
    else this.readyCallback = callback;
  }
}
