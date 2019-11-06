/**
 * loading module
 *  + state
 *    - ajaxLoading
 */

const AJAX_BEFORE = 'AJAX_BEFORE'
const AJAX_AFTER = 'AJAX_AFTER'


const state = {
  ajaxLoading: true
}

const actions = {
  ajaxBefore ({ commit }) {
    commit(AJAX_BEFORE)
  },
  ajaxAfter ({ commit }) {
    commit(AJAX_AFTER)
  }
}

const mutations = {
  [AJAX_BEFORE] (state) {
    state.ajaxLoading = true
  },
  [AJAX_AFTER] (state) {
    state.ajaxLoading = false
  }
}

const getters = {
  ajaxLoading: state => state.ajaxLoading
}

export default {
  state,
  actions,
  mutations,
  getters
}