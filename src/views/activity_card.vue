<template>
  <div class="activity">
    <!-- 主题内容 -->
    <main>
      <div class="prizeWheels" v-if="is_ok">
        <div v-for="(item,idx) in list" :key="idx" class="item" :class="['item' + idx ]">
          <img :src="item.images" />
          <!-- <span v-if="item.youhui_type == 1" class="item_text">￥{{item.return_money}}现金券</span>
          <span v-if="item.youhui_type == 0" class="item_text">￥{{item.return_money}}兑换券</span>-->
          <!-- <span class="item_text">{{item.name}}</span> -->
          <span :class="item.active ? 'active' : 'active2'"></span>
        </div>
        <div class="item play" @click="play"></div>
      </div>
      <div class="prizeWheels" v-else-if="!is_ok">
        <div class="played">
          <div class="palyed_text">
            <p>您已抽过奖啦！</p>
            <p>前往小熊敬礼发现更多优惠信息吧！</p>
            <img src="../assets/played.png" class="played_img" @click="thanks" />
          </div>
        </div>
      </div>

      <div class="guize"></div>
    </main>

    <!-- 遮罩层 -->
    <div class="mask" style="display:block" v-if="is_show" @touchmove.prevent>
      <div class="getCoupon" v-if="is_get">
        <h2>
          恭喜您获得
          <span>{{order_coupon.store_name}}</span>到店红包
        </h2>
        <div class="coupon">
          <div class="coupon-left">
            <p class="sum">
              <i>￥</i>
              <span>{{order_coupon.return_money}}</span>
            </p>
            <p class="manjian">满{{order_coupon.total_fee}}可用</p>
          </div>
          <div class="coupon-right">
            <p class="coupon-shop">{{order_coupon.store_name}}</p>
            <p class="coupon-time">领取后{{order_coupon.expire_day}}日内有效</p>
            <p class="coupon-text">随时用/免预约</p>
          </div>
        </div>
        <p class="order_text">可在“订单”中查看</p>
        <div class="close" @click="closeOrderCoupon"></div>
      </div>
      <div v-if="is_lottery">
        <!-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->
        <div class="drawCoupon-cup" v-if="win_id == 2">
        <div class="getPrize-cup" @click="getPrize"></div>
        <!-- <div class="closePrize-cup" @click="closePrize"></div> -->
        </div>
        <div class="drawCoupon" v-else-if="win_id == 4">
        <div class="getPrize" @click="getPrize"></div>
        <!-- <div class="closePrize" @click="closePrize"></div> -->
        </div>
        <div class="drawCoupon-mianmo" v-else-if="win_id == 3">
          <div class="getPrize-mianmo" @click="getPrize"></div>
          <!-- <div class="closePrize-mianmo" @click="closePrize"></div> -->
        </div>
      </div>

      <div class="thankYou" v-if="is_thanks">
        <div class="thanks_go" @click="thanks"></div>
      </div>
    </div>
    <div class="loading-box" v-if="is_loading">
      <van-loading color="#fff" class="loading" vertical>Loading...</van-loading>
    </div>
  </div>
