import Vue from 'vue'
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';
import VueRouter from 'vue-router'
import App from './App.vue'
import router from './router'
import store from './store'
import FastClick from 'fastclick';
import Vconsole from 'vconsole'
import {
  Popup,Overlay, NavBar, CountDown
} from 'vant';
Vue.use(Popup);
Vue.use(Overlay);
Vue.use(NavBar);
Vue.use(CountDown);

(function() {
  if (typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
      handleFontSize();
  } else {
      document.addEventListener("WeixinJSBridgeReady", handleFontSize, false);
  }
  function handleFontSize() {
      // 设置网页字体为默认大小
      WeixinJSBridge.invoke('setFontSizeCallback', { 'fontSize' : 0 });
      // 重写设置网页字体大小的事件
      WeixinJSBridge.on('menu:setfont', function() {
          WeixinJSBridge.invoke('setFontSizeCallback', { 'fontSize' : 0 });
      });
  }
})();

if (process.env.VUE_APP_FLAG == 'test' || process.env.VUE_APP_FLAG == 'release' || process.env.VUE_APP_FLAG == 'production') {
  Sentry.init({
    dsn: 'http://7e203dd3d7fc40e292addab1cba910c0@sentry.tdianyi.com/2',
    integrations: [new Integrations.Vue({
      Vue,
      attachProps: true
    })],
    environment: process.env.VUE_APP_FLAG
  });
}
if (process.env.VUE_APP_FLAG == 'test' || process.env.VUE_APP_FLAG == 'release') {
  let vConsole = new Vconsole()
  Vue.use(vConsole)
}
if ('addEventListener' in document) {
  document.addEventListener('DOMContentLoaded', function () {
    FastClick.attach(document.body);
  }, false);
}
Vue.use(VueRouter)

Vue.config.productionTip = false
new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')
