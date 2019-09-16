import {Cookie} from './common';
import { WECHAT, ALIPAY, PRODUCTION, DEVELOPMENT } from './global'
import wx from 'weixin-js-sdk';
const production = process.env.NODE_ENV === PRODUCTION
import axios from "axios"
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
/**
 * 获取定位
 */
// const getLocation = () => {
//   let type = getBrowserType();
//   console.log(type, "8989");
//   if (type == 'wechat') {
//     // return new Promise((resolve) => {
//     //   resolve({
//     //     "latitude" : 123,
//     //     "longitude" : 212
//     //   })
//     // })
//     let url = location.href.split('#')[0];
//     axios({
//       url: 'http://api.supplier.tdianyi.com/wechat/getShareSign',
//       method: 'get',
//       data: {
//         url
//       }
//     }).then(res => {
//       let { data } = res;
//       wx.config({
//         debug: false,
//         appId: data.appId,
//         timestamp: data.timestamp,
//         nonceStr: data.nonceStr,
//         signature: data.signature,
//         jsApiList: [
//           "getLocation",
//           "openLocation",
//           'updateAppMessageShareData'
//         ]
//       });
//     })
//     return new Promise((resolve, reject) => {
//       if (location) return resolve(location)
//       wx.ready(() => {
//         wx.getLocation({
//           type: 'wgs84',
//           success: function (res) {
//             let latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
//             let longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
//             sessionStorage.setItem('location', JSON.stringify({ latitude, longitude }))
//             resolve({
//               latitude,
//               longitude
//             })
//           },
//           fail: function () {
//             console.log('定位失败啦')
//             reject({
//               latitude: '',
//               longitude: ''
//             })
//           }
//         });
//       }),
//         wx.error(() => {
//           console.log('error')
//         })
//     })
//   } else {
//     var map = new AMap.Map('', {
//       resizeEnable: true
//     });
//     return new Promise((resolve, reject) => {
//       AMap.plugin('AMap.Geolocation', function () {
//         var geolocation = new AMap.Geolocation({
//           enableHighAccuracy: true,
//           timeout: 1000,
//           buttonPosition: 'RB',
//           buttonOffset: new AMap.Pixel(10, 20),
//           zoomToAccuracy: true,
//         });
//         map.addControl(geolocation);
//         geolocation.getCurrentPosition(function (status, result) {
//           if (status == 'complete') {
//             let res = {
//               latitude: result.position.lat,
//               longitude: result.position.lng
//             }
//             resolve({
//               latitude: result.position.lat,
//               longitude: result.position.lng
//             })
//           } else {
//             reject({
//               msg: result.message
//             })
//           }
//         });
//       });
//     })
//   }

// }
const getLocation = () => {
  var map = new AMap.Map('', {
    resizeEnable: true
  });
  return new Promise((resolve, reject) => {
    // const location = Taro.getStorageSync("location");
    // if (location) return resolve(location)
    AMap.plugin('AMap.Geolocation', function () {
      var geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 1000,
        buttonPosition: 'RB',
        buttonOffset: new AMap.Pixel(10, 20),
        zoomToAccuracy: true,
      });
      map.addControl(geolocation);
      geolocation.getCurrentPosition(function (status, result) {
        if (status == 'complete') {
          let res = {
            latitude: result.position.lat,
            longitude: result.position.lng
          }
          // Taro.setStorageSync("location", res);
          resolve({
            latitude: result.position.lat,
            longitude: result.position.lng
          })
        } else {
          reject({
            msg: result.message
          })
        }
      });
    });
  })
}

export {
    getBrowserType,
    getUrlParams,
    getToken,
    getUnionid,
    getLocation
    // getUserid
}