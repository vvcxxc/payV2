/**
 * 优惠券信息（测试）
 */

 const COUPON_LIST = 'COUPON_LIST'
 const MONEY_OFF_LIST = 'MONEY_OFF_LIST'

 const state = {
     coupon_list: [],
     money_off_list: []
 }

 const actions = {
     setCouponList ({commit},list) {
         commit(COUPON_LIST,list)
     },
     setMoneyOffList ({commit},list) {
         commit(MONEY_OFF_LIST,list)
     }

     
 }

 const mutations = {
    [COUPON_LIST] (state,list) {
        state.coupon_list = list
    },
    [MONEY_OFF_LIST] (state,list) {
        state.money_off_list = list
    }

 }
 const getters = {
     coupon_list: state => state.coupon_list,
     money_off_list: state => state.money_off_list
 }

 export default {
    state,
    actions,
    mutations,
    getters
 }