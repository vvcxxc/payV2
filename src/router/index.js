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
  if(process.env.VUE_APP_FLAG == 'development'){
    Cookie.set('test_token_auth','eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vdGVzdC5hcGkudGRpYW55aS5jb20vd2VjaGF0L3d4b2F1dGgiLCJpYXQiOjE1NzQ0MDcwMjYsImV4cCI6MTU3NDc2NzAyNiwibmJmIjoxNTc0NDA3MDI2LCJqdGkiOiJlY3dmQmZUZEVxVVRNc2plIiwic3ViIjo1MzQ1LCJwcnYiOiJmNmI3MTU0OWRiOGMyYzQyYjc1ODI3YWE0NGYwMmI3ZWU1MjlkMjRkIn0.5S_B7YCCde93tJV4WTGfM4h3b9FgcGudu8vUtpKrCWI')
  }
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