</template>
<script>
import "../assets/iconfont/iconfont.css";
import { getCityLoveLotterys, getCityLoveResult } from "../api/api";
import { Loading, Dialog } from "vant";
export default {
  data() {
    return {
      message: {},
      is_loading: true,
      isshow: false,
      // 头顶播报定时器
      timer5: null,
      /**抽奖列表 */
      list: [],
      // 上次停留位置 index
      lastIndex: 0,
      // 服务器返回停留位置 index
      stopIndex: 0,
      // 正常转动动画
      timer1: null,
      // 进入低速转动动画
      timer2: null,
      // 低速转动动画
      timer3: null,
      // 正在执行动画
      isMoving: false,
      // 转动次数 最小12次（一圈半） 防止转动时间过短
      times: 0,
      // 接口成功返回停止stopIndex 标识
      ajaxEnd: false,
      // 进入低速转动动画 标识
      timerEnd: false,
      //  只可进行一次抽奖
      is_one: true,
      //  显示遮罩层
      is_show: false,
      //  抽中奖品
      is_lottery: false,
      //  获得奖品
      is_get: false,
      //  抽奖返回的数据
      lottery_data: {},
      // 支付返券的数据
      order_coupon: {},
      // 谢谢参与
      is_thanks: false,
      success_icon: require("../assets/success_icon.png"),
      // loading定时器
      loading: null,
      // 是否显示实付金额
      is_result_money: true,
      is_ok: true,
      win_id: 0
    };
  },
  components: {
    [Loading.name]: Loading
  },
  watch: {
    times(val) {
      // 如果计数过程中，ajax未成功
      if (!this.ajaxEnd) {
        return false;
      }
      if (val >= 12) {
        this.timerEnd = true;
      }
    }
  },
  created() {
    if (sessionStorage.getItem("message")) {
      this.message = JSON.parse(sessionStorage.getItem("message"));
    } else {
      let message = this.$route.params;
      if (message.browsertype == "wechat") {
        message.browsertype = "微信支付";
      } else if (message.browsertype == "alipay") {
        message.browsertype = "支付宝支付";
      } else {
        message.browsertype = "";
      }
      if (!message.result_money) {
        this.is_result_money = false;
      }
      this.message = message;
      sessionStorage.setItem("message", JSON.stringify(message));
    }
    if (sessionStorage.getItem("is_ok")) {
      this.is_ok = false;
    } else {
      this.is_ok = true;
    }
  },
  mounted() {
    _hmt.push(["_trackEvent", "活动页", "跳转到活动页"]);
    this.getList();
    // this.move();

    this.loading = setTimeout(() => {
      this.is_loading = false;
    }, 2000);
  },

  methods: {
    thanks() {
      this.is_show = false;
      window.location.href = process.env.VUE_APP_SHOP;
    },
    closePrize() {
      this.is_lottery = false;
      this.is_show = false;
    },
    // 领取奖品
    getPrize (){
      this.is_show = false;
      window.location.href = process.env.VUE_APP_PRIZE;
    },

    getStopIndex() {
      // 获取服务器返回的index
      getCityLoveResult()
        .then(res => {
          let data = res.data;
          this.lottery_data = data;
          if (JSON.stringify(data).indexOf("参") > 0) {
            for (let a = 0; a < this.list.length; a++) {
              if (this.list[a].name == res.data) {
                this.stopIndex = a;
              }
            }
          } else {
            this.win_id = data.win_id;
            for (let a = 0; a < this.list.length; a++) {
              if (this.list[a].win_id == data.win_id) {
                this.stopIndex = a;
              }
            }
          }

          if (
            this.lastIndex !== this.stopIndex ||
            this.lastIndex === this.stopIndex
          ) {
            this.ajaxEnd = true;
          }
        })
        .catch(() => {
          clearInterval(this.timer1);
          this.list.map(e => {
            e.active = false;
          });
          this.lastIndex = 0;
          this.isMoving = false;
          this.lastIndex = 0;
          this.times = 0;
        });
    },
    play() {
      //点击开始游戏
      // let is_ok = sessionStorage.getItem("is_ok");
      // if (is_ok) {
      //   Dialog.alert({
      //     message: "您已抽奖",
      //     confirmButtonColor: "#fc4833"
      //   });
      //   return;
      // } else {
      //   sessionStorage.setItem("is_ok", 1);
      // }
      _hmt.push(["_trackEvent", "抽奖", "点击抽奖"]);
      if (this.isMoving) {
        return false;
      }
      // if (!this.is_one) {
      //   Dialog.alert({
      //     message: "您已抽奖",
      //     confirmButtonColor: "#fc4833"
      //   });
      //   return false;
      // }
      // this.is_one = false;
      this.isMoving = true;
      this.ajaxEnd = false;
      this.timerEnd = false;
      this.times = 0;
      let i = this.lastIndex;
      // 执行ajax请求数据
      this.getStopIndex();
      this.timer1 = setInterval(() => {
        this.times++;
        i++;
        if (i === 8) {
          i = 0;
        }

        this.list.map(e => {
          e.active = false;
        });
        this.$set(this.list[i], "active", true);
        // 当获取到服务器数据 index
        if (this.timerEnd) {
          clearInterval(this.timer1);
          this.enter(i, this.stopIndex);
        }
      }, 100);
    },
    enter(cur, stop) {
      // 计算需要停止的index
      let count = stop - cur;
      if (count <= 4) {
        count = count > -4 ? count + 8 : count + 16;
      }
      let i = cur;
      this.timer2 = setInterval(() => {
        count--;
        i++;
        if (i === 8) {
          i = 0;
        }
        this.list.map(e => {
          e.active = false;
        });
        this.$set(this.list[i], "active", true);
        if (count === 4) {
          clearInterval(this.timer2);
          this.stop(i);
        }
      }, 100);
    },
    stop(cur) {
      // 计算需要停止的index
      let count = 0;
      let i = cur;
      this.timer3 = setInterval(() => {
        count++;
        i++;
        if (i === 8) {
          i = 0;
        }
        this.list.map(e => {
          e.active = false;
        });
        this.$set(this.list[i], "active", true);
        if (count === 4) {
          clearInterval(this.timer3);
          this.isMoving = false;
          this.lastIndex = this.stopIndex;
          this.luckyTimes--;
          // 结束后-----
          if (JSON.stringify(this.lottery_data).indexOf("参") > 0) {
            setTimeout(()=>{
              this.is_show = true;
              this.is_thanks = true;
            },1500)
          } else {
            setTimeout(()=>{
              this.is_show = true;
              this.is_lottery = true;
            },1500)
            
          }
        }
      }, 300);
    },
    showOrder() {
      this.isshow = !this.isshow;
    },
    async getList() {
      let params = {
        xpoint: "113.450163",
        ypoint: "23.107527",
        order_sn: this.message.order_sn
      };
      let list = await getCityLoveLotterys(params);
      list = list.data;
      for (let i = 0; i < list.length; i++) {
        list[i].active = false;
      }
      this.list = list;
    },

    // 立即领取
    async getCoupon() {
      _hmt.push(["_trackEvent", "领取", "领取奖品"]);
      let data = await requestGetCoupon();
      // 还需要操作
      this.is_show = false;
      window.location.href =
        process.env.VUE_APP_SHOP + "id=" + this.lottery_data.store_id;
    }
  },
  beforeDestroy() {
    // 组件销毁前
    // 清除定时器
    clearInterval(this.timer1);
    clearInterval(this.timer2);
    clearInterval(this.timer3);
    clearInterval(this.timer);
  }
};
</script>
<style scoped>
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
.van-loading__text {
  color: #fff;
}

