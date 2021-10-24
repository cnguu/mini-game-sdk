export interface GetSystemInfoSync {
  system?: string;
  platform?: string;
  brand?: string;
  model?: string;
  version?: string;
  appName?: string;
  SDKVersion?: string;
  screenWidth?: number;
  screenHeight?: number;
  windowWidth?: number;
  windowHeight?: number;
  pixelRatio?: number;
  statusBarHeight?: number;
  safeArea?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    width?: number;
    height?: number;
  };

  // 自定义的参数
  sdkversion?: string;
  clientid?: string;
  devicename?: string;
  systemversion?: string;
  appversion?: string;
  screensize?: string;
  from?: number;
}
