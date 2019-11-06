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
        <!-- <p class="discount-tuijian" v-show="show_recommend">{{youhui}}</p> -->
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
          <span class="choose_moneyoff" v-if="is_money_off"></span>
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
        :is_area="info.is_area"
      />
    </div>

    <!-- 选择优惠券 -->
    <div class="area-mask" v-if="is_show">
      <div class="mask"></div>
      <checkout-discount
        :couponlist="couponlist"
        :sum="sum"
        :spendable_coupons="spendable_coupons"
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
import { Compare, RemoveDup } from "../utils/common.js";
import { storeInfo, requestGetAd } from "../api/api";
import "vant/lib/index.css";
import { Cookie } from "../utils/common";
import { Toast } from 'vant';
import { isString } from 'util';
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
      no_door: [] // 无门槛券的列表
    };
  },

  components: {
    XKeyboard,
    CheckoutDiscount
  },

  watch: {
    sum: function(a) {
      if (a) {
        console.log(a)
        this.moneyOff();
        this.bestDiscount(a);
        this.amount = (a * 10000 - this.sums * 10000 - this.key_value * 10000) / 10000;
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
    is_money_off: function(a) {
      if (a) {
        console.log(1)
        this.amount =
          (this.sum * 100 - this.key_value * 100 - this.sums * 100) / 100;
      } else {
        console.log(2)
        this.amount = (this.sum * 100 - this.sums * 100) / 100;
      }
      if (this.amount < 0) {
        this.amount = 0;
      }
    },
    coupon_id: function(a) {
      if (a.length) {
        let sums = 0;
        let arr = this.chooseList(this.couponlist, a);
        for (let i in arr) {
          sums = (arr[i].money * 100 + sums * 100) / 100;
        }
        this.coupon = "- " + sums + "元";
        this.sums = sums;
        if (this.is_money_off) {
          this.amount =
            (this.sum * 100 - this.key_value * 100 - sums * 100) / 100;
        } else {
          this.amount = (this.sum * 100 - this.sums * 100) / 100;
        }
      } else {
        this.sums = 0;
        if (this.is_money_off) {
          this.amount = (this.sum * 100 - this.key_value * 100) / 100;
        } else {
          this.amount = (this.sum * 100) / 100;
        }
        this.coupon = this.couponlist.length + "张";
      }
      if (this.amount < 0) {
        this.amount = 0;
      }
    }
  },

  created() {
    let type = process.env.NODE_ENV;
    if (type == "development") {
      Cookie.set("test_open_id", "oy6pQ05896O22gUAljVH4uqvCnhU");
      Cookie.set("unionid", "oH_aNw-EQhWUaNYFyTnID_7bONrw");
      Cookie.set(
        "test_token_auth",
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vdGVzdC5hcGkudGRpYW55aS5jb20vd2VjaGF0L3d4b2F1dGgiLCJpYXQiOjE1NzI5MjY0MzcsImV4cCI6MTU3MzIyNjQzNywibmJmIjoxNTcyOTI2NDM3LCJqdGkiOiIzUUNmSmRicTdWYVlhb3NtIiwic3ViIjo1MzQ1LCJwcnYiOiJmNmI3MTU0OWRiOGMyYzQyYjc1ODI3YWE0NGYwMmI3ZWU1MjlkMjRkIn0.ujeiMtWAEzuat2qibLFkpNKSlzkkspY_o57OiGIcc8E"
      );
    }
    if(Cookie.get(process.env.VUE_APP_TOKEN) == 'undefined' || Cookie.get(process.env.VUE_APP_TOKEN) == ''){
      console.log('来登录了')
      this.login()
      return
    }
    this.getStoreinfo();
  },

  mounted() {
    this.reduction_money_list = this.info.reduction_money_list;
  },

  methods: {
    // 是否选择满减
    chooseMoneyOff() {
      if (this.is_money_off) {
        // 取消选择满减
        this.manjian_rule = false;
        this.is_money_off = 0;
      } else {
        // 选择满减
        this.manjian_rule = true;
        this.is_money_off = 1;
        let id = [];
        for (let i in this.couponlist) {
          for (let a in this.coupon_id) {
            if (this.couponlist[i].coupons_id == this.coupon_id[a]) {
              if (this.couponlist[i].is_threshold != 2) {
                id.push(this.couponlist[i].coupons_id);
              }
            }
          }
        }
        this.coupon_id = id;
      }
    },
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
              }
            );
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
          }else if(code == 401){
            this.login()
          }else{
            Toast(res.message)
          }
        })
        .catch(err => {
          if (err.status == 401) {
            this.login();
          }
          throw Error("--- 获取店铺基本信息出错 ---");
        });
    },

    login() {
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
    // 返回已选择的优惠券列表
    chooseList(list, id) {
      let arr = [];
      for (let i in list) {
        for (let a in id) {
          if (list[i].coupons_id == id[a]) {
            arr.push(list[i]);
          }
        }
      }
      return arr;
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
          this.isMoney(usable);
        } else {
          if (this.sum * 1 >= this.key * 1) {
            console.log(1111);
            this.is_money_off = 1;
          }
        }
      }else{
         if(this.sum *1 >= this.key*1){
            console.log(1111)
            this.is_money_off = 1
          }
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
      if (this.sum * 1 >= this.key * 1) {
        if (best[0].money * 1 <= this.key_value * 1) {
          console.log(1);
          if (this.no_door.length) {
            this.no_door.sort(Compare("money"));
            this.coupon_id = [this.no_door[0].coupons_id];
            this.is_money_off = 1;
          } else {
            this.coupon_id = [];
            this.is_money_off = 1;
          }
        } else {
          console.log(2);
          if (best[0].is_threshold == 1) {
            this.is_money_off = 1;
          } else {
            this.is_money_off = 0;
          }
          id.push(best[0].coupons_id);
          this.coupon_id = id;
        }
      }

      arr = RemoveDup(arr);
      this.spendable_coupons = arr;
    },

    // 监听从优惠券组件传回的值
    getCouponsid(id, sums) {
      this.is_show = false;
      this.coupon_id = id;
      if (sums) {
        this.coupon = "-" + sums + "元";
        this.sums = sums;
      } else {
        this.sums = 0;
        this.coupon = this.couponlist.length + "张";
      }
      let is_ok = false;
      for (let i in this.couponlist) {
        for (let a in id) {
          if (this.couponlist[i].coupons_id == id[a]) {
            if (this.couponlist[i].is_threshold == 2) {
              is_ok = true;
            }
          }
        }
      }
      if (is_ok) {
        this.is_money_off = 0;
      } else {
        if (this.sum >= this.key) {
          this.is_money_off = 1;
        }
      }
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
