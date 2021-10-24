export interface GetSystemInfoSync {
  brande: string;
  manufacturer: string;
  model: string;
  product: string;
  osType: string;
  osVersionName: string;
  osVersionCode: string;
  platformVersionName: string;
  platformVersionCode: number;
  language: string;
  region: string;
  screenWidth: number;
  screenHeight: number;
  battery: number;
  wifiSignal: number;
  isHole: boolean;
  hole_x: number;
  hole_y: number;
  hole_radius: number;
  isNotch: boolean;
  statusBarHeight: number;
  safeArea: {
    bottom: number;
    height: number;
    left: number;
    right: number;
    top: number;
    width: number;
  };
}

export interface RequestSuccess {
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

export interface RequestFail {
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

export interface LoginSuccess {
  data: {
    token: string;
  };
  token: string;
}

export interface LoginFail {
  errCode: number;
  errMsg: string;
}

export interface Login {
  success?: (result: LoginSuccess) => void;
  fail?: (result: LoginFail) => void;
}

export interface SetKeepScreenOn {
  keepScreenOn: boolean;
}
