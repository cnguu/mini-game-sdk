import BasicService from "./basic";
import {
  base64_encode,
  headerContent,
  md5,
  paramSort,
  getParam,
  timestamp,
  xor_encode,
  xor_decode,
} from "@/utils/index";

import type { CommonRequestResult, CommonPayParam } from "@/types/common";
import type { GetSystemInfoSync } from "@/types/vivo";

export default class VivoService extends BasicService {
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

      qg.request({
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
   * 获取系统信息
   * @private
   */
  private getSystemInfo() {
    this.systemInfo = qg.getSystemInfoSync();
  }

  /**
   * 监听上报
   * @param url
   * @private
   */
  private listenReport(url) {
    if (this.openListenReport) {
      qg.request({ url });
    }
  }

  /**
   * 处理监听
   * @private
   */
  private handleListen() {
    // 屏幕保持常亮状态
    qg.setKeepScreenOn({ keepScreenOn: true });

    // 游戏切入前台
    qg.onShow(() => {
      if (this.userInfo.access_token) {
        this.listenReport(
          `${this.config.domain}${this.api.log_show}${this.userInfo.access_token}&page=main`
        );
      }
    });

    // 游戏切入后台
    qg.onHide(() => {
      if (this.userInfo.access_token) {
        this.listenReport(
          `${this.config.domain}${this.api.log_hide}${this.userInfo.access_token}&page=main`
        );
      }
    });

    // 全局错误
    qg.onError((data) => {
      if (this.userInfo.access_token) {
        this.listenReport(
          `${this.config.domain}${this.api.log_error}${data.message}&openid=${this.userInfo.access_token}&page=main`
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
   * 支付初始化
   * @param url
   * @param data
   */
  private payInit(url, data) {
    return new Promise((resolve, reject) => {
      this.request({
        url,
        data,
      })
        .then((res: CommonRequestResult) => {
          if (res.code !== 1) {
            return resolve({
              code: 9999,
              msg: res.msg,
              data: "",
            });
          }

          switch (res.data.type) {
            case 2:
              return resolve({
                code: res.code,
                msg: "二维码支付",
                data: res.data.value,
              });
            case 3:
              return resolve({
                code: res.code,
                msg: "复制支付链接,到浏览器内粘贴支付",
                data: res.data.value,
              });
            default:
              return resolve({
                code: 9999,
                msg: res.data.value,
                data: "",
              });
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * 进入游戏初始化
   */
  handleInit() {
    return new Promise((resolve, reject) => {
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
   * 需先初始化
   */
  handleLogin() {
    return new Promise((resolve, reject) => {
      if (this.systemInfo.platformVersionCode < 1063) {
        return resolve({
          code: 9999,
          msg: "版本低于1063",
          data: "",
        });
      }

      qg.login({
        success: (res) => {
          if (!res.data.token) {
            return resolve(res);
          }

          const url = `${this.config.domain}${this.api.token}`;
          const data = {
            authorize_code: base64_encode(
              headerContent(res.data.token, this.config, this.systemInfo)
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
            code: res.data.token,
          })
            .then((res: CommonRequestResult) => {
              if (res.code === 1) {
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

                return resolve({
                  code: res.code,
                  msg: "登录成功",
                  data: "",
                });
              }

              resolve(res);
            })
            .catch((err) => {
              reject(err);
            });
        },
        fail: (res) => {
          reject(res);
        },
      });
    });
  }

  /**
   * 处理支付
   */
  handlePay(param: CommonPayParam) {
    return new Promise((resolve, reject) => {
      if (!this.systemInfo) {
        return resolve({
          code: 9999,
          msg: "初始化异常",
          data: "",
        });
      }

      if (!this.userInfo) {
        return resolve({
          code: 9999,
          msg: "登录异常",
          data: "",
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
        return resolve({
          code: 9999,
          msg: "请检查支付参数",
          data: "",
        });
      }

      const initUrl = `${this.config.domain}${this.api.pay_init}`;
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
      }).then((res: CommonRequestResult) => {
        if (res.code === 1 && res.data.msg) {
          qg.showDialog({
            title: "温馨提示",
            message: res.data.msg,
            success: () => {
              if (res.data.limit === 0) {
                return this.payInit(initUrl, initData);
              }
            },
            cancel: () => {
              reject({
                code: 9999,
                msg: "操作取消",
                data: "",
              });
            },
          });
        } else {
          return this.payInit(initUrl, initData);
        }
      });
    });
  }
}
