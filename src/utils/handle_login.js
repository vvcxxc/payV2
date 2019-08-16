import { getBrowserType, getUrlParams } from './get_info'
import { Cookie } from './common';

// const devAuth = async (type) => {
//     const { Cookie } = await import("@/utils/common");
//     const storeid = "775";
//     const codeid = "415";
//     // const openid = "oy6pQ05896O22gUAljVH4uqvCnhU";
//     const unionid = "oH_aNw-EQhWUaNYFyTnID_7bONrw";
//     const alipayUserid = "2088612960091842";
//     const token = Cookie.get("test_token_auth");
//     let url = window.location.href;
//     if (!url.includes("code_id")) {
//       url += `?code_id=${codeid}`;
//     }
    
//     if (
//       Cookie.get("test_token_auth") ||
//       Cookie.get("test_alipay_user_id") ||
//       Cookie.get("test_open_id")
//     ) {
//       return;
//     }
//     // Cookie.set("test_token_auth", token);
//     window.localStorage.setItem("storeid", storeid);
//     if (type === WECHAT) {
//       Cookie.set("test_open_id", openid);
//       Cookie.set("unionid", unionid);
//     } else {
//       Cookie.set("test_alipay_user_id", alipayUserid);
//     }
//     window.location.replace(url);
//   }

export const Login = () => {
    let _token = process.env.VUE_APP_TOKEN;
    // let from = process.env.VUE_APP_FROM;
    let browserType = getBrowserType();
    let type = process.env.NODE_ENV;
    /**
     * 开发环境模拟
     */
    // if(type = 'development'){
    //     devAuth(browsertype)
    // }
    /**
     * 判断浏览器类型并进行登录
     *  */ 
    // if()
    // console.log(type);
    let url = window.location.href;
    // console.log(url)
    let from = url.split('?')[0];
    if (from.includes('vendingMachine')){
        from = process.env.VUE_APP_FROM1;
    } else{
        from = process.env.VUE_APP_FROM;
    }
    if(type == 'development'){
        
        return
    }
    if(browserType == 'wechat'){
        let token = Cookie.get(_token);
        
        if (token){
         return
        }else{
            let codeid = getUrlParams().code_id || 0;
            let url =  process.env.VUE_APP_BASE_DOMAIN + 'wechat/wxoauth?code_id='+codeid+'&from='+from;
            url = encodeURIComponent(url);
            let urls = 'http://wxauth.tdianyi.com/index.html?appid=wxecdd282fde9a9dfd&redirect_uri='+url+'&response_type=code&scope=snsapi_userinfo&connect_redirect=1&state=STATE&state=STATE';
            return window.location.href = urls;
        }
    }else{
        let token = Cookie.get(_token);
        if (token){
            return
        }else{
            let url = process.env.VUE_APP_BASE_DOMAIN +"ali/getZfbUserInfo";
            let codeid = getUrlParams().code_id || 0;
            url = encodeURIComponent(url);
            window.location.href = process.env.VUE_APP_BASE_DOMAIN +'/ali/zfbUserAuth?code_id='+codeid+'&from='+from+'&url='+url;
        }
    }
}
