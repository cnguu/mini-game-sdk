export interface Api {
  init: string;
  token: string;
  profile: string;
  login_log: string;
  log_show: string; // 切入前台上报
  log_hide: string; // 切入后台上报
  log_error: string; // 全局错误上报
  log_active: string;
  log_role: string;
  pay_init: string;
  pay_identity: string;
  pay_place: string;
  pay_trade: string;
  sms: string;
  code: string;
  msg_check: string;
}
