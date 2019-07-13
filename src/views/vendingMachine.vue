<template>
  <div class="payBox">
    <!-- 广告 -->
    <div class="area-AD">
      <img :src='ads.pic' alt />
    </div>
    <!-- 展示信息 -->
    <div class="infoBox">
      <div class="infos">
        <p class="title">金额</p>
        <p class="money">￥{{amount}}</p>
      </div>
      <div class="infos">
        <p class="title">商家</p>
        <p>{{store_name}}</p>
      </div>
      <div class="infos last_infos">
        <p class="title">商品</p>
        <p>{{goods_name}}</p>
      </div>
    </div>
    <!-- 支付按钮 -->
    <div class="flex">
      <div class="button" @click="Pay">确认支付</div>
    </div>
  </div>
</template>
<script>
import { requestGetAd } from "../api/api";
import { getUrlParams, getBrowserType } from "../utils/get_info";
import {
  vendingMachineInfo,
  vendingMachineWechat,
  vendingMachineAlipay
} from "../api/api";
import { Cookie } from "../utils/common";
import { decode } from 'punycode';
export default {
  data() {
    return {
      // 金额
      amount: "",
      // 店铺id
      store_id: "",
      // 支付签名
      pay_sign: "",
      // 商品名
      goods_name: "",
      // 订单号
      order_sn: "",
      // 渠道id
      channel_id: "",
      // 回调地址
      callback_url: "",
      ads: {
          pic: ''
      },
      store_name: ''
    };
  },
  created() {
   
  },
  mounted() {
    
    let url = window.location.href;
    url = decodeURI(url);
    decodeURI(url)
    let info = getUrlParams(url);
    if (info.amount) {
      sessionStorage.setItem("info", JSON.stringify(info));
    }
    let Info = JSON.parse(sessionStorage.getItem("info"));
    if (Info) {
      this.amount = Info.amount;
      this.store_id = Info.store_id;
      this.pay_sign = Info.pay_sign;
      this.goods_name = Info.goods_name;
      this.order_sn = Info.order_sn;
      this.channel_id = Info.channel_id;
      this.callback_url = Info.callback_url;
    }
    this.getStoreInfo();
    this.getAd();
  },
  methods: {
    // 获取广告
    getAd() {
      requestGetAd({ position_id: 1, store_id: this.store_id }).then(res => {
        this.ads = res.data;
      });
    },

    // 获取店铺信息
    getStoreInfo() {
      if (!this.store_id) {
        return;
      }
      let params = {
        store_id: this.store_id
      };
      vendingMachineInfo(params)
        .then(res => {
          this.store_name = res.data.name
        })
        .catch(err => {
          let { status } = err;
          if (status == 401) {
            let from = process.env.VUE_APP_FROM1;
            let browsertype = getBrowserType();
            if (browsertype == "wechat") {
              let url =
                process.env.VUE_APP_BASE_DOMAIN +
                "wechat/wxoauth?code_id=0&from=" +
                from;
              url = encodeURIComponent(url);
              let urls =
                "http://wxauth.tdianyi.com/index.html?appid=wxecdd282fde9a9dfd&redirect_uri=" +
                url +
                "&response_type=code&scope=snsapi_userinfo&connect_redirect=1&state=STATE&state=STATE";
                return window.location.href = urls;
            } else if (browsertype == "alipay") {
                alert('zoullll')
              let url = process.env.VUE_APP_BASE_DOMAIN + "ali/getZfbUserInfo";
              url = encodeURIComponent(url);
              window.location.href =
                process.env.VUE_APP_BASE_DOMAIN +
                "/ali/zfbUserAuth?code_id=0&store_id=1&from=" +
                from +
                "&url=" +
                url;
            }
          }
        });
    },

    // 支付
    async Pay() {
      let type = getBrowserType();
      let message = {
        order_sn: this.order_sn,
        store_name: this.storename,
        browsertype: type,
        amount: this.amount,
        result_money: 11
      };
      if (type == "wechat") {
        // 微信支付
        let open_id = Cookie.get(process.env.VUE_APP_OPEN_ID);
        let info = {
          amount: this.amount,
          store_id: this.store_id,
          open_id,
          callback_url: this.callback_url,
          order_sn: this.order_sn,
          goods_name: this.goods_name,
          pay_sign: this.pay_sign,
          channel_id: this.channel_id
        };

        let { data, code } = await vendingMachineWechat(info);
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
            function(res) {
              if (res.err_msg == "get_brand_wcpay_request:ok") {
                _this.$router.push({ name: "activity", params: message });
              }
            }
          );
        } else if (code == 201) {
          this.$router.push({ name: "activity", params: message });
        }
      } else {
        //   支付宝支付
        let alipay_user_id = Cookie.get(process.env.VUE_APP_ALIPAYID);
        let info = {
          amount: this.amount,
          store_id: this.store_id,
          alipay_user_id,
          callback_url: this.callback_url,
          order_sn: this.order_sn,
          goods_name: this.goods_name,
          pay_sign: this.pay_sign,
          channel_id: this.channel_id
        };
        let { data, code } = await vendingMachineAlipay(info);
        if (code == 200) {
          window.AlipayJSBridge.call(
            "tradePay",
            {
              tradeNO: data.alipayOrderSn
            },
            res => {
              if (res.resultCode === "9000") {
                _this.$router.push({ name: "activity", params: message });
                return {
                  message: "ok"
                };
              } else if (res.resultCode === "4000") {
                return {
                  message: "error",
                  error: res
                };
              }
            }
          );
        }
      }
    }
  }
};
</script>
<style scoped>
.payBox {
  width: 100%;
  height: 100%;
  background: #f2f2f2;
}
.area-AD {
  width: 100%;
  height: 155px;
}
.area-AD img {
  width: 100%;
  height: 100%;
}
.infoBox {
  background: #fff;
  padding-left: 0.13rem;
  padding-right: 0.08rem;
  box-sizing: border-box;
}
.infos {
  display: flex;
  justify-content: space-between;
  height: 0.45rem;
  align-content: center;
  align-items: center;
  border-bottom: 0.01rem solid rgba(49, 49, 49, 0.1);
}
.title {
  color: rgba(102, 102, 102, 1);
}
.money {
  color: #de1e13;
}
.last_infos {
  border-bottom: 0;
}
p {
  font-size: 0.13rem;
}
.flex {
  display: flex;
  justify-content: space-around;
}
.button {
  width: 3.45rem;
  margin-top: 60px;
  background: linear-gradient(
    90deg,
    rgba(255, 148, 20, 1),
    rgba(254, 134, 88, 1),
    rgba(255, 23, 9, 1)
  );
  border-radius: 0.05rem;
  color: #fff;
  text-align: center;
  line-height: 45px;
  height: 45px;
  font-size: 0.15rem;
}
</style>

