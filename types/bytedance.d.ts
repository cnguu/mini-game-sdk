import { GetSystemInfoSync } from "@/types/bytedance";

declare global {
  namespace tt {
    export function getLaunchOptionsSync(): any;
    export function getSystemInfoSync(): GetSystemInfoSync;
    export function request(object: any): any;
    export function setKeepScreenOn(object: any): any;
    export function onShareAppMessage(callback: () => any): any;
    export function onShow(callback: () => any): any;
    export function onHide(callback: () => any): any;
    export function onError(callback: (object: any) => any): any;
    export function showModal(object: any): any;
    export function exitMiniProgram(): any;
    export function previewImage(object: any): any;
    export function setClipboardData(object: any): any;
    export function getClipboardData(): any;
    export function login(object: any): any;
    export function shareAppMessage(object: any): any;
    export function requestGamePayment(object: any): any;
  }
}
