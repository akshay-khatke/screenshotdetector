import { NativeModules, NativeEventEmitter } from 'react-native';

const { ScreenshotModule } = NativeModules;
const eventEmitter = new NativeEventEmitter(ScreenshotModule);

export const enableScreenshotDetection = () => {
  ScreenshotModule.enableScreenshotDetection();
};

export const disableScreenshotDetection = () => {
  ScreenshotModule.disableScreenshotDetection();
};

eventEmitter.addListener('onScreenshotTaken', (message) => {
  console.log('Screenshot Event:', message);
  alert('Screenshot detected!');
});
