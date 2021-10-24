import {
  GetSystemInfoSync,
  RequestObject,
  Login,
  SetKeepScreenOn,
} from "@/types/vivo";

declare global {
  namespace qg {
    export function getSystemInfoSync(): GetSystemInfoSync;
    export function request(object: RequestObject): void;
    export function login(object: Login): void;
    export function setKeepScreenOn(object: SetKeepScreenOn): void;
    export function onShow(callback: () => void): void;
    export function onHide(callback: () => void): void;
    export function onError(callback: ({ message: string }) => void): void;
    export function showDialog(object: {
      title?: string;
      message?: string;
      buttons?: [];
      success?: () => void;
      cancel?: () => void;
    }): void;
  }
}
