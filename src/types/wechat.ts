export interface GetLaunchOptionsSync {
  path: string;
  scene: number;
  query: any;
  shareTicket: string;
  referrerInfo?: {
    appId: string;
    extraData?: any;
  };
  forwardMaterials?: any;
}

export interface GetSystemInfoSync {
  brande: string;
  model: string;
  pixelRatio: number;
  screenWidth: number;
  screenHeight: number;
  windowWidth: number;
  windowHeight: number;
  statusBarHeight: number;
  language: string;
  version: string;
  system: string;
  platform: string;
  fontSizeSetting: number;
  SDKVersion: string;
  benchmarkLevel: number;
  albumAuthorized: boolean;
  cameraAuthorized: boolean;
  locationAuthorized: boolean;
  microphoneAuthorized: boolean;
  notificationAuthorized: boolean;
  notificationAlertAuthorized: boolean;
  notificationBadgeAuthorized: boolean;
  notificationSoundAuthorized: boolean;
  bluetoothEnabled: boolean;
  locationEnabled: boolean;
  wifiEnabled: boolean;
  safeArea: {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
  };
  locationReducedAccuracy: boolean;
  theme: "dark" | "light";
  host: {
    appId: string;
  };
  enableDebug: boolean;
  deviceOrientation: "portrait" | "landscape";

  // 自定义的参数
  sdkversion?: string;
  clientid?: string;
  devicename?: string;
  systemversion?: string;
  appversion?: string;
  screensize?: string;
  from?: number;
}

interface RequestSuccess {
  data: {
    code: number;
    msg: string;
    state: number;
  };
  header: {
    connection: string;
    "content-type": string;
    date: string;
    "transfer-encoding": string;
  };
  statusCode: number;
}

interface RequestFail {
  error: string;
  code: number;
}

export interface RequestObject {
  url: string;
  header?: {
    "content-type"?: string;
    h5x?: string;
  };
  method?: string;
  data?: string;
  dataType?: string;
  success?: (result: RequestSuccess) => void;
  fail?: (result: RequestFail) => void;
  complete?: () => void;
}

interface LoginSuccess {
  code: string;
}

interface LoginFail {
  errCode: number;
  errMsg: string;
}

export interface Login {
  success?: (result: LoginSuccess) => void;
  fail?: (result: LoginFail) => void;
}
