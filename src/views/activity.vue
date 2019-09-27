<template>
  <div class="activity">
    <div class="header">
      <img :src="success_icon" /> 支付完成！
    </div>
    <div class="order-num" ref="order" @click="showOrder" v-if="!isshow">
      <div>
        <p class="ordernum">订单号：{{message.order_sn}}</p>
      </div>
      <i class="iconfont bottom-arro">
        <span class="xiangqing">订单详情</span>&#xe62c;
      </i>
    </div>
    <div class="order-num1" ref="order" @click="showOrder" v-if="isshow">
      <div>
        <p class="ordernum">订单号：{{message.order_sn}}</p>
      </div>
      <p>店铺：{{message.store_name}}</p>
      <p>支付方式：{{message.browsertype}}</p>
      <p>金额：{{message.amount}}</p>
      <p v-if="is_result_money">实付：{{message.result_money}}</p>
      <i class="iconfont bottom-arro">&#xe61f;</i>
    </div>

    <div class="order-num-zhanwei"></div>

    <!-- 文字轮播 -->
    <div class="scroll-top">
      <div class="scroll-list" id="scroll">
        <div
          id="marquee"
        >恭喜1284获得￥50元无门槛红包&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;恭喜9098获得￥30元无门槛红红包&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;恭喜4727获得￥30元无门槛红包</div>
        <div
          id="copy"
        >恭喜1284获得￥50元无门槛红包&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;恭喜9098获得￥30元无门槛红红包&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;恭喜4727获得￥30元无门槛红包</div>
      </div>
      <div id="node"></div>
    </div>

    <!-- 主题内容 -->
    <main>
      <div class="prizeWheels" v-if="is_ok">
        <div v-for="(item,idx) in list" :key="idx" class="item" :class="['item' + idx ]">
          <img :src="item.pic" />
          <span v-if="item.youhui_type == 1" class="item_text">￥{{item.return_money}}现金券</span>
          <span v-if="item.youhui_type == 0" class="item_text">￥{{item.return_money}}兑换券</span>
          <span v-if="item.return_money == ''" class="item_text">谢谢参与</span>
          <span :class="item.active ? 'active' : 'active2'"></span>
        </div>
        <div class="item play" @click="play"></div>
      </div>
      <div class="prizeWheels" v-else>
        <div class="played">
          <div class="palyed_text">
            <p>您已抽过奖啦！</p>
            <p>前往小熊敬礼发现更多优惠信息吧！</p>
            <img src="../assets/played.png" class="played_img" @click="thanks" />
          </div>
        </div>
      </div>

      <div class="guize">
        <p>一、每次扫码支付结束后可获得1次抽奖机会。抽奖次数不会累计叠加；</p>
        <p>二、中奖并领取奖品后，可在[个人中心]-[我的卡券]中查看。中奖如不领取，则视为放弃奖品；</p>
        <p>三、中奖规则及中奖资格的排除：</p>
        <p>(一)奖品由系统随机抽取，中奖结果将在活动页面实时公布；</p>
        <p>(二)凡以不正当手段（包括但不限于机器刷奖、作弊、扰乱系统、实施网络攻击等）参与本次活动的用户，本公司有权终止其参与活动，取消其获奖资格(如奖励已发放，本公司有权收回)；</p>
        <p>四、点击“抽奖”按钮则视为已阅读抽奖规则。</p>
      </div>
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
              {{order_coupon.return_money}}
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
      <!-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->
      <div class="drawCoupon" v-if="is_lottery">
        <h2>
          恭喜您抽中
          <span>{{lottery_data.store_name}}</span>到店红包
        </h2>
        <div class="gift-coupon" v-if="lottery_data.youhui_type == 0">
          <div class="coupon-left-img">
            <img :src="lottery_data.image" />
          </div>
          <div class="gift-coupon-right">
            <p class="coupon-shop2">{{lottery_data.store_name || '暂无'}}</p>
            <p class="coupon-time2">{{lottery_data.name || '暂无'}}</p>
            <p class="coupon-text2">领取后{{lottery_data.expire_day}}日内有效</p>
          </div>
        </div>
        <div class="coupon2" v-else-if="lottery_data.youhui_type == 1">
          <div class="coupon2-left">
            <p class="sum">
              <i>￥</i>
              {{lottery_data.return_money}}
            </p>
            <p class="manjian">满{{lottery_data.total_fee}}可用</p>
          </div>

          <div class="coupon2-right">
            <p class="coupon-shop2">{{lottery_data.store_name}}</p>
            <p class="coupon-time2">领取后{{lottery_data.expire_day}}日内有效</p>
            <p class="coupon-text2">随时用/免预约</p>
          </div>
        </div>
        <div class="receive" @click="getCoupon"></div>
        <p class="order_text2">领取后可在“订单”中查看</p>
      </div>

      <div class="thankYou" v-if="is_thanks">
        <h2>哎呀，离大奖就差一点点</h2>
        <p>别灰心，小熊敬礼</p>
        <p>还有更多好礼等您来发现</p>
        <div class="close2">
          <div class="receive2" @click="thanks"></div>
        </div>
      </div>
    </div>
    <div class="loading-box" v-if="is_loading">
      <van-loading color="#fff" class="loading" vertical>Loading...</van-loading>
    </div>
  </div>
