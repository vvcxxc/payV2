/**
 * 优惠券信息（测试）
 */

 const COUPON_LIST = 'COUPON_LIST'

 const state = {
     coupon_list: []
 }

 const actions = {
     setCouponList ({commit},list) {
         commit(COUPON_LIST,list)
     }
 }

 const mutations = {
    [COUPON_LIST] (state,list) {
        // console.log(list)
        state.coupon_list = list
    }
 }
 const getters = {
     coupon_list: state => state.coupon_list
 }

 export default {
    state,
    actions,
    mutations,
    getters
 }