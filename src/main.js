import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'

import router from './router'
import store from './store'
import FastClick from 'fastclick';
import Vconsole from 'vconsole'
if(process.env.VUE_APP_FLAG == 'test' || process.env.VUE_APP_FLAG == 'release'){
  let vConsole = new Vconsole()
  Vue.use(vConsole)
}
if ('addEventListener' in document) { 
     document.addEventListener('DOMContentLoaded', function() { 
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