.activity-left {
  float: left;
  font-size: 17px;
}

.header {
  width: 100%;
  height: 0.55rem;
  background: #fff2e6;
  text-align: center;
  font-size: 0.17rem;
  color: #ff7f0e;
  font-weight: bold;
  line-height: 0.55rem;
}
.header img {
  width: 0.24rem;
  height: 0.24rem;
}
.xiangqing {
  font-size: 0.13rem;
  color: #ff6654;
  padding-right: 0.1rem;
}

/* 订单号部分 */
.order-num-zhanwei {
  height: 42px;
}
.order-num {
  font-size: 13px;
  position: absolute;
  width: 100vw;
  height: 42px;
  overflow: hidden;
  padding-top: 13px;
  text-align: left;
  line-height: 23px;
  padding-left: 13px;
  padding-right: 19px;
  background: #fff;
  z-index: 4;
}
.order-num1 {
  font-size: 13px;
  position: absolute;
  width: 100vw;
  height: auto;
  padding-bottom: 13px;
  overflow: hidden;
  padding-top: 13px;
  text-align: left;
  line-height: 23px;
  padding-left: 13px;
  padding-right: 19px;
  background: #fff;
  z-index: 4;
}
.order-num1 div {
  height: 23px;
}
.ordernum {
  display: block;
  position: absolute;
  left: 13px;
  top: 10px;
  height: 23px;
}
.ordernum::after {
  content: "";
  display: block;
  height: 0;
  clear: both;
}
.bottom-arro {
  position: absolute;
  top: 10px;
  right: 13px;
}
.order_text {
  color: #ffffff;
  font-size: 12px;
}

