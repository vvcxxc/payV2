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
  Popup
} from 'vant';
Vue.use(Popup);

(function(){
  var $dom = document.createElement('div');
  $dom.style = 'font-size:10px;';
  document.body.appendChild($dom);
  // 计算出放大后的字体
  var scaledFontSize = parseInt(window.getComputedStyle($dom, null).getPropertyValue('font-size'));
  document.body.removeChild($dom);
  // 计算原字体和放大后字体的比例
  var scaleFactor = 10 / scaledFontSize;

  // 取html元素的字体大小
  // 注意，这个大小也经过缩放了
  // 所以下方计算的时候 *scaledFontSize是原来的html字体大小
  // 再次 *scaledFontSize才是我们要设置的大小
  var originRootFontSize = parseInt(window.getComputedStyle(document.documentElement, null).getPropertyValue('font-size'));
  document.documentElement.style.fontSize = originRootFontSize * scaleFactor * scaleFactor + 'px';
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