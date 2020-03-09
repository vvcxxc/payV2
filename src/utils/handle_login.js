import { getBrowserType, getUrlParams } from './get_info'

/**
 * 自己的授权登录
 */
export const Login = () => {
    let from = window.location.href;
    // if(process.env.VUE_APP_FLAG == 'development'){
    //   return
    // }
    let VUE_APP_AUTH_URL = process.env.VUE_APP_AUTH_URL
    let VUE_APP_USER_API = process.env.VUE_APP_USER_API
    let browsertype = getBrowserType();
    if (browsertype == "wechat") {
      let codeid = getUrlParams().code_id;
      // let url =
      //   process.env.VUE_APP_BASE_DOMAIN +
      //   "wechat/wxoauth?code_id=" +
      //   codeid +
      //   "&from=" +
      //   from;
      let url = VUE_APP_USER_API + 'v1/user/auth/auth_h5?code_id='+codeid+'&from='+from
      url = encodeURIComponent(url);
      // let urls =
      //   "http://wxauth.tdianyi.com/index.html?appid=wxecdd282fde9a9dfd&redirect_uri=" +
      //   url +
      //   "&response_type=code&scope=snsapi_base&connect_redirect=1&state=STATE&state=STATE";
      let urls = VUE_APP_AUTH_URL + 'index_xcx.html?appid=wxfe816c3a5440ce7a&redirect_uri='+url+'&response_type=code&scope=snsapi_base&connect_redirect=1&state=STATE&state=STATE';
      return (window.location.href = urls);
    } else if (browsertype == "alipay") {
      // let url = process.env.VUE_APP_BASE_DOMAIN + "ali/getZfbUserInfo";
      let codeid = getUrlParams().code_id;
      let url = VUE_APP_USER_API + 'v1/user/auth/auth_ali?code_id='+codeid+'&from='+ from
      url = encodeURIComponent(url);
      // window.location.href =
      //   process.env.VUE_APP_BASE_DOMAIN +
      //   "/ali/zfbUserAuth?code_id=" +
      //   codeid +
      //   "&from=" +
      //   from +
      //   "&url=" +
      //   url;
      let urls = VUE_APP_AUTH_URL + 'ali.html?appid=2018080960968490&redirect_uri='+url+'&scope=auth_base&state=STATE'
      return window.location.href = urls;
    }
}

/**
 * 对接第三方的，授权登录
 */
export const Login1 = () => {
  let from = process.env.VUE_APP_FROM1;
  from = encodeURIComponent(from)
  let browsertype = getBrowserType();
  if (browsertype == "wechat") {
    let url =
      process.env.VUE_APP_BASE_DOMAIN +
      "wechat/wxoauth?code_id=0&from=" +
      from;
    url = encodeURIComponent(url);
    let urls =
      "http://wxauth.tdianyi.com/index.html?appid=wxecdd282fde9a9dfd&redirect_uri=" +
      url +
      "&response_type=code&scope=snsapi_base&connect_redirect=1&state=STATE&state=STATE";
      return window.location.href = urls;
  } else if (browsertype == "alipay") {
    let url = process.env.VUE_APP_BASE_DOMAIN + "ali/getZfbUserInfo";
    url = encodeURIComponent(url);
    window.location.href =
      process.env.VUE_APP_BASE_DOMAIN +
      "ali/zfbUserAuth?code_id=0&store_id="+this.store_id+"&from=" +
      from +
      "&url=" +
      url;
  }
}