/* 头部滚动条 */
.scroll-top {
  height: 35px;
  background: rgba(167, 48, 8);
  font-size: 13px;
  color: #fff;
  line-height: 35px;
  overflow: hidden;
}
.scroll-sum {
  color: #ffcf5b;
}
.scroll-list {
  width: 1500px;
}
.scroll-list div {
  float: left;
}
#marquee {
  margin: 0 16px 0 0;
}
.scroll-item {
  padding-right: 26px;
  float: left;
}

/* 主体内容 */
main {
  width: 100vw;
  height: 12.5rem;
  background: url("../assets/activity-card.png") no-repeat;
  background-size: 100%;
  position: relative;
  background-position-y: -35px;
}
.prizeWheels {
  width: 3.48rem;
  height: 2.82rem;
  position: absolute;
  /* top: 2.15rem; */
  top: 2.4rem;
  left: 0.11rem;
  background: url("../assets/biaopan.png") no-repeat;
  background-size: 100%;
  padding: 0.2rem;
}
.item {
  width: 1.03rem;
  height: 0.78rem;
  position: absolute;
  border-radius: 7px;
}
.item img {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  /* transform: translateX(-50%); */
}
.item_text {
  font-size: 0.12rem;
  position: absolute;
  top: 0.5rem;
  display: block;
  width: 1.03rem;
  text-align: center;
}
.item0 {
  top: 0.2rem;
  left: 0.175rem;
}
.item1 {
  top: 0.2rem;
  left: 1.22rem;
}
.item2 {
  top: 0.2rem;
  left: 2.265rem;
}
.item7 {
  top: 0.99rem;
  left: 0.175rem;
}
.item3 {
  top: 0.99rem;
  left: 2.265rem;
}
.item6 {
  top: 1.78rem;
  left: 0.175rem;
}
.item5 {
  top: 1.78rem;
  left: 1.22rem;
}
.item4 {
  top: 1.78rem;
  left: 2.265rem;
}
.item .active {
  background: none;
  position: absolute;
  width: 1.03rem;
  height: 0.785rem;
  z-index: 2;
  border-radius: 7px;
}
.item .active2 {
  position: absolute;
  width: 1.03rem;
  height: 0.785rem;
  z-index: 2;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.27);
  border-radius: 7px;
}

.play {
  top: 0.99rem;
  left: 1.22rem;
  background: none;
}
.play:active {
  background: #313131;
  opacity: 0.3;
}

