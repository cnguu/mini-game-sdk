import GlobalConfigs from "@/configs";

import type { APP_CONFIG, APP_API } from "@/enums";

export default class BasicService {
  /**
   * 配置
   * @protected
   */
  protected config: APP_CONFIG;
  /**
   * API
   * @protected
   */
  protected api: APP_API;
  /**
   * 系统信息
   * @protected
   */
  protected systemInfo: any;
  /**
   * 是否开启支付
   * @protected
   */
  protected openPay: boolean;
  /**
   * 是否开启监听上报
   * @protected
   */
  protected openListenReport: boolean;
  /**
   * 不为0时表示自然量玩家分享时的广告位ID
   * @protected
   */
  protected shareAdId = 0;
  /**
   * 玩家信息
   * @protected
   */
  protected userInfo: any;
  /**
   * 玩家在线时长
   * @protected
   */
  protected onlineTime = 0;
  /**
   * 玩家登录日期
   * @protected
   */
  protected loginDate = "";
  /**
   * 玩家概括
   * @protected
   */
  protected userProfile: any;
  /**
   * 玩家是否成年
   * @protected
   */
  protected adult: boolean;

  constructor() {
    this.config = GlobalConfigs.config;
    this.api = GlobalConfigs.api;
  }
}
