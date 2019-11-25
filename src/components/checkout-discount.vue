<template>
  <div class="checkout">
    <div class="checkout-header">
      优惠信息
    </div>
    <!-- 满减头部 -->
    <div class="money_off">
      <i class="icon"/>
      <div v-for="(value,key) in money_off_list" :key='key'>
        <span>满{{key}}减{{value}}</span>
      </div>
    </div>
    <!-- 优惠栏 -->
    <div class="discount-tabs">
      <!-- 满减 -->
      <div class="money-off-tab">
        <div class="money-off-title">
          <i class="icon" />
          <div>满减优惠</div>
        </div>
        <div class="money-off-choose">
          <div>-￥ 5.00</div>
          <i class="icon" />
        </div>
      </div>
      <!-- 优惠券 -->
      <div class="coupon-tab">
        <div class="coupon-title">
          <i class="icon" />
          <div>优惠券</div>
        </div>
        <div class="coupon-num">
          已选3张
        </div>
      </div>
    </div>

    <!-- 优惠券列表 -->
    <div class="list-main">
      <!-- 有数据 -->
      <div class="list" v-if="list.length">

        <div class="list-items" v-for="(item,idx) in list" :key="idx" @click="chooseCoupon(item)">
          <div class="item flex">
            <div class="item-left">
              <div class="item-money">￥{{item.money}}</div>
              <div class="item-text">满{{item.full_money}}元可用</div>
            </div>
            <div class="item-right flex">
              <div class="flex right-box">
                <div class="item-name">
                  <div class="item-store">{{item.store_name}}</div>
                  <div class="item-label">现金券</div>
                </div>
                <div class="item-date">
                  {{item.expiration}}
                </div>
              </div>
              <div v-bind:class="item.ischoose ?  'icon check-box checked' : 'icon check-box no-checked'"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 无数据 -->
      <div class="no-data" v-else>
        <div class="no-data-bj">
          <img src="../assets/no-data.png">
        </div>
        <div class="no-data-text">暂无优惠券</div>
      </div>
    </div>

    <!-- 确认按钮 -->
    <div class="confirm">
      确认
    </div>

  </div>
</template>
<script>
import { NewArrObj, Compare, RemoveDup } from "../utils/common.js";
import store from "../store/index"
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      list: []
    };
  },

  created() {
    
  },
  computed: {
    ...mapGetters(["coupon_list","money_off_list"])
  },
  props: ["spendable_coupons","coupon_id"],
  mounted (){
    this.list = this.coupon_list
    
  },

  methods: {
    //  初始化排序 （未完成）
    compareList (){
      let list = [...this.list]
      let spendable = [...this.spendable_coupons]
      let id = [...this.coupon_id]
      for (let i in list){
        list[i].choose = 0
        for (let a in spendable){
          if(list[i].coupons_id == spendable[a].coupons_id){
            list[i].choose = 1
          }
        }
      }
    },

    //  点击确定，向父组件传值
    Confirm() {
      this.id = RemoveDup(this.id);
      this.$emit("ListenToCoupon", this.id, this.sums);
    },
    // 选择优惠券（未完成）
    chooseCoupon(item) {
      console.log(item)
      let list = [...this.list]
      if(item.ischecked){
        // 取消选择优惠券
        for (let i in list){
          if(list[i].coupons_id == item.coupons_id){
            list[i].ischecked = false
          }
        }

      }else{
        // 选择优惠券
        for (let i in list){
          if(list[i].coupons_id == item.coupons_id){
            list[i].ischecked = true
          }
        }
      }
    }
  }
};
</script>
<style scoped lang='scss'>
.icon {
  background: url('../assets/icon.png') no-repeat;
  // background-size: 50%;
}
.flex {
  display: flex;
  align-items: center;
}
@import './checkout-discount.scss'

</style>
