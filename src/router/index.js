import Vue from 'vue';
import VueRouter from 'vue-router';

// import Pay from '../views/pay.vue';
// import Activity from '../views/activity.vue';
// import Vending from '../views/vendingMachine.vue';
// import Ad from '../views/activity_ad.vue'
// import ActivityCard from '../views/activity_card.vue'
Vue.use(VueRouter);
const Pay = () => import('../views/pay.vue')
const Activity = () => import('../views/activity.vue')
const Vending = () => import('../views/vendingMachine.vue')
const Ad = () => import('../views/activity_ad.vue')
const ActivityCard = () => import('../views/activity_card.vue')
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
          },
          {
            path:'/vendingMachine',
            name:'vendingMachine',
            component:Vending
          },
          {
            path:'/activity_ad',
            name:'activity_ad',
            component:Ad
          },
          {
            path:'/activity_card',
            name:'activity_card',
            component:ActivityCard
          }
  ]
})
// router.beforeEach((to, from, next)=>{
//   console.log(from)
// })
router.onError((error) => {
  const pattern = /Loading chunk (\d)+ failed/g;
  const isChunkLoadFailed = error.message.match(pattern);
  const targetPath = router.history.pending.fullPath;
  if (isChunkLoadFailed) {
    router.replace(targetPath);
  }
})
export default router