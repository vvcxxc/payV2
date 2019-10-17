<template>
  <div class="payment">
    <!-- <header>{{this.info.store_name}}</header> -->
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
          <!-- <input class="have-sum" type="text" :value="sum" v-if="!havesum" ref='input'/> -->
          <span @click="cleansum" v-if="!havesum">
            <img src="../assets/quxiao.png" alt />
          </span>
        </p>
      </div>
      <div class="discount" @click="handlecoupons" v-if="havecoupon">
        <p style="float:left">优惠券</p>
        <p class="discount-tuijian" v-show="show_recommend">{{youhui}}</p>
        <p class="jianshao">
          <i style="font-size:14px"></i>
          <span>{{coupon}}</span>
          <img src="../assets/arro-right.png" />
        </p>
      </div>
      <div class="manjian" v-show="isshow" @click="chooseMoneyOff">
        <span>满减优惠</span>
        <span class="manjian-rule" v-show="manjian_rule">不能与有门槛券同时叠加</span>
        <span class="manjian-fudu flex">
          满 {{this.key}} 减 {{this.key_value}}
          <span class="choose_moneyoff" v-if="is_choose_moneyoff"></span>
          <span class="no_choose_moneyoff" v-else></span>
        </span>
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
      />
    </div>

    <!-- 选择优惠券 -->
    <div class="area-mask" v-if="isclose">
      <div class="mask"></div>
      <checkout-discount
        :couponlist="couponlist"
        :sum="sum"
        :spendable_coupons="spendable_coupons"
        :recommend_coupon="recommend_coupon"
        :coupon_id="coupon_id"
        v-on:ListenToCoupon="getCouponsid"
      />
    </div>
  </div>
</template>

<script>
import XKeyboard from "../components/x-keyboard.vue";
import CheckoutDiscount from "../components/checkout-discount.vue";
import { getBrowserType, getUrlParams } from "../utils/get_info.js";
import { Compare, removeElement } from "../utils/common.js";
import { storeInfo, requestGetAd } from "../api/api";
import "vant/lib/index.css";
import { Cookie } from "../utils/common";

