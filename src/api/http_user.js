import axios from "axios"
import qs from "qs"
import { getToken } from "../utils/get_info"
import { FETCH_OK, NOT_SIGN, NOT_FIND, SERVER_ERROR } from "../utils/global"
import store from "../store/index"
import { Toast } from "vant"
const config = {
  baseURL: process.env.VUE_APP_BASE_USER,
  timeout: 10000,
  headers: {
    Accept: "application/json"
  }
}
const instance = axios.create(config)
instance.interceptors.request.use(
  config => {
    store.dispatch("ajaxBefore");
    config.headers["Authorization"] = getToken()
    if (config.method.toLocaleLowerCase() === "post") {
      config.data = qs.stringify(config.data)
    }
    return config
  },
  err => {
    // console.log(err)
    store.dispatch("ajaxAfter")
    return Promise.error(err)
  }
)

instance.interceptors.response.use(
  response => {
    store.dispatch("ajaxAfter")
    if (response.status === FETCH_OK) {
      return response.data
    } else {
      return Promise.reject(response)
    }
  },
  err => {
    console.log(err)
    store.dispatch("ajaxAfter")
    const { code, message, response } = err
    if (code === 'ECONNABORTED' || message === 'Network Error') {
        Toast('网络异常');
    }
    // if(JSON.stringify(err).includes('timeout')){
    // }
    if(err)
    if (response) {
      const { status, data } = response
      switch (status) {
        case 400:
          Toast.fail(data.message)
          break
        case NOT_SIGN:
          import("../utils/handle_login").then(({ Login }) => {
            window.console.log("execute Login method")
            return Login()
          })
          break
        case NOT_FIND:
          window.console.log("HTTP: " + NOT_FIND)
          break
        case SERVER_ERROR:
          window.console.log("HTTP: " + SERVER_ERROR)
          break
        default:
          window.console.log(data.message)
      }
    }
    return Promise.reject(response || { message: "unkown error" })
  }
)

export default instance