/* 遮罩层 */
.mask {
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  position: fixed;
  top: 0;
  z-index: 10;
}
.getCoupon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 2.61rem;
  width: 3.2rem;
}
.mask h2 {
  color: #fff;
  font-size: 0.18rem;
  line-height: 0.28rem;
  text-align: center;
  height: 0.645rem;
}
.mask h2 span {
  font-size: 0.28rem;
  color: #fff600;
}
.coupon {
  width: 3.2rem;
  height: 0.98rem;
  background: url("../assets/coupon.png") no-repeat;
  background-size: 100%;
  position: relative;
}
.drawCoupon {
  background: url("http://tmwl.oss-cn-shenzhen.aliyuncs.com/front/krxMmrJENizrwWr7rwYYanwFiB7hcfsM.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: absolute;
  top: 50%;
  left: -3%;
  transform: translateY(-70%);
  height: 3.915rem;
  width: 3.7rem;
  box-sizing: border-box;
  padding-top: 0.6rem;
  display: flex;
  align-items: center;
  flex-direction: column;
}
.drawCoupon-mianmo {
  background: url("http://tmwl.oss-cn-shenzhen.aliyuncs.com/front/e2xAyxd6KW3t8dFJFe7yd6tRKY5QtFr6.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: absolute;
  top: 50%;
  left: 10%;
  transform: translateY(-70%);
  height: 3.915rem;
  width: 3.7rem;
  box-sizing: border-box;
  padding-top: 0.6rem;
  display: flex;
  align-items: center;
  flex-direction: column;
}
.drawCoupon-cup {
  background: url("http://tmwl.oss-cn-shenzhen.aliyuncs.com/front/BBD3aJmAMzNBP3wbBCJ6DBRbrGtzHXsA.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: absolute;
  top: 50%;
  /* left: -1%; */
  transform: translateY(-70%);
  height: 3.915rem;
  width: 3.7rem;
  box-sizing: border-box;
  padding-top: 0.6rem;
  display: flex;
  align-items: center;
  flex-direction: column;
}
.getPrize-cup {
  width: 1.6rem;
  height: 0.4rem;
  background: url("http://tmwl.oss-cn-shenzhen.aliyuncs.com/front/FYSKTtEhfRpYw6AcRxGdsyXkFECJB2Bc.png")
    no-repeat;
  background-size: 100%;
  position: absolute;
  bottom: 0.25rem;
  left: 48%;
  transform: translateX(-50%);
}
.closePrize-cup {
  width: 0.34rem;
  height: 0.34rem;
  position: absolute;
  bottom: -0.5rem;
  background: url("http://tmwl.oss-cn-shenzhen.aliyuncs.com/front/bKbXsRD85NfSyahZ7zdMWjpQmSj5SWxf.png")
    no-repeat;
  background-size: 100%;
  left: 48%;
  transform: translateX(-50%);
}
.getPrize-mianmo {
  width: 1.6rem;
  height: 0.4rem;
  background: url("http://tmwl.oss-cn-shenzhen.aliyuncs.com/front/FYSKTtEhfRpYw6AcRxGdsyXkFECJB2Bc.png")
    no-repeat;
  background-size: 100%;
  position: absolute;
  bottom: 0.25rem;
  left: 41%;
  transform: translateX(-50%);
}
.closePrize-mianmo {
  width: 0.34rem;
  height: 0.34rem;
  position: absolute;
  bottom: -0.5rem;
  background: url("http://tmwl.oss-cn-shenzhen.aliyuncs.com/front/bKbXsRD85NfSyahZ7zdMWjpQmSj5SWxf.png")
    no-repeat;
  background-size: 100%;
  left: 40%;
  transform: translateX(-50%);
}
.getPrize {
  width: 1.6rem;
  height: 0.4rem;
  background: url("http://tmwl.oss-cn-shenzhen.aliyuncs.com/front/FYSKTtEhfRpYw6AcRxGdsyXkFECJB2Bc.png")
    no-repeat;
  background-size: 100%;
  position: absolute;
  bottom: 0.25rem;
  left: 53%;
  transform: translateX(-50%);
}
.closePrize {
  width: 0.34rem;
  height: 0.34rem;
  position: absolute;
  bottom: -0.5rem;
  background: url("http://tmwl.oss-cn-shenzhen.aliyuncs.com/front/bKbXsRD85NfSyahZ7zdMWjpQmSj5SWxf.png")
    no-repeat;
  background-size: 100%;
  left: 53%;
  transform: translateX(-50%);
}
.gift-coupon {
  width: 2.625rem;
  height: 0.81rem;
  background: #fff;
  background-size: 100%;
  position: relative;
}
.coupon-left-img {
  height: 0.81rem;
  width: 1.01rem;
  position: absolute;
  top: 0;
  left: 0;
}
.coupon-left-img img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.gift-coupon-right {
  position: absolute;
  left: 1.01rem;
  top: 0;
  height: 0.81rem;
  width: 1.615rem;
}
.mask .coupon-shop2 {
  font-size: 0.14rem;
  color: #313131;
  font-weight: bold;
  position: absolute;
  top: 0.08rem;
  left: 0.1rem;
}
.mask .coupon-time2 {
  font-size: 0.12rem;
  color: #999999;
  position: absolute;
  top: 0.27rem;
  left: 0.1rem;
}
.mask .coupon-text2 {
  font-size: 0.12rem;
  color: #999999;
  position: absolute;
  left: 0.1rem;
  top: 0.53rem;
}
.coupon2 {
  width: 2.625rem;
  height: 0.81rem;
  background: url("../assets/coupon.png") no-repeat;
  background-size: 100% 100%;
  position: relative;
}
.coupon2-left {
  color: #fff;
  width: 0.93rem;
  height: 0.81rem;
  position: absolute;
  left: 0rem;
  top: 0rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.mask .coupon2-right {
  position: absolute;
  left: 0.93rem;
  top: 0;
  height: 0.81rem;
  width: 1.7rem;
}
.receive {
  width: 2.14rem;
  height: 0.45rem;
  background: url("../assets/lijilingqu.png") no-repeat;
  background-size: 100% 100%;
  position: absolute;
  bottom: 0.6rem;
  left: 50%;
  transform: translateX(-50%);
}
.order_text2 {
  position: absolute;
  bottom: 0.305rem;
  left: 50%;
  transform: translateX(-50%);
  color: #000 !important;
  font-size: 0.16rem;
}
.mask p {
  font-size: 0.15rem;
  color: #fff;
  text-align: center;
  line-height: 0.2rem;
}
.mask .close {
  width: 0.33rem;
  height: 0.33rem;
  background: url("../assets/close.png") no-repeat;
  background-size: 100%;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.coupon-left {
  color: #fff;
  width: 1.1rem;
  height: 0.59rem;
  position: absolute;
  /* left: .2rem; */
  top: 0.17rem;
  text-align: center;
}

.mask .coupon-left i {
  font-size: 0.17rem;
  line-height: 1;
}
.mask .coupon-left span {
  line-height: 1;
}
.mask .coupon-left .sum {
  font-size: 0.36rem;
  line-height: 1;
  height: 0.36rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
}

.mask .coupon2-left i {
  font-size: 0.14rem;
  line-height: 1;
}
.mask .coupon2-left span {
  line-height: 1;
}
.mask .coupon2-left .sum {
  font-size: 0.24rem;
  line-height: 1;
  height: 0.36rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
}

.mask .coupon-left .manjian {
  font-size: 0.12rem;
  line-height: 0.24rem;
}
.mask .coupon-right {
  position: absolute;
  left: 1.23rem;
  top: 0;
  height: 0.98rem;
  width: 1.96rem;
}
.mask .coupon-shop {
  font-size: 0.14rem;
  color: #313131;
  font-weight: bold;
  position: absolute;
  top: 0.1rem;
  left: 0.1rem;
}
.mask .coupon-text {
  font-size: 0.12rem;
  color: #999999;
  position: absolute;
  left: 0.1rem;
  top: 0.55rem;
}
.mask .coupon-time {
  font-size: 0.12rem;
  color: #999999;
  position: absolute;
  top: 0.29rem;
  left: 0.1rem;
}
.thankYou {
  background: url("http://tmwl.oss-cn-shenzhen.aliyuncs.com/front/3yMebHXyHCAxC4ZyCPjdEc8N8EwQECae.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -65%);
  height: 4rem;
  width: 100%;
}
.thanks_go {
  background: url('http://tmwl.oss-cn-shenzhen.aliyuncs.com/front/ByNpYWGpB2D2cK8xZN53jpQf5JaQK3Jp.png') no-repeat;
  background-size: 100%;
  position: absolute;
  bottom: .2rem;
  left: 26%;
  width: 2rem;
  height: .5rem;
}
.guize {
  width: 3.48rem;
  height: 6.2rem;
  position: absolute;
  left: 50%;
  /* top: 5.29rem; */
  top: 5.89rem;
  transform: translateX(-50%);
  background: url("../assets/rule.png") no-repeat;
  background-size: 100%;
  font-size: 0.12rem;
  padding-top: 0.6rem;
  padding-left: 0.15rem;
  padding-right: 0.15rem;
  line-height: 0.2rem;
  overflow: hidden;
  padding-bottom: 0.1rem;
  box-sizing: border-box;
}
.guize_main {
  width: 100%;
  height: 100%;
  overflow: auto;
}
.guize2 {
  width: 3.48rem;
  height: 3.5rem;
  position: absolute;
  left: 50%;
  top: 5.29rem;
  transform: translateX(-50%);
  background: url("../assets/guize.png") no-repeat;
  background-size: 100%;
  font-size: 0.12rem;
  padding-top: 0.6rem;
  padding-left: 0.15rem;
  padding-right: 0.15rem;
  line-height: 0.2rem;
}
.hang {
  text-indent: 0.15rem;
}
.played {
  width: 3.12rem;
  height: 2.35rem;
  margin-left: -0.02rem;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
}
.palyed_text {
  text-align: center;
  font-size: 0.14rem;
  color: #333333;
  margin-top: 0.46rem;
}
.played_img {
  width: 2.03rem;
  height: 0.5rem;
  margin-top: 0.22rem;
  margin-left: -0.1rem;
}
.played_img:active {
  background: #313131;
  opacity: 0.3;
}
</style>
