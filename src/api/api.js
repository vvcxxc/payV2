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
  });

/**
 * 获取九宫格抽奖列表
 */
export const requestLotterys = params =>
  http({
    url: 'v3/Lotterys',
    method: 'get',
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
 * 获取抽奖结果
 */
export const requestGetResult = params =>
  http({
    url: 'v3/Lotterys/result',
    method: 'get',
    params
  })

/**
 * 立即领取优惠券
 */
export const requestGetCoupon = () =>
  http({
    url: 'v3/Lotterys/result',
    method: 'put',
  })

  /**
   * 下单返券
   */
export const requestOrderCoupons = params =>
  http({
    url: 'v3/return_coupons',
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


/**
 * 获取“全城寻爱”抽奖列表
 */
export const getCityLoveLotterys = (params) =>
  http({
    url: 'v3/Lotterys/activity_raffle_prize',
    method: 'get',
    params
  })

/**
 *  获取“全城寻爱”抽奖结果
 */
export const getCityLoveResult = () =>
  http({
    url: 'v3/Lotterys/activity_raffle',
    method: 'put',
  })