<template>
  <div class="checkout">
    <div class="checkout-header">
      <div class="header-left" @click="login">立即登录</div>
      <div class="header-center">
        优惠信息
        <img src="../assets/question_mark.png" @click="openTips">
      </div>
      <div class="header-right" @click="close">
        <img src="../assets/header-close.png" >
      </div>
    </div>
    <!-- 满减头部 -->
    <div class="money_off" v-if="money_off_list">
      <i class="icon" />
        <div v-for="(value,key) in money_off_list" :key="key">
          <span>满{{key}}减{{value}}</span>
        </div>

    </div>
    <!-- 优惠栏 -->
    <div class="discount-tabs">
      <!-- 满减 -->
      <div class="money-off-tab" @click="isChoodeMoneyOff" v-if="key_value">
        <div class="money-off-title">
          <i class="icon" />
          <div>满减优惠</div>
        </div>
        <div class="money-off-choose">
          <div>-￥ {{key_value}}</div>
          <i v-bind:class="is_activity ? 'icon choose_money_off':'icon no_choose'" />
        </div>
      </div>
      <!-- 优惠券 -->
      <div class="coupon-tab">
        <div class="coupon-title">
          <i class="icon" />
          <div>优惠券</div>
        </div>
        <div class="coupon-num">已选{{num}}张</div>
      </div>
    </div>

    <!-- 优惠券列表 -->
    <div class="list-main">
      <!-- 有数据 -->
      <div class="list" v-if="list.length">
        <div
          class="list-items"
          v-for="(item,idx) in list"
          :key="idx"
          @click="item.choose && chooseCoupon(item)"
        >
          <div v-bind:class="item.choose ? ' item flex spendable' : 'item flex no-use'">
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
                <div class="item-date">{{item.expiration}}</div>
              </div>
              <div
                v-bind:class="item.ischecked ?  'icon check-box checked' : 'icon check-box no-checked'"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 无数据 -->
      <div class="no-data" v-else>
        <div class="no-data-bj">
          <img src="../assets/no-data.png" />
        </div>
        <div class="no-data-text">暂无优惠券</div>
      </div>
    </div>

    <!-- 确认按钮 -->
    <div class="confirm" @click="Confirm">确认</div>

    <!-- 提示信息-->
   <van-overlay :show='tip_show' :z-index="1331" style="display:unset" @click="tip_show = false">
     <div class="wrapper" @click.stop>
        <div class="tips-box">
          <div class="tips-title">优惠信息</div>
          <div class="tips-text">
            1.有门槛券和满减活动，只能选择一项；若需要更换优惠方式，请取消勾选后再做选择。
          </div>
          <div class="tips-text">
            2.在支付宝与微信两个渠道上获取的券，可能会出现无法跨渠道使用的情况，请先登录同步卡券。
          </div>
          <div class="tips-button" @click="tip_show = false">确认</div>
        </div>
     </div>
   </van-overlay>
  </div>
