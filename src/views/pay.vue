<template>
  <div class="payment">
    <header v-if="info.is_reduction_removed">
      <i class="icon_tanhao"></i>
      <span
        v-for="(value,key) in info.reduction_money_list"
        :key="key"
        class="header_item"
      >满{{key}}减{{value}}</span>
    </header>
    <div class="area-AD">
      <img :src="ads.pic" alt />
    </div>
    <div class="input">
      <div class="input-price">
        ￥
        <p class="inputBox">
          <span class="no-sum" v-if="havesum" @click="haveSum">请输入付款金额</span>
          <span class="have-sum" v-if="!havesum">
            <div>{{sum}}</div>
            <div class="like-input"></div>
          </span>
          <span @click="cleansum" v-if="!havesum">
            <img src="../assets/quxiao.png" alt />
          </span>
        </p>
      </div>
      <div class="discount" @click="handlecoupons" v-if="havecoupon">
        <p>优惠信息</p>
        <div class="jianshao">
          <div class="youhui_text">{{youhui_text}}</div>
          <div class="jianshao_right">
            <div>-￥ {{sums}}</div>
            <img src="../assets/arro-right.png" />
          </div>
        </div>
      </div>
      <div class="amount">
        <span>合计：</span>
        <span class="total">
          <span style="font-size:.1rem">￥</span>
          {{this.amount}}
        </span>
      </div>
    </div>
    <div class="zhanwei"></div>
    <div class="area-keyboard">
      <x-keyboard
        v-on:change-sum="showSum"
        :sum="sum"
        :amount="amount"
        :coupon_id="coupon_id"
        :is_reduction_removed="is_money_off"
        :storename="info.store_name"
        :is_area="info.is_area"
        :ids="ids"
      />
    </div>

    <van-popup 
      round
      closeable
      v-model="is_show"
      position="bottom"
      :style="{ height: 'auto'}"
    >
        <checkout-discount
          v-if="is_show"
          :sum="sum"
          :spendable_coupons="spendable_coupons"
          :coupon_id="coupon_id"
          :is_money_off='is_money_off'
          v-on:ListenToCoupon="getCouponsid"
        />
    </van-popup>
  </div>
</template>

