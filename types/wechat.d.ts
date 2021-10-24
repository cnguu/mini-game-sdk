import { GetLaunchOptionsSync, GetSystemInfoSync, Login } from "@/types/wechat";
import { RequestObject } from "@/types/wechat";

declare global {
  namespace wx {
    export function getLaunchOptionsSync(): GetLaunchOptionsSync;
    export function getSystemInfoSync(): GetSystemInfoSync;
    export function request(object: RequestObject): void;
    export function setKeepScreenOn(object: { keepScreenOn?: boolean }): void;
    export function onShareAppMessage(
      callback: () => { title: string; imageUrl: string; query: string }
    ): void;
    export function onShow(callback: () => void): void;
    export function onHide(callback: () => void): void;
    export function onError(callback: ({ message: string }) => void): void;
    export function login(object: Login): void;
    export function showModal(object: {
      title?: string;
      content?: string;
      showCancel?: boolean;
      confirmText?: string;
      success?: (result: any) => void;
    }): void;
    export function exitMiniProgram(): void;
    export function openCustomerServiceConversation(object: {
      sessionFrom?: string;
      showMessageCard?: boolean;
      sendMessageTitle?: string;
      sendMessageImg?: string;
      fail?: (result?: any) => void;
    }): void;
    export function previewImage(object: any): void;
    export function setClipboardData(object: any): void;
    export function getClipboardData(object?: any): void;
    export function navigateToMiniProgram(object?: any): void;
    export function shareAppMessage(object?: any): void;
  }
}
