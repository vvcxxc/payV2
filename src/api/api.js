import http from "./http"

// import axios from "axios";
/**
 * 获取店铺信息及优惠券活动
*/
export const storeInfo = params =>
  http({
    url: "v3/pay/store_info",
    method: "get",
    params
  })

/**
 * 请求微信支付参数 
 */
export const requestWechatPayment = params =>
  http({
    url:'v1/guest/storePay/wechatPay',
    method:'post',
    params,
  })


/**
 * 请求支付宝支付参数 
 */
export const requestAlpayPayment = params =>
  http({
    url:'v1/guest/storePay/alipay',
    method:'post',
    params
  })

/**
 * 获取店铺信息
 */
// export const storeInfo = params =>{
//   axios
// }