import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'

import Routers from './router'
import store from './store'
import FastClick from 'fastclick'

if ('addEventListener' in document) { 
     document.addEventListener('DOMContentLoaded', function() { 
         FastClick.attach(document.body);
      }, false);  
} 
Vue.use(VueRouter)
const router = new VueRouter({
  routes: Routers
})

Vue.config.productionTip = false
new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')