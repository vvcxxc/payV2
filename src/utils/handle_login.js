import { WECHAT } from './global'
import { getBrowserType, getUrlParams } from './get_info'
import { Cookie } from './common';

const devAuth = async (type) => {
    const { Cookie } = await import("@/utils/common");
    const storeid = "775";
    const codeid = "415";
    const openid = "oy6pQ05896O22gUAljVH4uqvCnhU";
    const unionid = "oH_aNw-EQhWUaNYFyTnID_7bONrw";
    const alipayUserid = "2088612960091842";
    const token = Cookie.get("test_token_auth");
    let url = window.location.href;
    if (!url.includes("code_id")) {
      url += `?code_id=${codeid}`;
    }
    
    if (
      Cookie.get("test_token_auth") ||
      Cookie.get("test_alipay_user_id") ||
      Cookie.get("test_open_id")
    ) {
      return;
    }
    // Cookie.set("test_token_auth", token);
    window.localStorage.setItem("storeid", storeid);
    if (type === WECHAT) {
      Cookie.set("test_open_id", openid);
      Cookie.set("unionid", unionid);
    } else {
      Cookie.set("test_alipay_user_id", alipayUserid);
    }
    window.location.replace(url);
  }

export const Login = () => {
    let _token = process.env.VUE_APP_TOKEN;
    let type = process.env.NODE_ENV;
    let browsertype = getBrowserType();
    let baseurl = process.env.VUE_APP_BASE_DOMAIN
    /**
     * 开发环境模拟
     */
    if(type = 'development'){
        devAuth(browsertype)
    }
    /**
     * 判断浏览器类型并进行登录
     *  */ 
    if(browsertype == 'wechat'){
        let token = Cookie.get(_token);
        if (token){
          console.log('登陆成功')
         
        }else{
            let codeid = getUrlParams().code_id;
            let url =  process.env.VUE_APP_BASE_DOMAIN + 'wechat/wxoauth?code_id='+codeid+'&from=onescan';
            // console.log(url)
            url = encodeURIComponent(url);
            console.log('http://wxauth.tdianyi.com/index.html?appid=wxecdd282fde9a9dfd&redirect_uri='+url+'&response_type=code&scope=snsapi_userinfo&connect_redirect=1&state=STATE&state=STATE')
            let urls = 'http://wxauth.tdianyi.com/index.html?appid=wxecdd282fde9a9dfd&redirect_uri='+url+'&response_type=code&scope=snsapi_userinfo&connect_redirect=1&state=STATE&state=STATE';
            console.log(urls)
            return location.href = urls;
        }
    }else{
        let token = Cookie.get(_token);
        // if (token){
        //     return
        // }else{
            console.log(11111)
            let url = "http://test.api.tdianyi.com/ali/getZfbUserInfo";
            let codeid = getUrlParams().code_id;
            url = encodeURIComponent(url);
            // console.log(baseurl+'ali/zfbUserAuth?code_id='+codeid+'&from=onescan&url='+url)
            window.location.href = 'http://test.api.tdianyi.com/ali/zfbUserAuth?code_id='+codeid+'&from=onescan&url='+url;
            // window.location.href = 'http://test.api.tdianyi.com/ali/zfbUserAuth?code_id='+codeid+'&from=onescan&url=http://test.api.tdianyi.com/ali/getZfbUserInfo'
        // }
    }
}