</template>
<script>
import { NewArrObj, Compare, RemoveDup,accAdd } from "../utils/common.js";
import store from "../store/index";
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      list: [], // 优惠券的列表
      id: [], // 优惠券的id
      num: 0, // 选择优惠券的数量
      key: 0, //满多少
      key_value: 0, //减多少
      is_activity: 0, //是否使用满减
      is_ok: true, //
      tip_show: false
    };
  },

  created() {},
  computed: {
    ...mapGetters(["coupon_list", "money_off_list"])
  },
  props: ["spendable_coupons", "coupon_id", "sum", "is_money_off"],
  watch: {
    list: function(a) {
      let num = 0;
      let id = [];
      let sums = 0
      for (let i in a) {
        if (a[i].ischecked == true) {
          id.push(a[i].coupons_id);
          num++;
          sums = accAdd(sums,a[i].money)
        }
      }
      this.sums = sums
      this.num = num;
      this.id = id;
    }
  },
  mounted() {
    this.is_activity = this.is_money_off;
    let list = [...this.coupon_list]
    for (let i in list){
      for (let a in this.coupon_id){
        if (this.coupon_id[a] == list[i].coupons_id){
          list[i].ischecked = true
        }
      }
    }
    this.list = list;
    this.isMoneyOff();
    this.compareList();
  },

  methods: {
    // 是否选择满减
    isChoodeMoneyOff() {
      let list = [...this.list];
      if (this.is_activity) {
        // 取消满减
        this.is_activity = 0;
        let arr = [];
        if (list.length) {
          for (let i in list) {
            if (list[i].full_money <= this.sum * 1 && list[i].is_threshold == 2) {
              arr.push(list[i]);
            }
          }
          if (arr.length) {
            arr.sort(Compare("money"));
            for (let i in list){
              if(list[i].coupons_id == arr[0].coupons_id){
                list[i].ischecked = true
                list[i].choose = 1
              }else if (list[i].coupons_id != arr[0].coupons_id && list[i].is_threshold == 2){
                list[i].ischecked = false;
                list[i].choose = 0
              }
            }
          }
        }
      } else {
        // 选择满减
        this.is_activity = 1;
        for (let i in list) {
          if (list[i].is_threshold == 2) {
            list[i].choose = 0;
            list[i].ischecked = false;
          }
        }
      }
      list.sort(Compare("money"));
      list.sort(Compare("choose"));
      list.sort(Compare("ischecked"));
      this.list = list;
    },
    // 跳转登录
    login (){
      this.$router.push({path: '/login'})
    },
    // 判断是否有满减
    isMoneyOff() {
      if (this.money_off_list) {
        for (let key in this.money_off_list) {
          if (this.sum * 1 >= key * 1) {
            this.key_value = this.money_off_list[key];
            this.key = key;
          }
        }
        if (this.sum * 1 < this.key * 1) {
          this.key = 0;
          this.key_value = 0;
        }
        if (this.key == 0) {
          this.key = 0;
          this.key_value = 0;
        }
      }
    },
    //  初始化排序 （未完成）
    compareList() {
      let list = [...this.list];
      let spendable = [...this.spendable_coupons];
      let id = [...this.coupon_id];
      for (let i in list) {
        list[i].choose = 0;
        for (let a in spendable) {
          if (list[i].coupons_id == spendable[a].coupons_id) {
            list[i].choose = 1;
          }
        }
        if (id.length) {
          list[i].ischecked = false;
          for (let a in id) {
            if (list[i].coupons_id == id[a]) {
              console.log(2123)
              list[i].ischecked = true;
            }
          }
        }
      }
      list = this.isThreshold(list);
      this.list = list;
    },

    // 判断选择的是否为有门槛券,并设置有门槛只能使用一张
    isThreshold(list) {
      let isok = false;
      if(!this.is_activity){
        for (let i in list) {
          if (list[i].ischecked && list[i].is_threshold == 2) {
            list[i].choose = 1;
            isok = true;
          }
        }
        if (isok) {
          for (let i in list) {
            if (list[i].ischecked == false && list[i].is_threshold == 2) {
              list[i].choose = 0;
            }
          }
        }
      }else {
        for (let i in list){
          if(list[i].is_threshold == 2){
            list[i].choose = 0
            list[i].ischecked = false
          }
        }
      }
      list.sort(Compare("money"));
      list.sort(Compare("choose"));
      list.sort(Compare("ischecked"));
      return list;
    },

    // 选择优惠券
    chooseCoupon(item) {
      let list = [...this.list];
      if (item.ischecked) {
        // 取消选择优惠券
        item.ischecked = false;
        for (let i in list) {
          if (list[i].coupons_id == item.coupons_id) {
            list[i].ischecked = false;
          }
        }
        list = this.isThresholdChecked(item, list);
      } else {
        // 选择优惠券
        item.ischecked = true;
        for (let i in list) {
          if (list[i].coupons_id == item.coupons_id) {
            list[i].ischecked = true;
          }
        }
        list = this.isThresholdChecked(item, list);
      }
      this.list = list;
    },

    // 选择的时候，判断
    isThresholdChecked(item, list) {
      if (item.is_threshold == 2 && item.ischecked == true) {
        for (let i in list) {
          if (
            list[i].coupons_id != item.coupons_id &&
            list[i].is_threshold == 2
          ) {
            list[i].choose = 0;
          }
        }
        this.is_activity = 0
      } else if (item.is_threshold == 2 && item.ischecked == false) {
        for (let i in list) {
          if (list[i].full_money * 1 <= this.sum) {
            list[i].choose = 1;
          }
        }
      }
      list.sort(Compare("money"));
      list.sort(Compare("choose"));
      list.sort(Compare("ischecked"));
      return list;
    },

    //  点击确定，向父组件传值
    Confirm() {
      this.id = RemoveDup(this.id);
      let sums = this.sums
      if (this.is_activity){
        console.log(this.key_value,'sss')
        sums = accAdd(sums,this.key_value)
      }
      if(this.is_ok){
        this.$emit("ListenToCoupon", this.id,sums, this.is_activity);
        this.is_ok = false
      }
    },
    close() {
      this.$emit('ListenCloseCoupon')
      this.is_ok = false;
    },
  //  打开提示
    openTips() {
      this.tip_show = !this.tip_show
      console.log(4123)
    }
  },
  beforeDestroy() {
    if(this.is_ok){
      this.is_ok = false;
      this.Confirm();
    }
  }
};
</script>
<style scoped lang='scss'>
.icon {
  background: url("../assets/icon.png") no-repeat;
  // background-size: 50%;
}
.flex {
  display: flex;
  align-items: center;
}
@import "./checkout-discount.scss";
</style>
