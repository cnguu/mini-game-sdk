import BasicService from "./basic";
import {
  base64_encode,
  getParam,
  headerContent,
  md5,
  paramSort,
  timestamp,
  xor_decode,
  xor_encode,
} from "@/utils/index";

import type { CommonPayParam, CommonRequestResult } from "@/types/common";
import type { GetSystemInfoSync } from "@/types/bytedance";

export default class BytedanceService extends BasicService {
  constructor() {
    super();
    this.systemInfo = {} as GetSystemInfoSync;
  }

  /**
   * 公共请求
   * @param url 请求地址
   * @param data 请求参数
   * @param encrypt 请求参数是否加密
   * @param decrypt 返回参数是否解密
   * @param code 授权token
   * @private
   */
  private request({
    url,
    data = {},
    encrypt = true,
    decrypt = true,
    code = "",
  }) {
    return new Promise((resolve, reject) => {
      const header = {
        "content-type": "application/json",
        h5x: xor_encode(
          this.config.xor_key,
          headerContent(code, this.config, this.systemInfo)
        ),
      };

      tt.request({
        url,
        header,
        method: "POST",
        data: encrypt
          ? xor_encode(this.config.app_key, JSON.stringify(data))
          : JSON.stringify(data),
        success: (res) => {
          if (res.statusCode !== 200) {
            return resolve({
              code: 9999,
              msg: "网络请求失败",
              data: "",
            });
          }

          if (typeof res.data === "object") {
            resolve({
              code: res.data.code,
              msg: res.data.msg,
              data: "",
            });
          } else {
            const decryptResult = decrypt
              ? JSON.parse(xor_decode(this.config.app_key, res.data))
              : res.data;

            resolve({
              code: decryptResult.ret,
              msg: "",
              data: decryptResult.data,
            });
          }
        },
        fail: (res) => {
          reject(res);
        },
      });
    });
  }

  /**
   * 获取广告位ID
   * @private
   */
  private getAdId() {
    const launchOptions = tt.getLaunchOptionsSync();

    if (launchOptions.query.package_id) {
      this.config.ad_id = Number(launchOptions.query.package_id);
    }
  }

  /**
   * 获取系统信息
   * @private
   */
  private getSystemInfo() {
    const systemInfo = tt.getSystemInfoSync();

    this.systemInfo = {
      sdkversion: "1.1",
      clientid:
        Math.random().toString(36).substring(2) +
        new Date().getTime().toString(26),
      brand: systemInfo.brand,
      devicename: systemInfo.model,
      systemversion: systemInfo.system,
      appversion: `${systemInfo.appName}|${systemInfo.version}`,
      screensize: `${systemInfo.screenWidth}|${systemInfo.screenHeight}`,
      from: systemInfo.platform === "ios" ? 1 : 2,
    };
  }

  /**
   * 监听上报
   * @param url
   * @private
   */
  private listenReport(url) {
    if (this.openListenReport) {
      tt.request({ url });
    }
  }

  /**
   * 处理监听
   * @private
   */
  private handleListen() {
    const packageId = this.config.ad_id || this.shareAdId;
    const listenReportPage = "&page=main";

    // 屏幕保持常亮状态
    tt.setKeepScreenOn({
      keepScreenOn: true,
    });

    // 玩家点击右上角菜单的「转发」按钮
    tt.onShareAppMessage(() => {
      return {
        title: this.config.slogan,
        imageUrl: this.config.share_img_url,
        query: `package_id=${packageId}`,
      };
    });

    // 游戏回到前台
    tt.onShow(() => {
      if (this.userInfo.access_token) {
        this.listenReport(
          `${this.config.domain}${this.api.log_show}${this.userInfo.access_token}${listenReportPage}`
        );
      }
    });

    // 游戏回到后台
    tt.onHide(() => {
      if (this.userInfo.access_token) {
        this.listenReport(
          `${this.config.domain}${this.api.log_hide}${this.userInfo.access_token}${listenReportPage}`
        );
      }
    });

    // 全局错误
    tt.onError((data) => {
      if (this.userInfo.access_token) {
        this.listenReport(
          `${this.config.domain}${this.api.log_error}${data.message}&openid=${this.userInfo.access_token}${listenReportPage}`
        );
      }
    });
  }

