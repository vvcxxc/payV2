import http from "./http_pay"

/**
 * 对接自己用的接口
 */

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
  });

/**
 * 获取支付广告
 */
export const requestGetAd = params =>
  http({
    url: 'v3/ads',
    method: 'get',
    params
  })

/**
 *    广告分润接口
 */
export const adShareProfit = (data) =>
http({
  url: 'v3/gatherAd',
  method: 'post',
  data
})
