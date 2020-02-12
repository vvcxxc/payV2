<template>
  <div class="keyboard-box">
    <div class="number">
      <ul class="number-area">
        <li v-for="(item,idx) in kb.first" :key="idx" @click="inputNum">{{item}}</li>
      </ul>
      <ul class="number-area">
        <li v-for="(item,idx) in kb.second" :key="idx" @click="inputNum">{{item}}</li>
      </ul>
      <ul class="number-area">
        <li v-for="(item,idx) in kb.third" :key="idx" @click="inputNum">{{item}}</li>
      </ul>
      <ul class="number-area">
        <li style="width:1.82rem" @touchend="inputNum">0</li>
        <li @click="inputNum">.</li>
      </ul>
    </div>
    <div class="confirm">
      <ul class="pay-confirm">
        <li @click="backSpace">
          <img src="../assets/tuige.png" alt />
        </li>
        <li class="queding" @click="toPay" v-if="is_click">确定</li>
        <li class="no_queding" v-else>确定</li>
      </ul>
    </div>
    <div class="loading-box" v-if="ajaxLoading">
      <van-loading color="#fff" class="loading" vertical>Loading...</van-loading>
    </div>
  </div>
</template>
<script>
import { getUrlParams, getBrowserType } from "../utils/get_info";
import { Cookie } from "../utils/common";
import {
  requestWechatPayment,
  requestAlpayPayment,
  adShareProfit
} from "../api/api_pay";
import { Dialog, Loading, Toast } from "vant";
import { mapGetters } from "vuex";
import { async } from "q";
export default {
  data() {
    return {
      kb: {
        first: ["1", "2", "3"],
        second: ["4", "5", "6"],
        third: ["7", "8", "9"]
      },
      currentValue: "",
      showSum: false,
      amounts: "",
      id: [],
      activity: 0,
      is_click: false,
      is_loading: false
    };
  },
  components: {
    [Loading.name]: Loading
  },
  computed: {
    ...mapGetters(["ajaxLoading"])
  },
  props: [
    "sum",
    "amount",
    "coupon_id",
    "is_reduction_removed",
    "storename",
    "is_area",
    "ids",
    "area_id",
    "store_id"
  ],
  watch: {
    sum: function(newVal) {
      if (newVal == 0) {
        this.is_click = false;
      } else {
        this.is_click = true;
      }
      this.currentValue = newVal;
    },
    amount: function(a) {
      this.amounts = a;
    },
    coupon_id: function(a) {
      this.id = a;
    },
    is_reduction_removed: function(a) {
      this.activity = a;
    }
  },
  methods: {
    inputNum(ev) {
      let kb = ev.target.innerText;

      switch (true) {
        case kb == "." && this.currentValue.length == 0:
          this.currentValue = "0.";
          break;
        case kb == "." && !!~this.currentValue.indexOf("."):
          break;
        case kb == "0" && this.currentValue.length == 0:
          this.currentValue = "0.";
          break;
        default:
          if (this.currentValue == "0.0") {
            if (kb == 0) {
              this.currentValue = "0.0";
            } else {
              this.currentValue += kb;
            }
          } else {
            this.currentValue += kb;
          }
      }
      let idx = this.currentValue.indexOf(".");
      if (idx > 0) {
        if (this.currentValue.length > idx * 1 + 2) {
          this.currentValue = this.currentValue.substring(0, idx * 1 + 3);
        }
      }
      if (this.currentValue > 100000) {
        let str = this.currentValue;
        this.currentValue = str.substr(0, str.length - 1);
      }
      this.$emit("change-sum", this.currentValue, this.showSum);
    },
    // 回退
    backSpace() {
      let tempCurrentValue = [].slice.call(this.currentValue);

      switch (true) {
        case tempCurrentValue.length == 0:
          this.currentValue = "";
          break;
        default:
          tempCurrentValue.pop();
          this.currentValue = tempCurrentValue.join("");
      }

      this.$emit("change-sum", this.currentValue, this.showSum);
    },

    // 点击支付
    async toPay() {
      _hmt.push(["_trackEvent", "确认支付", "用户点击了确认按钮"]);
      let _this = this;
      let browsertype = getBrowserType();
      let code_id = getUrlParams().code_id;
      let amount = this.sum;
      let result_money = this.amount;
      let is_activities = this.activity;

      let youhui_log_id = this.id.join("_");
      if (amount == "" || amount == 0) {
        alert("请输入正确的金额");
      } else {
        sessionStorage.removeItem("is_ok");
        sessionStorage.removeItem("message");
        if (browsertype == "wechat") {
          // 微信支付
          let open_id = Cookie.get(process.env.VUE_APP_OPEN_ID);
          let params = {
            code_id,
            amount,
            youhui_log_id,
            open_id,
            is_activities,
            result_money
          };
          requestWechatPayment(params)
            .then(res => {
              let { code, data } = res;
              if (code == 2400) {
                Dialog.alert({
                  title: "提交失败",
                  message: "商家未开通微信或支付宝账户，暂无法收款",
                  confirmButtonColor: "#fc4833"
                });
                return;
              }
              var order_sn = data.order_sn;
              let message = {
                order_sn,
                store_name: this.storename,
                browsertype,
                amount,
                result_money
              };
              if (code == 200) {
                window.WeixinJSBridge.invoke(
                  "getBrandWCPayRequest",
                  {
                    appId: data.appId,
                    timeStamp: data.timeStamp,
                    nonceStr: data.nonceStr,
                    package: data.package,
                    signType: data.signType,
                    paySign: data.paySign
                  },
                  async function(res) {
                    if (res.err_msg == "get_brand_wcpay_request:ok") {
                      // 广告分润
                      console.log(_this.ids);
                      if (amount * 1 >= 1) {
                        if (_this.ids.store_id) {
                          await adShareProfit({ ..._this.ids, order_sn });
                        }
                      }

                      // 统计
                      _hmt.push(["_trackEvent", "微信支付", "支付成功"]);

                      // 跳到新的活动项目
                      if (_this.is_area && amount * 1 >= 3) {
                        location.href =
                          process.env.VUE_APP_ACTIVITY +
                          "collectCard?order_sn=" +
                          order_sn +
                          "&area_id=" +
                          _this.area_id +
                          "&store_id=" +
                          _this.store_id;
                      } else {
                        location.href =
                          process.env.VUE_APP_ACTIVITY +
                          "?order_sn=" +
                          order_sn +
                          "&area_id=" +
                          _this.area_id +
                          "&store_id=" +
                          _this.store_id;
                      }
                    } else if (
                      res.err_msg == "get_brand_wcpay_request:cancel"
                    ) {
                      _hmt.push([
                        "_trackEvent",
                        "取消微信支付",
                        "用户取消支付"
                      ]);
                    } else if (res.err_msg == "get_brand_wcpay_request:fail") {
                      _hmt.push(["_trackEvent", "微信支付失败", "支付失败"]);
                    }
                  }
                );
              } else if (code == 201) {
                // 统计
                _hmt.push(["_trackEvent", "微信支付", "支付成功"]);

                // 等待新的跳转路径（跳到新的活动项目）
                if (this.is_area && amount * 1 >= 3) {
                  location.href =
                    process.env.VUE_APP_ACTIVITY +
                      "collectCard?order_sn=" +
                    order_sn +
                    "&area_id=" +
                    this.area_id +
                    "&store_id=" +
                    this.store_id;
                } else {
                  location.href =
                    process.env.VUE_APP_ACTIVITY +
                    "?order_sn=" +
                    order_sn +
                    "&area_id=" +
                    this.area_id +
                    "&store_id=" +
                    this.store_id;
                }
              }
            })
            .catch(() => {
              // Toast("连接超时，请稍后重试");
            });
        } else if (browsertype == "alipay") {
          // 支付宝支付

          let alipayUuser = Cookie.get(process.env.VUE_APP_ALIPAYID);
          let params = {
            code_id,
            amount,
            youhui_log_id,
            alipay_user_id: alipayUuser,
            is_activities,
            result_money
          };
          // let { data, code } = await requestAlpayPayment(params);
          requestAlpayPayment(params)
            .then(res => {
              let { code, data } = res;
              if (code == 2400) {
                Dialog.alert({
                  title: "提交失败",
                  message: "商家未开通微信或支付宝账户，暂无法收款",
                  confirmButtonColor: "#fc4833"
                });
                return;
              }
              let order_sn = data.order_sn;
              let message = {
                order_sn,
                store_name: this.storename,
                browsertype,
                amount,
                result_money
              };
              if (code == 200) {
                window.AlipayJSBridge.call(
                  "tradePay",
                  {
                    tradeNO: data.alipayOrderSn
                  },
                  async res => {
                    if (res.resultCode === "9000") {
                      _hmt.push(["_trackEvent", "支付宝支付", "支付成功"]);
                      // 广告分润
                      console.log(_this.ids);
                      if (amount * 1 >= 1) {
                        if (_this.ids.adLogId) {
                          await adShareProfit({ ..._this.ids, order_sn });
                        }
                      }
                      console.log("跳转？");
                      if (_this.is_area && amount * 1 >= 3) {
                        // if (_this.is_area) {
                        location.href =
                          process.env.VUE_APP_ACTIVITY +
                            "collectCard?order_sn=" +
                          order_sn +
                          "&area_id=" +
                          _this.area_id +
                          "&store_id=" +
                          _this.store_id;
                      } else {
                        location.href =
                          process.env.VUE_APP_ACTIVITY +
                          "?order_sn=" +
                          order_sn +
                          "&area_id=" +
                          _this.area_id +
                          "&store_id=" +
                          _this.store_id;
                      }
                      return {
                        message: "ok"
                      };
                    } else if (res.resultCode === "4000") {
                      _hmt.push(["_trackEvent", "支付宝支付失败", "支付失败"]);
                      return {
                        message: "error",
                        error: res
                      };
                    } else if (res.resultCode === "6001") {
                      _hmt.push([
                        "_trackEvent",
                        "取消支付宝支付",
                        "用户取消支付"
                      ]);
                    }
                  }
                );
              } else if (code == 201) {
                _hmt.push(["_trackEvent", "支付宝支付", "支付成功"]);

                // 广告分润
                // if (amount*1 >= 1){
                //   adShareProfit({..._this.ids,order_sn})
                // }

                // 等待新的跳转路径（跳到新的活动项目）

                if (this.is_area && amount * 1 >= 3) {
                  // if (_this.is_area) {
                  location.href =
                    process.env.VUE_APP_ACTIVITY +
                    "?order_sn=" +
                    order_sn +
                    "&area_id=" +
                    this.area_id +
                    "&store_id=" +
                    this.store_id;
                } else {
                  location.href =
                    process.env.VUE_APP_ACTIVITY +
                     "collectCard?order_sn=" +
                    order_sn +
                    "&area_id=" +
                    this.area_id +
                    "&store_id=" +
                    this.store_id;
                }
              }
            })
            .catch(err => {
              console.log(err)
              // if(err.code == 40004){
              //   Toast("亲，当前使用支付宝支付账户与收款商家账户相同，无法支付，请切换账号支付。");
              // }
            });
        }
      }
    }
  }
};
</script>
<style>
.loading-box {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
}
.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
}
.keyboard-box {
  width: 100%;
  display: flex;
}
.van-dialog__header {
  font-weight: bold;
}
.number-area {
  display: flex;
}
li {
  font-size: 0.17rem;
  /* float: left; */
  line-height: 0.5rem;
  width: 0.88rem;
  /* height: .5rem; */
  height: 0.5rem;
  background: #fff;
  text-align: center;
  margin: 0.05rem 0 0 0.05rem;
  border-radius: 0.03rem;
}
li:active {
  background: #eeeeee;
}
ul::after {
  content: ".";
  clear: both;
  display: block;
  overflow: hidden;
  font-size: 0;
  height: 0;
}
.number {
  float: left;
}
.confirm {
  float: left;
}
.confirm li {
  float: none;
  width: 0.81rem;
  height: 1.07rem;
  line-height: 1.07rem;
}
.confirm li img {
  width: 0.26rem;
  pointer-events: none;
}
.queding {
  background: #ff9500;
  color: #fff;
  font-weight: bold;
}
.no_queding {
  background: #d9d9d9;
  color: #fff;
  font-weight: bold;
}
.no_queding:active {
  background: #d9d9d9;
}
.confirm,
.number {
  margin-bottom: 0.05rem;
}
</style>
