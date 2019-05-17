import { WECHAT } from '@/utils/global'
/**
 * 支付模块
 * @param {method} handlePayment 微信支付|支付宝支付
 */

export default {
  methods: {
    async handlePayment (signature, browserType = window.localStorage.browserType) {
      const { wechatPayment, alipayPayment } = await import('@/utils/payment')
      let type = browserType
      if (!type) {
        const { getBrowserType } = await import('@/utils/get_info')
        type = getBrowserType()
      }
      let result = {}
      switch (type) {
        case WECHAT:
          result = await wechatPayment({ signature }).catch(err => {
            console.log(err)
            throw Error('--- 微信支付出错 ---')
          })
          break
        default:
          result = await alipayPayment({ signature }).catch(err => {
            console.log(err)
            throw Error('--- 支付宝支付出错 ---')
          })
          console.log('ali result')
          console.log(result)
      }
      return result
    }
  }
}
