<template>
  <div class="payBox">
    <!-- 广告 -->
    <div class="area-AD">
      <img src alt />
    </div>
    <!-- 展示信息 -->
    <div class="infoBox">
      <div class="infos">
        <p class="title">金额</p>
        <p class="money">￥3000.00</p>
      </div>
      <div class="infos">
        <p class="title">商家</p>
        <p>得利有限公司</p>
      </div>
      <div class="infos last_infos">
        <p class="title">商品</p>
        <p>得力文具03号铅笔橡皮套装</p>
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
export default {
  data() {
    return {};
  },
  created() {
    // this.getAd()
  },
  mounted() {
    this.getStoreInfo();
    let url = window.location.href;
    let info = getUrlParams(url);
    sessionStorage.setItem('111','111')
  },
  methods: {
    // 获取广告
    // getAd() {
    //     // requestGetAd({ position_id: 1, store_id: data.store_id }).then(res => {
    //     //     console.log(res)
    //     //     // this.ads = res.data;
    //     // });
    // }

    // 获取店铺信息
    getStoreInfo() {
      let params = {
        store_id: 222
      };
      vendingMachineInfo(params)
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          let { status } = err;
          if (status == 401) {
            let from = process.env.VUE_APP_FROM1;
            let browsertype = getBrowserType();
            if (browsertype == "wechat") {
              let codeid = getUrlParams().code_id;
              let url = process.env.VUE_APP_BASE_DOMAIN + "wechat/wxoauth?code_id=0&from=" + from;
              console.log(url)
              url = encodeURIComponent(url);
              let urls = "http://wxauth.tdianyi.com/index.html?appid=wxecdd282fde9a9dfd&redirect_uri=" + url + "&response_type=code&scope=snsapi_userinfo&connect_redirect=1&state=STATE&state=STATE";
              return window.location.href = urls;
            } else if (browsertype == "alipay") {
              let url = process.env.VUE_APP_BASE_DOMAIN + "ali/getZfbUserInfo";
              let codeid = getUrlParams().code_id;
              url = encodeURIComponent(url);
              window.location.href = process.env.VUE_APP_BASE_DOMAIN + "/ali/zfbUserAuth?code_id=0&from=" + from + "&url=" + url;
            }
          }
        });
    },

    // 支付
    async Pay() {
      let type = getBrowserType();
      if (type == "wechat") {
      } else {
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