<script>
import XKeyboard from "../components/x-keyboard.vue";
import CheckoutDiscount from "../components/checkout-discount.vue";
import { getBrowserType, getUrlParams } from "../utils/get_info.js";
import { Compare, RemoveDup, accAdd, accSub } from "../utils/common.js";
import { Login } from "../utils/handle_login.js";
import { storeInfo, requestGetAd } from "../api/api_pay";
import "vant/lib/index.css";
import { Cookie } from "../utils/common";
import { Toast } from "vant";
import store from "../store/index"
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      havesum: false,
      ads: "",
      is_show: false,
      sum: "",
      amount: 0,
      coupon_id: [],
      is_money_off: 0,
      info: {},
      reduction_money_list: [],
      key: null,
      havecoupon: false,
      isshow: false,
      key_value: null,
      couponlist: [],
      spendable_coupons: [],
      havecoupon: false,
      coupon: "",
      sums: 0,
      manjian_rule: false,
      no_door: [], // 无门槛券的列表,
      ids: {},
      youhui_text: ''
    };
  },

  components: {
    XKeyboard,
    CheckoutDiscount
  },
  computed: {
    ...mapGetters(["coupon_list"])
  },

  watch: {
    sum: function(a) {
      if (a) {
        this.moneyOff();
        this.bestDiscount(a);
        let w = accSub(a, this.sums);
        let b = accSub(w, this.key_value);
        this.amount = b;
        if (this.amount < 0) {
          this.amount = 0;
        }
      } else {
        this.amount = 0;
        this.coupon_id = [];
      }
    },
    info: function() {
      this.couponlist = this.info.coupons_required_products_list;
      if (this.couponlist.length) {
        this.havecoupon = true;
        this.coupon = this.couponlist.length + "张";
        let arr = [];
        for (let i in this.couponlist) {
          if (this.couponlist[i].is_threshold == 1) {
            arr.push(this.couponlist[i]);
          }
        }
        this.no_door = arr;
      }
    },
    amount: function(a) {
      if (a*1 < 0){
        this.amount = 0
      }
    },
    coupon_id: function(a) {
      if (a.length) {
        if (this.is_money_off) {
          console.log(4)
          let w = accSub(this.sum, this.key_value);
          this.amount = accSub(w, this.sums);
        } else {
          console.log(3)
          this.amount = accSub(this.sum, this.sums);
        }
        for (let i in this.couponlist){
          for (let z in a){
            if(this.couponlist[i].coupons_id == a[z]){
              this.couponlist[i].ischecked = true
            }
          }
        }
        store.dispatch("setCouponList",this.couponlist)
      }else{
        if (this.is_money_off) {
          let w = accSub(this.sum, this.key_value);
          this.amount = w;
        } else {
          this.amount = this.sum;
        }
      }
    }
  },

  created() {
    this.getStoreinfo();
  },

  methods: {
    haveSum() {
      this.havesum = !this.havesum;
    },
    handlecoupons() {
      this.is_show = true;
    },

    // 显示金额
    showSum(sum, showSum) {
      this.sum = sum;
      this.havesum = showSum;
      if (!this.sum) {
        this.havesum = true;
      }
    },
    // 清空金额
    cleansum() {
      this.sum = "";
      this.havesum = true;
      this.amount = 0;
    },
    //  获取商店信息
    getStoreinfo() {
      let code_id = getUrlParams().code_id;
      let params = {
        code_id
      };
      storeInfo(params)
        .then(res => {
          let { data, code } = res;
          if (code == 200) {
            requestGetAd({ position_id: 1, store_id: data.store_id }).then(
              res => {
                this.ads = res.data;
                if (res.data.adLogId) {
                  this.ids = {
                    store_id: data.store_id,
                    adLogId: res.data.adLogId
                  };
                }
              }
            );
            this.info = data;
            this.reduction_money_list = this.info.reduction_money_list;
            store.dispatch("setCouponList",this.info.coupons_required_products_list)
            store.dispatch("setMoneyOffList",this.info.reduction_money_list)
            if (getBrowserType() == "alipay") {
              try {
                AlipayJSBridge.call("setTitle", {
                  title: data.store_name || "小熊敬礼支付"
                });
              } catch (err) {
                document.title = this.storeinfo.name || "小熊敬礼支付";
              }
            } else {
              document.title = data.store_name || "小熊敬礼支付";
            }
          } else if (code == 401) {
            Login();
          } else {
            Toast(res.message);
          }
        })
        .catch(err => {
          if (err.status == 401) {
            Login();
            console.log("未登录");
          }
          console.log(err);
          throw Error("--- 获取店铺基本信息出错 ---");
        });
    },

    // 判断是否有满减
    moneyOff() {
      this.key = 0;
      // this.manjian = 0;
      this.isshow = false;
      if (this.info.is_reduction_removed == 1) {
        let manjian = this.info.reduction_money_list;
        for (let key in manjian) {
          if (this.sum * 1 >= key * 1) {
            // this.manjian = manjian[key];
            this.key_value = manjian[key];
            this.key = key;
            this.isshow = true;
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

    // 最佳优惠
    bestDiscount(sum) {
      if (this.couponlist.length) {
        // 存在优惠券
        let usable = []; //可以使用的优惠券
        for (let i = 0; i < this.couponlist.length; i++) {
          if (sum >= this.couponlist[i].full_money) {
            usable.push(this.couponlist[i]);
          }
        }
        if (usable.length) {
          console.log(1);
          this.isMoney(usable);
        } else {
          console.log(2);
          this.spendable_coupons = [];
          this.coupon_id = [];
          if (this.sum * 1 >= this.key * 1) {
            this.is_money_off = 1;
          }
        }
      } else {
        if (this.sum * 1 >= this.key * 1) {
          this.is_money_off = 1;
        }
      }
      let num = 0
      let sums = 0
      if(this.coupon_id.length){
        for (let i in this.couponlist){
          if(this.coupon_id[i]){
            if(this.coupon_id[i] == this.couponlist[i].coupons_id){
              sums = accAdd(sums , this.couponlist[i].money)
            }
          }
        }
        num ++
      }
      if(this.is_money_off){
        sums = accAdd(sums, this.key_value)
        num ++
      }
      if(num){
        this.sums = sums
        this.youhui_text = '已选'+num+'项'
      }
    },
    /**
     * @arr 传入可用的优惠券的数组
     */
    isMoney(arr) {
      let id = [];
      arr.sort(Compare("money"));
      let best = []; // 最佳的优惠券的数组
      for (let i in arr) {
        if (arr[0].money == arr[i].money) {
          best.push(arr[i]);
        }
      }
      for (let i = 0; i < best.length; i++) {
        if (best[i].is_threshold == 2) {
          best = [best[i]];
        }
      }
      arr.unshift(best[0]);
      if (this.sum * 1 >= this.key * 1 && this.key*1 != 0) {
        console.log(5)
        if (best[0].money * 1 <= this.key_value * 1) {
          if (this.no_door.length) {
            this.no_door.sort(Compare("money"));
            this.coupon_id = [this.no_door[0].coupons_id];
            this.is_money_off = 1;
          } else {
            this.coupon_id = [];
            this.is_money_off = 1;
          }
        } else {
          console.log(6)
          if (best[0].is_threshold == 1) {
            this.is_money_off = 1;
          } else {
            this.is_money_off = 0;
          }
          id.push(best[0].coupons_id);
          this.coupon_id = id;
        }
      }else{
        console.log(7)
        this.is_money_off = 0;
        arr.sort(Compare('money'))
        id.push(arr[0].coupons_id)
        this.coupon_id = id
      }

      arr = RemoveDup(arr);
      this.spendable_coupons = arr;
    },

    // 监听从优惠券组件传回的值
    getCouponsid(id, sums, acticity) {
      this.is_money_off = acticity
      this.is_show = false;
      this.coupon_id = id;
      if (sums) {
        this.coupon = "-" + sums + "元";
        this.sums = sums;
      } else {
        this.sums = 0;
        this.coupon = this.couponlist.length + "张";
      }
    }
  }
};
</script>

<style scoped>
.header_item  {
  display: inline-block;
  margin-left: 4px;
}
.icon_tanhao {
  width: 0.16rem;
  height: 0.16rem;
  display: inline-block;
  background: url("../assets/tanhao.png") no-repeat;
  background-size: 100%;
  margin-right: 5px;
}
.manjian-rule {
  font-size: 12px;
  color: #d9d9d9;
}
.flex {
  display: flex;
  align-items: center;
}
.payment {
  background: #f2f2f2;
  height: 100%;
  overflow: auto;
}
.area-keyboard {
  position: fixed;
  bottom: 0;
  z-index: 10;
}
.area-mask {
  position: absolute;
  top: 0;
  z-index: 111;
}
.inputBox {
  height: 0.66rem;
}

@keyframes flick {
  0% {
    opacity: 0;
  }
  40% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
}
.link-input:after {
  content: "";
  display: inline-block;
  width: 1px;
  height: 12px;
  margin-left: 5px;
  background: #444;
  animation: flick 1s infinite;
}
.like-input {
  animation: flick 1s infinite;
  background: blue;
  display: inline-block;
  width: 1px;
  /* position: absolute; */
  top: 0.15rem;
  margin-left: 2px;
  height: 0.36rem;
}

header {
  height: 28px;
  font-size: 13px;
  line-height: 28px;
  background: rgba(243, 108, 107, 0.2);
  color: #ff3622;
  padding-left: 0.12rem;
  position: relative;
  display: flex;
  align-items: center;
}
.area-AD {
  height: 2.25rem;
  width: 100%;
}
.area-AD img {
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.area-keyboard {
  background: #f2f2f2;
}
.input {
  /* height: 1.125rem; */
  background: #fff;
  margin-top: 0.14rem;
}
.zhanwei {
  height: 2.52rem;
  width: 100%;
}
.input-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 0.66rem;
  font-size: 0.2rem;
  line-height: 0.66rem;
  padding: 0.22rem 0;
  margin: 0 0.11rem;
  border-bottom: 1px solid #ebebeb;
}
.input-price p {
  width: 3.28rem;
  font-size: 0.24rem;
  color: #c6c6c6;
  font-weight: 100;
  position: relative;
}
.input-price .no-sum {
  font-size: 0.23rem;
  position: absolute;
  left: 0;
  width: 3.4rem;
}
.input-price .have-sum {
  display: flex;
  align-items: center;
  font-size: 0.37rem;
  color: #313131;
  position: absolute;
  left: 0;
  font-weight: 500;
  line-height: 0.45rem;
  padding: 0.1rem 0;
  /* width: 3rem; */
  width: auto;
  height: 0.64rem;
  box-sizing: border-box;
}
.input-price .have-sum > div {
  display: inline-block;
}
.input-price span {
  float: right;
}
.input-price span img {
  width: 0.18rem;
}
.discount {
  height: 0.45rem;
  color: #313131;
  font-size: 0.13rem;
  margin: 0 0.11rem;
  border-bottom: 1px solid #ebebeb;
  display: flex;
  justify-content: space-between;
  align-items: center
}
.jianshao {
  width: 2.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center
}
.youhui_text {
  color: #BAC3C7;
  font-size: .12rem
}
.jianshao_right {
  width: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.jianshao_right div {
  margin-right: .1rem;
  font-weight: bold;
  font-size: 14px;
  line-height: unset
}
.jianshao img {
  height: 14px;
  width: 5px;
}

.amount {
  font-size: 0.13rem;
  line-height: 0.45rem;
  margin: 0 0.11rem;
  color: #313131;
}
.amount .total {
  color: #de1e13;
  float: right;
  font-size: 0.17rem;
  font-weight: 600;
}
.mask {
  background: #000;
  opacity: 0.7;
  width: 100vw;
  height: 100vh;
  position: absolute;
}
</style>
