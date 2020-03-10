import http from "./http_user"
// 会员模块的
/**
 *    手机登录
 * */ 
export const phoneLogin = (data) => 
http({
  url: 'v1/user/auth/login',
  method: 'put',
  data
})

/**
 *    获取手机验证码
 * */ 
export const getCode = data =>
http({
  url: 'v1/user/auth/verifyCode',
  method: 'post',
  data: {
    phone: data
  }
})

/**
 *  获取用户信息
 * */ 
export const getUserInfo = () =>
http({
  url: 'v1/user/user/user_info',
  method: 'get',
})