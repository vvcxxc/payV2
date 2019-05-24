import Vue from 'vue';
import VueRouter from 'vue-router';

import Pay from '../views/pay.vue';
import Activity from '../views/activity.vue'

Vue.use(VueRouter);

var router = new VueRouter({
  // 命名:组件名大驼峰、path/name小驼峰
  mode: 'history',
  routes: [
          {
            path:'/',
            redirect:'/pay'
          },
          {
            path:'/pay',
            name:'pay',
            component:Pay
          },
          {
            path:'/activity',
            name:'activity',
            component:Activity
          }
  ]
})
export default router