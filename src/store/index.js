import Vue from "vue"
import Vuex from "vuex"

import _public from "./modules/public"
import payment from "./modules/payment"
import loading from './modules/loading'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    public: _public,
    payment,
    loading
  }
})