  /**
   * 登录上报
   * @private
   */
  private loginReport() {
    const url = `${this.config.domain}${this.api.login_log}`;
    const data = {
      username: this.userInfo.username,
      id: this.userInfo.id,
      access_token: this.userInfo.access_token,
    };

    this.request({
      url,
      data,
    });
  }

  /**
   * 处理日期
   * @private
   */
  private handleDatetime() {
    const nowDate = new Date(this.userProfile.auth_identity.now * 1000);

    if (this.userProfile.auth_identity.auth_rule.range.enable !== 0) {
      let hour: string | number = nowDate.getHours();
      if (hour < 10) hour = `0${hour}`;

      let minute: string | number = nowDate.getMinutes();
      if (minute < 10) minute = `0${minute}`;

      const hourMinute = `${hour}:${minute}`;
      const rangeTime = this.userProfile.auth_identity.auth_rule.range.time;

      for (let i = 0; i < rangeTime.length; i++) {
        if (hourMinute >= rangeTime[i][0] && hourMinute <= rangeTime[i][1]) {
          tt.showModal({
            title: "温馨提示",
            content: this.userProfile.auth_identity.auth_rule.range.msg,
            showCancel: false,
            confirmText:
              this.userProfile.auth_identity.auth_rule.range.type === 3
                ? "退出游戏"
                : "朕知道了",
            success: () => {
              if (this.userProfile.auth_identity.auth_rule.range.type === 3) {
                tt.exitMiniProgram();
              }
            },
          });
          return;
        }
      }
    }

    if (this.userProfile.auth_identity.auth_rule.day.enable !== 0) {
      const gameTime =
        this.userProfile.auth_identity.auth_rule.day.date.indexOf(
          `${nowDate.getFullYear()}-${
            nowDate.getMonth() + 1
          }-${nowDate.getDate()}`
        ) >= 0
          ? this.userProfile.auth_identity.auth_rule.day.holiday // 节假日
          : this.userProfile.auth_identity.auth_rule.day.normal; // 工作日
      const timeout = gameTime - this.onlineTime;
      const process = this.userProfile.auth_identity.auth_rule.day.process;

      if (timeout <= 0) {
        tt.showModal({
          title: "温馨提示",
          content: process[process.length - 1].msg,
          showCancel: false,
          confirmText:
            process[process.length - 1].type === 3 ? "退出游戏" : "朕知道了",
          success: () => {
            if (process[process.length - 1].type === 3) {
              tt.exitMiniProgram();
            }
          },
        });
        return;
      }

      for (let i = 0; i < process.length; i++) {
        if (timeout >= 0 && timeout === process[i].minute) {
          tt.showModal({
            title: "温馨提示",
            content: process[i].msg,
            showCancel: false,
            confirmText: process[i].type === 3 ? "退出游戏" : "朕知道了",
            success: () => {
              if (process[i].type === 3) {
                tt.exitMiniProgram();
              }
            },
          });
          break;
        }
      }
    }
  }

