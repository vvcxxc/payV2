import Vue from 'vue';
import VueRouter from 'vue-router';
import {Login} from '../utils/handle_login'
import { Cookie } from "../utils/common";
// import Pay from '../views/pay.vue';
// import Activity from '../views/activity.vue';
// import Vending from '../views/vendingMachine.vue';
// import Ad from '../views/activity_ad.vue'
// import ActivityCard from '../views/activity_card.vue'
Vue.use(VueRouter);
const Pay = () => import(/* webpackChunkName: "Pay" */ '@/views/pay.vue')
const Activity = () => import(/* webpackChunkName: "Pay" */ '@/views/activity.vue')
const Vending = () => import('@/views/vendingMachine.vue')
const Ad = () => import('@/views/activity_ad.vue')
const ActivityCard = () => import('@/views/activity_card.vue')

var router = new VueRouter({
  // 命名:组件名大驼峰、path/name小驼峰
  mode: 'history',
  routes: [{
      path: '/',
      redirect: '/pay'
    },
    {
      path: '/pay',
      name: 'pay',
      component: Pay
    },
    {
      path: '/activity',
      name: 'activity',
      component: Activity
    },
    {
      path: '/vendingMachine',
      name: 'vendingMachine',
      component: Vending
    },
    {
      path: '/activity_ad',
      name: 'activity_ad',
      component: Ad
    },
    {
      path: '/activity_card',
      name: 'activity_card',
      component: ActivityCard
    }
  ]
})

// 路由守卫
router.beforeEach((to,from,next) => {
  if(to.name == 'pay'){
    if (
      Cookie.get(process.env.VUE_APP_TOKEN) == "undefined" ||
      Cookie.get(process.env.VUE_APP_TOKEN) == ""
    ) {
      Login();
      return;
    }
  }
  next()
})


// 为了解决 loading chunk failed 错误
router.onError(error => {
  const pattern = /Loading chunk (\d)+ failed/g;
  const isChunkLoadFailed = error.message.match(pattern);
  const targetPath = router.history.pending.fullPath;
  try {
    if (isChunkLoadFailed) {
      let LoadingChunk = window.sessionStorage.getItem('LoadingChunk');
      if (LoadingChunk) {
        window.sessionStorage.setItem('LoadingChunk', LoadingChunk - 0 + 1);
      } else {
        window.sessionStorage.setItem('LoadingChunk', 1);
      }
      if (LoadingChunk - 0 > 1) {
        // 防止 死循环
        return false;
      }
      router.replace(targetPath);
      window.sessionStorage.setItem('LoadingChunkPath', targetPath);
    }
  } catch (e) {
    console.log(e);
  }
});
router.onReady(vm => {
  try {
    let LoadingChunkPath = window.sessionStorage.getItem('LoadingChunkPath');
    const path = vm.path;
    if (LoadingChunkPath) {
      if (path !== LoadingChunkPath && path !== '/') {
        window.sessionStorage.setItem('LoadingChunkPath', vm.path);
        router.replace(vm.path);
      } else {
        router.replace(LoadingChunkPath);
      }
    }
  } catch (e) {
    console.log(e);
  }
});
export default router