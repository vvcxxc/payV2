import Vue from 'vue';
import VueRouter from 'vue-router';

import Pay from '../views/pay.vue';
import Activity from '../views/activity.vue'
Vue.use(VueRouter);

let router = [
  {
    path:'/',
    redirect:'/pay'
  },
  {
    path:'/pay',
    component:Pay
  },
  {
    path:'/activity',
    component:Activity
  }
]

export default router