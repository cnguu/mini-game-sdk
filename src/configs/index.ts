import type { APP_CONFIG, APP_API } from "@/enums";

const config: APP_CONFIG = {
  domain: "__domain__",
  xor_key: "__xor_key__",
  app_id: "__app_id__",
  app_key: "__app_key__",
  ad_id: 0,
  token_key: "__token_key__",
  slogan: "__slogan__",
  share_img_url: "__share_img_url__",
};

const api: APP_API = {
  init: "/x_x/x_x",
  token: "/x_x/x_x",
  profile: "/x_x/x_x",
  login_log: "/x_x/x_x",
  log_show: "/x_x",
  log_hide: "/x_x",
  log_error: "/x_x",
  log_active: "/x_x/x_x",
  log_role: "/x_x/x_x",
  pay_init: "/x_x/x_x",
  pay_identity: "/x_x/x_x",
  pay_place: "/x_x/x_x",
  pay_trade: "/x_x/x_x",
  sms: "/x_x/x_x",
  code: "/x_x/x_x",
  msg_check: "/x_x/x_x",
};

export default { config, api };