</template>
<script>
import "../assets/iconfont/iconfont.css";
import {
  requestLotterys,
  requestGetResult,
  requestGetCoupon,
  requestOrderCoupons
} from "../api/api";
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
      is_ok: true
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
    },
    is_loading(val) {
      if (val == false) {
        clearTimeout(this.loading);
        this.getOrderCoupon();
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
  },
  mounted() {
    _hmt.push(["_trackEvent", "活动页", "跳转到活动页"]);
    this.getList();
    this.move();

    this.loading = setTimeout(() => {
      this.is_loading = false;
    }, 2000);
  },

  methods: {
    //获取支付返券
    async getOrderCoupon() {
      let is_ok = sessionStorage.getItem("is_ok");
      if (is_ok) {
        return;
      }
      let order_sn = this.message.order_sn;
      let params = {
        order_sn
      };
      let res = await requestOrderCoupons(params);
      if (res.data.coupon_id == undefined) {
        this.is_show = false;
      } else {
        this.order_coupon = res.data;
        this.is_show = true;
        this.is_get = true;
      }
    },
    // 关闭支付返券
    closeOrderCoupon() {
      this.is_get = false;
      this.is_show = false;
    },
    thanks() {
      this.is_show = false;
      window.location.href = process.env.VUE_APP_SHOP;
    },

    getStopIndex() {
      // 获取服务器返回的index
      requestGetResult()
        .then(res => {
          // console.log(res);
          let data = res.data;
          this.lottery_data = data;
          if (res.data == "谢谢参与！") {
            for (let a = 0; a < this.list.length; a++) {
              if (this.list[a].youhui_type == "3") {
                this.stopIndex = a;
              }
            }
          } else {
            for (let a = 0; a < this.list.length; a++) {
              if (this.list[a].id == data.win_id) {
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
      let is_ok = sessionStorage.getItem("is_ok");
      if (is_ok) {
        Dialog.alert({
          message: "您已抽奖",
          confirmButtonColor: "#fc4833"
        });
        return;
      } else {
        sessionStorage.setItem("is_ok", 1);
      }
      _hmt.push(["_trackEvent", "抽奖", "点击抽奖"]);
      if (this.isMoving) {
        return false;
      }
      if (!this.is_one) {
        Dialog.alert({
          message: "您已抽奖",
          confirmButtonColor: "#fc4833"
        });
        return false;
      }
      this.is_one = false;
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
      // console.log(cur, stop);
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
          if (this.lottery_data == "谢谢参与！") {
            this.is_show = true;
            this.is_thanks = true;
          } else {
            this.is_show = true;
            this.is_lottery = true;
          }
        }
      }, 300);
    },
    showOrder() {
      this.isshow = !this.isshow;
    },
    async getList() {
      // let location = await getLocation();
      // console.log(location)
      let params = {
        xpoint: "113.450163",
        ypoint: "23.107527",
        order_sn: this.message.order_sn
        // order_sn: (new Date()).getTime()
      };
      let list = await requestLotterys(params);
      list = list.data.lottery_info;
      for (let i = 0; i < list.length; i++) {
        list[i].active = false;
      }
      this.list = list;
    },

    // 滚动播报
    move() {
      // 获取文字text 的计算后宽度  （由于overflow的存在，直接获取不到，需要独立的node计算）
      let width = document.getElementById("node").getBoundingClientRect().width;
      let scroll = document.getElementById("scroll");
      // let copy = document.getElementById('copy')
      let distance = 0; // 位移距离
      this.timer5 = setInterval(function() {
        distance = distance - 1;
        // 如果位移超过文字宽度，则回到起点
        if (-distance >= width) {
          distance = 16;
        }
        scroll.style.transform = "translateX(" + distance + "px)";
      }, 20);
    },

    // 立即领取
    async getCoupon() {
      _hmt.push(["_trackEvent", "领取", "领取奖品"]);
      let data = await requestGetCoupon();
      // 还需要操作
      this.is_show = false;
      window.location.href =
        process.env.VUE_APP_SHOP + "id=" + this.lottery_data.store_id;
      // window.location.href = 'http://user.tdianyi.com/'
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
  background: #a73008;
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
  height: 9.11rem;
  background: url("../assets/activity-bg.png") no-repeat;
  background-size: 100%;
  position: relative;
  background-position-y: -35px;
}
.prizeWheels {
  width: 3.48rem;
  height: 2.82rem;
  position: absolute;
  top: 2.15rem;
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
  width: 0.43rem;
  height: 0.31rem;
  position: absolute;
  top: 0.15rem;
  left: 50%;
  transform: translateX(-50%);
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
  background: url("http://tmwl.oss-cn-shenzhen.aliyuncs.com/front/ATZi4dXf8TDSDd53tpjp7N5Cbks5hBEH.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 3.915rem;
  width: 3.7rem;
  box-sizing: border-box;
  padding-top: 0.6rem;
  display: flex;
  align-items: center;
  flex-direction: column;
}
.drawCoupon h2 {
  font-weight: bold;
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
}
.mask .coupon-left .sum {
  font-size: 0.36rem;
  line-height: 0.36rem;
  height: 0.36rem;
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
  background: url("http://tmwl.oss-cn-shenzhen.aliyuncs.com/front/BBDsAWTrS2NQiw5NCjyyS2cfB84hcfZr.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 3.65rem;
  width: 2.925rem;
}
.thankYou h2 {
  font-size: 0.2rem;
  line-height: 0.3rem;
  height: 0.3rem;
  width: 100%;
  text-align: center;
  margin-top: 1.7rem;
  margin-bottom: 0.24rem;
  color: #a15709;
  font-weight: bold;
}
.thankYou p {
  color: #999999;
  width: 100%;
  text-align: center;
  height: 0.275rem;
  font-size: 0.15rem;
  line-height: 1;
}
.thankYou .close2 {
  height: 0.45rem;
  margin-top: 0.1rem;
  bottom: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thankYou .close2 .receive2 {
  width: 2.14rem;
  height: 0.45rem;
  background: url("../assets/lijiqianwang.png") no-repeat;
  background-size: 100% 100%;
}
.guize {
  width: 3.48rem;
  height: 3.16rem;
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