  /**
   * 在线上报
   * @private
   */
  private onlineReport() {
    if (this.systemInfo && this.userInfo && this.userProfile) {
      const timer = setTimeout(() => {
        const url = `${this.config.domain}${this.api.log_active}`;
        const data = {
          id: this.userInfo.id,
          interval: this.userProfile.interval,
        };

        this.request({
          url,
          data,
        }).then((result: CommonRequestResult) => {
          if (result.code === 1) {
            if (typeof this.adult !== "boolean") {
              this.handleProfile().then((res: any) => {
                if (res.data.id_card) {
                  this.adult = res.data.auth_identity.limit === 0;
                } else {
                  if (res.data.auth_identity.auth_type === 1) {
                    this.showProfile();
                  }
                }
              });
            }

            if (
              this.userProfile.auth_identity.auth_type === 1 &&
              this.userProfile.auth_identity.limit === 1
            ) {
              const nowDate = new Date(
                this.userProfile.auth_identity.now * 1000
              );
              const nowDay = `${nowDate.getFullYear()}-${
                nowDate.getMonth() + 1
              }-${nowDate.getDate()}`;

              if (this.loginDate !== nowDay) {
                this.loginDate = nowDay;
                this.onlineTime = 0;
              }

              if (!this.adult) {
                this.onlineTime += result.data.interval / 60;
                this.handleDatetime();
              }
            }

            if (result.data.interval !== this.userProfile.interval) {
              this.userProfile.interval = result.data.interval;
              clearTimeout(timer);
              this.onlineReport();
            }
          }
        });
      }, this.userProfile.interval * 1000);
    }
  }

  /**
   * 处理二维码
   * @private
   */
  private handleQrCode() {
    if (
      this.userProfile.qr &&
      this.userProfile.bind !== "" &&
      this.userProfile.bind !== "1" &&
      this.userProfile.url
    ) {
      tt.previewImage({
        urls: [this.userProfile.qr],
      });
      setTimeout(() => {
        tt.showModal({
          title: "温馨提示",
          content: "在手机浏览器上粘帖地址,使用手机号登录,马上游玩!",
          showCancel: false,
          confirmText: "朕知道了",
          success: () => {
            tt.setClipboardData({
              data: this.userProfile.url,
              success: () => {
                tt.getClipboardData();
              },
            });
          },
        });
      }, 3000);
    } else if (
      this.userProfile.qr &&
      (this.userProfile.bind === "" || this.userProfile.bind === "1") &&
      this.userProfile.url === ""
    ) {
      tt.previewImage({
        urls: [this.userProfile.qr],
      });
    } else if (
      this.userProfile.qr === "" &&
      this.userProfile.bind !== "" &&
      this.userProfile.bind !== "1" &&
      this.userProfile.url
    ) {
      tt.showModal({
        title: "温馨提示",
        content: "在手机浏览器上粘帖地址,使用手机号登录,马上游玩!",
        showCancel: false,
        confirmText: "朕知道了",
        success: () => {
          tt.setClipboardData({
            data: this.userProfile.url,
            success: () => {
              tt.getClipboardData();
            },
          });
        },
      });
    }
  }

  /**
   * 支付初始化
   * @param url
   * @param data
   */
  private payInit(url, data) {
    this.request({
      url,
      data,
    }).then((result: CommonRequestResult) => {
      if (result.code !== 1) {
        tt.showModal({
          title: "温馨提示",
          content: result.msg,
          showCancel: false,
        });
        return;
      }

      tt.requestGamePayment({
        mode: result.data.extra.mode,
        env: result.data.extra.env,
        currencyType: result.data.extra.currencyType,
        buyQuantity: result.data.extra.buyQuantity,
        platform: result.data.extra.platform,
        zoneId: 1,
        customId: result.data.order_no,
        extraInfo: result.data.extra.extraInfo,
        success: () => {
          const tradeUrl = `${this.config.domain}${this.api.pay_trade}`;
          const tradeData = {
            id: this.userInfo.id,
            openid: this.userInfo.username,
            order_no: result.data.order_no,
          };

          this.request({
            url: tradeUrl,
            data: tradeData,
          });
        },
        fail: (res) => {
          if (res.errCode < -10) {
            const msg = res.errMsg ? res.errMsg : "支付错误,请联系客服";
            tt.showModal({
              title: "温馨提示",
              content: msg,
              showCancel: false,
            });
          }
        },
      });
    });
  }

