import { getBrowserType, getUrlParams } from './get_info'
import { Cookie } from './common';

export const Login = () => {
    let from = process.env.VUE_APP_FROM;
      let browsertype = getBrowserType();
      if (browsertype == "wechat") {
        let codeid = getUrlParams().code_id;
        let url =
          process.env.VUE_APP_BASE_DOMAIN +
          "wechat/wxoauth?code_id=" +
          codeid +
          "&from=" +
          from;
        url = encodeURIComponent(url);
        let urls =
          "http://wxauth.tdianyi.com/index.html?appid=wxecdd282fde9a9dfd&redirect_uri=" +
          url +
          "&response_type=code&scope=scope&connect_redirect=1&state=STATE&state=STATE";
        return (window.location.href = urls);
      } else if (browsertype == "alipay") {
        let url = process.env.VUE_APP_BASE_DOMAIN + "ali/getZfbUserInfo";
        let codeid = getUrlParams().code_id;
        url = encodeURIComponent(url);
        window.location.href =
          process.env.VUE_APP_BASE_DOMAIN +
          "/ali/zfbUserAuth?code_id=" +
          codeid +
          "&from=" +
          from +
          "&url=" +
          url;
      }
}
