/**
 * payment module
 *  + state
 *   - payMoney 金额支付
 *   - couponVessel 使用的优惠券
 *  + actions
 *   - payMoney 设置支付金额
 *   - couponVessel 使用优惠券
 *   - couponVesselClean 清除
 *  + mutations
 *  + getters
 */

const PAY_MONEY = "PAY_MONEY"
const COUPON_VESSEL = "COUPON_VESSEL"
const ACTION_PUSH = "ACTION_PUSH"
const ACTION_REMOVE = "ACTION_REMOVE"
const ACTION_CLEAN = "ACTION_CLEAN"

const state = {
  payMoney: "",
  couponVessel: []
}

const actions = {
  payMoney ({ commit }, data) {
    commit(PAY_MONEY, data)
  },
  couponVessel ({ commit }, { coupon }) {
    const flagInclude = state.couponVessel.find(item => item.id === coupon.id)
    flagInclude ? commit(ACTION_REMOVE, { coupon }) : commit(ACTION_PUSH, { coupon })
  },
  couponVesselClean({ commit }) {
    commit(ACTION_CLEAN)
  }
}

const mutations = {
  [PAY_MONEY] (state, { money }) {
    state.payMoney = money
  },
  [ACTION_PUSH] (state, { coupon }) {
    state.couponVessel.push(coupon)
  },
  [ACTION_REMOVE] (state, { coupon }) {
    const coupons = state.couponVessel.filter(item => item.id != coupon.id)
    state.couponVessel = coupons
  },
  [ACTION_CLEAN] (state) {
    state.couponVessel = []
  }
}

const getters = {}

export default {
  state,
  actions,
  mutations,
  getters
}
