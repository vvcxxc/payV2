import Vue from 'vue';
import VueRouter from 'vue-router';
import {Login,Login1} from '../utils/handle_login'
import { Cookie } from "../utils/common";
Vue.use(VueRouter);
const Pay = () => import(/* webpackChunkName: "Pay" */ '@/views/pay.vue')
const Vending = () => import('@/views/vendingMachine.vue')
const LoginPage = () => import('@/views/login.vue')
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
      path: '/login',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/vendingMachine',
      name: 'vendingMachine',
      component: Vending
    },
  ]
})

// 路由守卫
router.beforeEach((to,from,next) => {
  if(process.env.VUE_APP_FLAG == 'development'){
    Cookie.set('test_open_id','oy6pQ05896O22gUAljVH4uqvCnhU')
    Cookie.set('phone_status','binded')
    Cookie.set('test_token_auth','eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vdGVzdC51c2VyY2VudGVyLnRkaWFueWkuY29tL3YxL3VzZXIvYXV0aC9hdXRoX2g1IiwiaWF0IjoxNTgzOTk4NDUzLCJleHAiOjE1ODQwODg0NTMsIm5iZiI6MTU4Mzk5ODQ1MywianRpIjoiNmdjWHNnWWtMZFllUVlnZyIsInN1YiI6MzY3NTUsInBydiI6IjU4N2VkNGViNGZmNmIwYjJkODk2YTliN2I3MTA0ZTcwYTViN2EwMDAifQ.YETnQUWqZOyDlH6V8nHDdWqOdml3DGDnzFQ9_xkjOyY')
  }
    if (
      Cookie.get(process.env.VUE_APP_TOKEN) == "undefined" ||
      Cookie.get(process.env.VUE_APP_TOKEN) == ""
    ) {
      // 自己的页面
      if(to.name == 'pay'){
        Login();
        return;
      }
      // 第三方的页面
      if(to.name == 'vendingMachine'){
        Login1();
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
