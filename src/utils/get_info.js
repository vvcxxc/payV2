import {Cookie} from './common';
import { WECHAT, ALIPAY, PRODUCTION, DEVELOPMENT } from './global'

const production = process.env.NODE_ENV === PRODUCTION
/**
 * 获取浏览器类型
 */ 
const getBrowserType = () => {
    switch (true) {
      case navigator.userAgent.toLowerCase().indexOf('micromessenger') > 0:
        return WECHAT
      case navigator.userAgent.toLowerCase().indexOf('alipay') > 0:
        return ALIPAY
      default:
        return ALIPAY
    }
}

/**
 * 获取url参数
 */
const getUrlParams = (original = window.location.href) => {
    if (!original.includes('?')) return {}
    let paramsStr = original.split('?')[1]
    let paramsArr = paramsStr && paramsStr.split('&')
    let result = {}
    paramsArr.length &&
      paramsArr.forEach(item => {
        let paramsItem = item.split('=')
        result[paramsItem[0]] = paramsItem[1]
      })
    return result
  }

/** 
 * 获取token
 * */   

const getToken = () => {
    const token = Cookie.get(process.env.VUE_APP_TOKEN);
    return token ? `Bearer ${token}` : '';
}

/**
 * 获取unionid
 */

const getUnionid = async ({ type = window.localStorage.browserType } = {}) => {
    if (type !== WECHAT) return ''
    const unionidValue = Cookie.get('unionid')
    return unionidValue ? unionidValue : ''
  }

/**
 * 获取userid
 */
// const getUserid = async ({ type = window.localStorage.browserType } = {}) => {
//     let useridValue = ''
//     if (type === WECHAT) {
//       const value = Cookie.get(production ? 'open_id' : 'test_open_id')
//       useridValue = value ? value : '' //'oy6pQ0x5_TCx3CNwN5gU5PdynBSA'
//     } else {
//       const value = Cookie.get(production ? 'alipay_user_id' : 'test_alipay_user_id')
//       useridValue = value ? value : '' // '2088612960091842'
//     }
//     if (!useridValue && process.env.NODE_ENV !== DEVELOPMENT) {
//       const { login } = await import('./handle_login.js')
//       login()
//     } else {
//       return type === WECHAT
//         ? { open_id: useridValue } : { alipay_user_id: useridValue }
//     }
//   }

export {
    getBrowserType,
    getUrlParams,
    getToken,
    getUnionid,
    // getUserid
}