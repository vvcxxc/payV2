/**
 * public module | userid, browserType ...
 *  + state
 *  + actions
 *   - basicInfo 设置基本信息
 *   - userAuthInfo 设置用户认证信息
 *  + muations
 *  + getters
 */

const BASIC_INFO = 'BASIC_INFO'
const USER_AUTH_INFO = 'USER_AUTH_INFO'

const state = {
  codeid: '',
  unionid: '',
  browserType: '',
  userid: {}
}

const actions = {
  basicInfo (context, data ) {
    context.commit(BASIC_INFO, data)
  },
  userAuthInfo ({ commit }, data) {
    commit(USER_AUTH_INFO, data)
  }
}

const mutations = {
  [BASIC_INFO] (state, { type = '', codeid = '' }) {
    state.codeid = codeid
    state.browserType = type
    window.localStorage.setItem('codeid', codeid)
    window.localStorage.setItem('browserType', type)
  },
  [USER_AUTH_INFO] (state, { userid, unionid }) {
    state.unionid = unionid
    state.userid = userid
    window.localStorage.setItem('unionid', unionid)
    window.localStorage.setItem('userid', JSON.stringify(userid))
  }
}

const getters = {
  codeid: state => state.codeid
    ? state.codeid : window.localStorage.codeid
      ? window.localStorage.codeid : '',
  browserType: state => state.browserType
    ? state.browserType : window.localStorage.browserType
      ? window.localStorage.browserType : '',
  unionid: state => state.unionid
    ? state.unionid : window.localStorage.unionid
      ? window.localStorage.unionid : '',
  userid: state => Object.keys(state.userid).length
  ? state.userid : (() => {
      try {
        return JSON.parse(window.localStorage.userid)
      } catch (err) {
        return {}
      }
    })()
}

export default {
  state,
  actions,
  mutations,
  getters
}