export default {
  data() {
    return {
      isclose: false,
      sum: "",
      havesum: true,
      info: "",
      manjian: 0,
      key: null,
      key_value: null,
      isshow: false,
      coupon: "",
      havecoupon: false,
      couponlist: [],
      recommend_coupon: {},
      show_recommend: false,
      spendable_coupons: [],
      unable_coupons: [],
      amount: 0,
      couponsSum: 0,
      coupon_id: [],
      reduction_money_list: [],
      youhui: "已选推荐优惠",
      /**广告 */
      ads: {},

      //最佳优惠的id
      recommend_id: [],

      // 是否触发满减
      is_money_off: 0,
      // 是否选择满减
      is_choose_moneyoff: true,
      manjian_rule: false
    };
  },

  components: {
    XKeyboard,
    CheckoutDiscount
  },
 

  watch: {
    sum: function(newVal, oldVal) {
      if (newVal > 100000) {
        this.sum = oldVal;
      }
      this.is_choose_moneyoff = true;
      this.moneyOff();
      this.RecommendCoupon(newVal);
      if (newVal == "") {
        this.coupon_id = [];
        this.recommend_coupon = {};
        let num = this.couponlist.length;
        this.coupon = num + "张";
        this.amount = 0;
        this.show_recommend = false;
        this.couponsSum = 0;
        if (this.recommend_coupon == {}) {
          this.show_recommend = false;
        }
      }
      this.amount = newVal - this.manjian - this.couponsSum;
      this.amount = this.amount.toFixed(2);
    },
    manjian: function(a) {
      this.amount = this.sum * 1 - a - this.couponsSum * 1;
      if (this.amount < 0) {
        this.amount = 0;
      }
      if (a > 0) {
        this.is_money_off = 1;
      } else {
        this.is_money_off = 0;
      }
      this.amount = this.amount.toFixed(2);
    },
    couponsSum: function(a) {
      a = a * 1;
      a.toFixed(2);
      if (a == 0) {
        let num = this.couponlist.length;
        this.coupon = num + "张";
      } else {
        this.coupon = "-￥" + a;
      }
      this.amount = this.sum * 1 - a - this.manjian;
      this.amount = this.amount.toFixed(2);
      if (this.amount < 0) {
        this.amount = 0;
      }
    },
    info: function() {
      this.couponNum();
      this.couponlist = this.info.coupons_required_products_list;
    },
    amount: function(a) {
      if (a < 0) {
        this.amount = 0;
      }
    },
    coupon_id: function(a) {
      if (a.length == 0) {
        this.show_recommend = false;
      } else if (a.length == 1 && a[0] == this.recommend_id[0]) {
        this.show_recommend = true;
      }
    },
  },

  created() {
    this.getStoreinfo();
    let type = process.env.NODE_ENV;
    console.log(type);
    if (type == "development") {
      Cookie.set("test_open_id", "oy6pQ05896O22gUAljVH4uqvCnhU");
      Cookie.set("unionid", "oH_aNw-EQhWUaNYFyTnID_7bONrw");
      Cookie.set(
        "test_token_auth",
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vcmVsZWFzZS5hcGkudGRpYW55aS5jb20vd2VjaGF0L3d4b2F1dGgiLCJpYXQiOjE1NzEyNzU5OTQsImV4cCI6MTU3MTU3NTk5NCwibmJmIjoxNTcxMjc1OTk0LCJqdGkiOiJMcW90UUN0VHJmeGxuWXlDIiwic3ViIjozMzY3LCJwcnYiOiJmNmI3MTU0OWRiOGMyYzQyYjc1ODI3YWE0NGYwMmI3ZWU1MjlkMjRkIn0.V2QbrdZRu5jnNRQU1PIT55rZW-utvzbCSxMecp9HWnI"
      );
    }
  },

  mounted() {
    this.reduction_money_list = this.info.reduction_money_list;
  },

  methods: {
    // 是否选择满减
    chooseMoneyOff() {
      if (this.is_choose_moneyoff) {
        this.is_choose_moneyoff = false;
        this.is_money_off = 0;
        this.manjian = 0;
        this.manjian_rule = false
      } else {
        this.is_choose_moneyoff = true;
        this.is_money_off = 1;
        this.moneyOff();
        let arr = [...this.coupon_id];
        let arr1 = []
        let spendable_coupons = []
        let best_coupon = []
        if (arr.length) {
          for (let i = 0; i < arr.length; i++) {
            for (let a = 0; a < this.couponlist.length; a++) {
              if (
                this.couponlist[a].coupons_id == arr[i] &&
                this.couponlist[a].is_threshold == 2
              ) {
                arr1 = removeElement(this.coupon_id,arr[i])
                console.log(this.couponlist[a].money * 100)
                this.couponsSum = (this.couponsSum * 100 - Math.floor(this.couponlist[a].money * 100)) / 100
                console.log(this.couponlist[a].money)
                // this.couponsSum = Math.floor(this.couponsSum * 100) / 100
                if(this.couponsSum < 0){
                  this.couponsSum = 0
                }
                this.manjian_rule = true
              } else if (this.couponlist[a].coupons_id == arr[i] &&
                this.couponlist[a].is_threshold == 1){
                  this.recommend_coupon = this.couponlist[a]
                  arr1.push(this.couponlist[a].coupons_id)
                }
              if ( this.couponlist[a].is_threshold == 1){
                  spendable_coupons.push( this.couponlist[a])
                  best_coupon.push(this.couponlist[a])
                } else if ( this.couponlist[a].full_money < this.sum * 1){
                  spendable_coupons.push( this.couponlist[a])
                }
            }
          }
          this.spendable_coupons = spendable_coupons;
          this.recommend_coupon = best_coupon.length ? best_coupon[0] : []
          this.coupon_id = arr1
          this.youhui = "已选" + this.coupon_id.length + "张优惠券";
        }
      }
    },
    haveSum() {
      this.havesum = !this.havesum;
    },
    // 显示隐藏优惠券列表
    handlecoupons() {
      if (this.isclose) {
        _hmt.push(["_trackEvent", "选择优惠券", "选择优惠券"]);
      }
      this.isclose = !this.isclose;
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
    async getStoreinfo() {
      let code_id = getUrlParams().code_id;
      let params = {
        code_id
      };
      let { data } = await storeInfo(params).catch(err => {
        if (err.status == 401) {
          let from = process.env.VUE_APP_FROM;
          let browsertype = getBrowserType();
          if (browsertype == "wechat") {
            let codeid = getUrlParams().code_id;
            let url =
              process.env.VUE_APP_BASE_DOMAIN +
              "wechat/wxoauth?code_id=" +
              codeid +
              "&from=" +
              from;
            url = encodeURIComponent(url);
            let urls =
              "http://wxauth.tdianyi.com/index.html?appid=wxecdd282fde9a9dfd&redirect_uri=" +
              url +
              "&response_type=code&scope=snsapi_userinfo&connect_redirect=1&state=STATE&state=STATE";
            return (window.location.href = urls);
          } else if (browsertype == "alipay") {
            let url = process.env.VUE_APP_BASE_DOMAIN + "ali/getZfbUserInfo";
            let codeid = getUrlParams().code_id;
            url = encodeURIComponent(url);
            window.location.href =
              process.env.VUE_APP_BASE_DOMAIN +
              "/ali/zfbUserAuth?code_id=" +
              codeid +
              "&from=" +
              from +
              "&url=" +
              url;
          }
        }
        throw Error("--- 获取店铺基本信息出错 ---");
      });
      requestGetAd({ position_id: 1, store_id: data.store_id }).then(res => {
        this.ads = res.data;
      });
      this.info = data;
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
    },

    // 判断是否有满减
    moneyOff() {
      this.key = 0;
      this.manjian = 0;
      this.isshow = false;
      if (this.info.is_reduction_removed == 1) {
        let manjian = this.info.reduction_money_list;

        for (let key in manjian) {
          if (this.sum >= key * 1) {
            this.manjian = manjian[key];
            this.key_value = manjian[key];
            this.key = key;
            this.isshow = true;
          }
        }
      }
    },

    // 判断是否有优惠券及数量
    couponNum() {
      // let info = JSON.parse(JSON.stringify(this.info));

      var num = this.info.coupons_required_products_list.length;
      if (num) {
        this.havecoupon = true;
        this.coupon = num + "张";
      }
    },

    // 选择最佳优惠
    RecommendCoupon(newVal) {
      let list = this.info.coupons_required_products_list;
      let couponSum = 0;
      this.couponsSum = 0;
      let best_coupon = [];
      let spendable_coupons = [];
      this.coupon_id = [];

      if (list.length) {
        // 为每个优惠券添加一个属性，来判断它是否可用
        for (let a = 0; a < list.length; a++) {
          list[a].chooseable = 0;
        }
        if (this.info.is_reduction_removed == 1) {
          // 有满减的情况
          let manjian = this.info.reduction_money_list;
          let limits = [];
          let limit = 0;

          for (let key in manjian) {
            limits.push(key);
          }
          limit = limits[0];

          if (newVal * 1 >= limit) {
            // 达到满减要求
            // ========================== 重做ing ============================

            let arr = []; //达到使用条件的优惠券，包含右门槛及无门槛

            for (let i = 0; i < list.length; i++) {
              if (list[i].is_threshold == 1) {
                spendable_coupons.push(list[i]);
              }
              if (list[i].is_threshold == 1) {
                arr.push(list[i]);
              } else {
                if (list[i].full_money <= newVal * 1) {
                  arr.push(list[i]);
                }
              }
            }
            arr.sort(Compare("money"));
            if (arr[0].money*1 > this.key_value*1) {
              // 达到满减条件但是优惠券的金额大
              console.log(1)
              best_coupon.push(arr[0]);
              couponSum = best_coupon[0].money;
              this.coupon_id.push(best_coupon[0].coupons_id);
              this.recommend_id = [best_coupon[0].coupons_id];
              this.couponsSum = couponSum;
              this.recommend_coupon = best_coupon[0];
              this.spendable_coupons = arr;
              this.is_choose_moneyoff = false;
              this.manjian = 0;
            } else {
              // 达到满减条件但是优惠券的金额小
              console.log(arr[0].money > this.key_value)
              console.log('走着了')
              for (let i = 0; i < list.length; i ++){
                if (list[i].is_threshold == 1){
                  spendable_coupons.push(list[i])
                  best_coupon.push(list[i])
                } else if (list[i].full_money < newVal * 1){
                  spendable_coupons.push(list[i])
                }
              }
              if(best_coupon.length){
                this.youhui = "已选推荐优惠";
                this.recommend_coupon = best_coupon[0]
                this.show_recommend = true;
                this.couponsSum = best_coupon[0].money
              }else{
                this.recommend_coupon = {}
              }
              this.spendable_coupons = spendable_coupons
              this.coupon_id = []
              this.is_money_off = 1;
            }

            //  ============================================================
          } else {
            // 未达到满减要求
            for (let i = 0; i < list.length; i++) {
              if (list[i].is_threshold == 1) {
                spendable_coupons.push(list[i]);
              } else {
                if (list[i].full_money <= newVal * 1) {
                  spendable_coupons.push(list[i]);
                }
              }
              this.coupon_id = [];
            }
            // 存在可用券
            let arr = []; //把可用的优惠额度最高的放在这里
            if (spendable_coupons.length) {
              spendable_coupons.sort(Compare("money"));
              let money = spendable_coupons[0].money;
              for (let a = 0; a < spendable_coupons.length; a++) {
                if (money == spendable_coupons[a].money) {
                  arr.push(spendable_coupons[a]);
                }
              }
              if (arr.length <= 1) {
                best_coupon = arr[0];
                couponSum = best_coupon.money;
              } else {
                for (let a = 0; a < arr.length; a++) {
                  if (arr[a].is_threshold == 2) {
                    best_coupon = arr[a];
                    couponSum = best_coupon.money;
                  } else {
                    best_coupon = arr[a];
                    couponSum = best_coupon.money;
                  }
                }
              }
              this.coupon_id.push(best_coupon.coupons_id);
              this.recommend_id = [best_coupon.coupons_id];
            }
            this.recommend_coupon = best_coupon;
            this.spendable_coupons = spendable_coupons;
            this.couponsSum = couponSum;
            this.show_recommend = true;
            this.youhui = "已选推荐优惠";
            this.is_money_off = 0;
          }
        } else {
          // 没有满减的情况
          this.is_money_off = 0;
          for (let i = 0; i < list.length; i++) {
            if (list[i].is_threshold == 1) {
              spendable_coupons.push(list[i]);
            } else {
              if (list[i].full_money <= newVal * 1) {
                spendable_coupons.push(list[i]);
              }
            }
            this.coupon_id = [];
          }

          // 存在可用券
          let arr = []; //把可用的优惠额度最高的放在这里
          if (spendable_coupons.length) {
            spendable_coupons.sort(Compare("money"));
            let money = spendable_coupons[0].money;
            for (let a = 0; a < spendable_coupons.length; a++) {
              if (money == spendable_coupons[a].money) {
                arr.push(spendable_coupons[a]);
              }
            }
            if (arr.length <= 1) {
              best_coupon = arr[0];
              couponSum = best_coupon.money;
            } else {
              for (let a = 0; a < arr.length; a++) {
                if (arr[a].is_threshold == 2) {
                  best_coupon = arr[a];
                  couponSum = best_coupon.money;
                } else {
                  best_coupon = arr[a];
                  couponSum = best_coupon.money;
                }
              }
            }
            this.coupon_id.push(best_coupon.coupons_id);
            this.recommend_id = [best_coupon.coupons_id];
          }
          this.recommend_coupon = best_coupon;
          this.spendable_coupons = spendable_coupons;
          this.couponsSum = couponSum;
          this.show_recommend = true;
          this.youhui = "已选推荐优惠";
        }
      }
    },

    // 监听从优惠券组件传回的值
    getCouponsid(id, sums) {
      let is_have = false;
      let arr = []
      if (id.length) {
        for (let i = 0; i < id.length; i ++){
          for ( let a = 0; a < this.couponlist.length; a ++ ){
            if (id[i] == this.couponlist[a].coupons_id ){
              if (this.couponlist[a].is_threshold == 2){
                console.log('dasd')
                is_have = true;
                this.recommend_coupon = this.couponlist[a]
              } else {
                arr.push(this.couponlist[a])
              }
              this.is_choose_moneyoff = false;
              this.is_money_off = 0;
              this.manjian = 0;
            }
          }
        }
        if(!is_have){
          console.log(523) 
          arr = arr.sort(Compare('money'))
          this.recommend_coupon = arr[0]
          this.is_choose_moneyoff = true
          this.manjian = this.key_value
        }
        this.couponsSum = sums;
        this.coupon_id = id;
        this.youhui = "已选" + id.length + "张优惠券";
        this.show_recommend = true;
      } else {
        this.couponsSum = 0;
        this.coupon_id = id;
        this.recommend_coupon = {};
        this.show_recommend = false;
        this.is_choose_moneyoff = true
        this.manjian = this.key_value
      }
      this.isclose = false;
    }
  }
};
</script>

<style scoped>
.choose_moneyoff {
  display: inline-block;
  width: 18px;
  height: 18px;
  background: url("../assets/checked.png");
  background-size: 100%;
  margin-left: 10px;
}
.no_choose_moneyoff {
  display: inline-block;
  width: 18px;
  height: 18px;
  background: url("../assets/no-checked.png");
  background-size: 100%;
  margin-left: 10px;
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
  height: 47px;
  font-size: 17px;
  text-align: center;
  line-height: 47px;
  background: #fff;
}
.area-AD {
  height: 1.54rem;
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
.discount,
.manjian {
  height: 0.45rem;
  line-height: 0.45rem;
  color: #313131;
  font-size: 0.13rem;
  margin: 0 0.11rem;
  border-bottom: 1px solid #ebebeb;
  position: relative;
}
.jianshao img {
  width: 5px;
  margin-top: -2px;
}
.discount-tuijian {
  float: left;
  font-size: 0.12rem;
  line-height: 0.17rem;
  width: auto;
  padding: 0 0.04rem;
  height: 0.17rem;
  border: 1px solid #de1e13;
  border-radius: 2px;
  margin-top: 0.14rem;
  margin-left: 0.09rem;
  color: #de1e13;
}
.discount .jianshao,
.manjian-fudu {
  float: right;
  height: 0.45rem;
  line-height: 0.45rem;
  font-size: 0.12rem;
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