  /**
   * 进入游戏初始化
   */
  handleInit() {
    return new Promise((resolve, reject) => {
      this.getAdId();

      this.getSystemInfo();

      this.request({ url: `${this.config.domain}${this.api.init}` })
        .then((res: CommonRequestResult) => {
          if (res.code === 1) {
            this.openPay = res.data.client_time === 0;
            this.openListenReport = res.data.log === 1;
            this.shareAdId = res.data.share_adid;
          }

          this.handleListen();

          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * 玩家登录
   */
  handleLogin() {
    return new Promise((resolve, reject) => {
      tt.login({
        success: (result) => {
          if (!result.code) {
            return resolve({
              code: 9999,
              msg: result.errMsg,
              data: "",
            });
          }

          const url = `${this.config.domain}${this.api.token}`;
          const data = {
            authorize_code: base64_encode(
              headerContent(result.code, this.config, this.systemInfo)
            ),
            scope: "base",
            app_id: this.config.app_id,
            time: timestamp(),
          };

          Object.assign(data, {
            sign: md5(paramSort(data) + md5(this.config.token_key)),
          });

          this.request({
            url,
            data,
            encrypt: false,
            decrypt: true,
            code: result.code,
          })
            .then((res: CommonRequestResult) => {
              if (res.code !== 1) {
                return resolve({
                  code: 9999,
                  msg: "登录失败",
                  data: "",
                });
              }

              const userInfo = res.data;
              if (!userInfo.load) {
                return resolve({
                  code: 9999,
                  msg: "登录失败",
                  data: "",
                });
              }

              userInfo.time = getParam(userInfo.load, "time");
              userInfo.sign = getParam(userInfo.load, "sign");
              this.userInfo = userInfo;

              this.loginReport();

              resolve({
                code: res.code,
                msg: "登录成功",
                data: "",
              });
            })
            .catch((err) => {
              reject(err);
            });
        },
        fail: (err) => {
          reject(err);
        },
      });
    });
  }

  /**
   * 处理玩家概括
   */
  handleProfile() {
    return new Promise((resolve, reject) => {
      const url = `${this.config.domain}${this.api.profile}`;
      const data = {
        open_id: this.userInfo.access_token,
      };

      this.request({
        url,
        data,
      })
        .then((result: any) => {
          const nowDate = new Date(result.data.auth_identity.now * 1000);
          const nowDay = `${nowDate.getFullYear()}-${
            nowDate.getMonth() + 1
          }-${nowDate.getDate()}`;

          if (!this.loginDate) {
            this.loginDate = nowDay;
          } else if (this.loginDate !== nowDay) {
            this.loginDate = nowDay;
            this.onlineTime = 0;
          }

          if (result.data.interval) {
            this.onlineReport();
          }

          this.userProfile = result.data;

          resolve({
            code: 1,
            msg: "",
            data: this.userProfile,
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * 显示玩家概括
   */
  showProfile() {
    if (this.userProfile.auth_identity.auth_type === 0) {
      this.handleQrCode();

      return;
    }

    if (this.userProfile.id_card) {
      if (
        this.userProfile.auth_identity.auth_type === 1 &&
        this.userProfile.auth_identity.limit === 1
      ) {
        this.handleDatetime();
      }

      this.handleQrCode();

      return;
    }
  }

  /**
   * 处理支付
   * @param param
   */
  handlePay(param: CommonPayParam) {
    if (!this.systemInfo) {
      tt.showModal({
        title: "温馨提示",
        content: "初始化异常",
        showCancel: false,
      });
      return;
    }

    if (!this.userInfo) {
      tt.showModal({
        title: "温馨提示",
        content: "登录异常",
        showCancel: false,
      });
    }

    if (
      !param ||
      !param.out_trade_no ||
      !param.total_fee ||
      !param.server_id ||
      !param.role_id ||
      !param.role_name ||
      !param.product_id
    ) {
      tt.showModal({
        title: "温馨提示",
        content: "请检查支付参数",
        showCancel: false,
      });
      return;
    }

    const initUrl = `${this.config.domain}${this.api.pay_place}`;
    const initData = {
      id: this.userInfo.id,
      openid: this.userInfo.username,
      out_trade_no: param.out_trade_no,
      total_fee: param.total_fee,
      server_id: param.server_id,
      role_id: param.role_id,
      role_name: param.role_name,
      product_id: param.product_id,
    };

    const identityUrl = `${this.config.domain}${this.api.pay_identity}`;
    const identityData = {
      open_id: this.userInfo.access_token,
      count: param.total_fee,
    };

    this.request({
      url: identityUrl,
      data: identityData,
    }).then((result: CommonRequestResult) => {
      if (result.code === 1 && result.data.msg) {
        tt.showModal({
          title: "温馨提示",
          content: result.data.msg,
          showCancel: false,
          success: () => {
            if (result.data.limit === 0) {
              this.payInit(initUrl, initData);
            }
          },
        });
      } else {
        this.payInit(initUrl, initData);
      }
    });
  }

  /**
   * 处理分享
   */
  handleShare() {
    const packageId = this.config.ad_id || this.shareAdId;

    tt.shareAppMessage({
      title: this.config.slogan,
      imageUrl: this.config.share_img_url,
      query: `package_id=${packageId}`,
    });
  }

  /**
   * 处理公众号
   */
  handlePublicAccount() {
    tt.previewImage({
      urls: ["https://res.test.com/miniprogram/image/official-qr.png"],
    });
  }

  /**
   * 获取手机验证码
   * @param param
   */
  getPhoneCode(param) {
    return new Promise((resolve, reject) => {
      if (!this.userInfo) {
        return resolve({
          code: 9999,
          msg: "登录异常",
          data: "",
        });
      }

      if (!param || !param.phone || !/^1\d{10}$/.test(param.phone)) {
        return resolve({
          code: 9999,
          msg: "请输入正确的手机号码",
          data: "",
        });
      }

      const url = `${this.config.domain}${this.api.sms}`;
      const data = {
        open_id: this.userInfo.access_token,
        phone: param.phone,
      };

      this.request({
        url,
        data,
      })
        .then((result: CommonRequestResult) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * 绑定手机号
   * @param param
   */
  bindPhoneNumber(param) {
    return new Promise((resolve, reject) => {
      if (!this.userInfo) {
        return resolve({
          code: 9999,
          msg: "登录异常",
          data: "",
        });
      }

      if (!param || !param.phone || !/^1\d{10}$/.test(param.phone)) {
        return resolve({
          code: 9999,
          msg: "请输入正确的手机号码",
          data: "",
        });
      }

      if (!param.code || !/^\d{4}$/.test(param.code)) {
        return resolve({
          code: 9999,
          msg: "请输入正确的验证码",
          data: "",
        });
      }

      const url = `${this.config.domain}${this.api.code}`;
      const data = {
        open_id: this.userInfo.access_token,
        phone: param.phone,
        code: param.code,
      };

      this.request({
        url,
        data,
      })
        .then((result: CommonRequestResult) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * 角色上报
   * @param param
   */
  roleReport(param) {
    const url = `${this.config.domain}${this.api.log_role}`;
    const data = {
      id: this.userInfo.id,
      action: param.action || 1,
      server_id: param.server_id || "unknown",
      server_name: param.server_name || "unknown",
      role_id: param.role_id || "unknown",
      role_name: param.role_name || "unknown",
      role_level: param.role_level || 1,
      vip_level: param.vip_level || 0,
      balance: param.balance || 0,
      party_name: param.party_name || "unknown",
      role_create_time: param.role_create_time || 0,
      role_update_time: param.role_update_time || 0,
    };
    this.request({ url, data });
  }

  /**
   * 文本检测
   * @param param
   */
  textDetection(param) {
    return new Promise((resolve, reject) => {
      if (!param || !param.content) {
        return resolve({
          code: 9999,
          msg: "请输入正确的文本内容",
          data: "",
        });
      }

      const url = `${this.config.domain}${this.api.msg_check}`;
      const data = {
        content: param.content,
      };

      this.request({ url, data })
        .then((result: CommonRequestResult) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
