export interface CommonRequestResult {
  code: number;
  msg?: string;
  data?: any;
}

export interface CommonPayParam {
  out_trade_no: string;
  total_fee: string;
  server_id: string;
  role_id: string;
  role_name: string;
  product_id: string;
}
