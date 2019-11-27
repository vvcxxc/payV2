import http from "./http"
/**
 * 对接第三方用的接口
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
 * 获取支付广告
 */
export const requestGetAd = params =>
  http({
    url: 'v3/ads',
    method: 'get',
    params
  })

/**
 *  自动贩卖机获取信息
 */
export const vendingMachineInfo = params =>
  http({
    url: 'v3/pay/apparatus_store_info',
    method: 'get',
    params
  })

/**
 *  自动贩卖机调取微信支付
 */
export const vendingMachineWechat = (data) =>
  http({
    url: 'v3/pay/wechatPay',
    method: 'post',
    data
  })

/**
 *  自动贩卖机调取支付宝支付
 */
export const vendingMachineAlipay = (data) =>
  http({
    url: 'v3/pay/alipay',
    method: 'post',
    data
  })