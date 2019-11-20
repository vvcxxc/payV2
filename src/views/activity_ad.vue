<template>
    <div class="activity">
            <div class="header"><img :src=success_icon> 支付完成！</div>
           

        <!-- 文字轮播 -->
        <div class="scroll-top">
            
            <div class="scroll-list" id="scroll">
                <div id="marquee">
                    恭喜1284获得￥50元无门槛红包&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;恭喜9098获得￥30元无门槛红红包&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;恭喜4727获得￥30元无门槛红包
                </div>
                <div id="copy">恭喜1284获得￥50元无门槛红包&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;恭喜9098获得￥30元无门槛红红包&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;恭喜4727获得￥30元无门槛红包</div>
            </div>
            <div id="node"></div>
        </div>

        <!-- 主题内容 -->
        <main>
            <div class=" prizeWheels">
                <div v-for="(item,idx) in list" :key="idx" class="item" :class="['item' + idx ]">
                    <img :src="item.pic">
                    <span v-if="item.youhui_type == 1" class="item_text">
                        ￥{{item.return_money}}现金券
                    </span>
                    <span v-if="item.youhui_type == 0" class="item_text">
                        ￥{{item.return_money}}兑换券
                    </span>
                    <span v-if="item.return_money == ''" class="item_text">
                        谢谢参与
                    </span>
                    <span :class="item.active ? 'active' : 'active2'"></span>
                </div>
                <div class="item play" @click="play"></div>
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
                <h2>恭喜您获得<span>{{order_coupon.store_name}}</span>到店红包</h2>
                <div class="coupon">
                    <div class="coupon-left">
                        <p class="sum"><i>￥</i>{{order_coupon.return_money}}</p>
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


            <div class="drawCoupon" v-if="is_lottery">
                <h2>恭喜您抽中<span>{{lottery_data.store_name}}</span>到店红包</h2>
                <div class="gift-coupon"  v-if="lottery_data.youhui_type == 0">
                    <div class='coupon-left-img'>
                        <img :src="lottery_data.image" >
                    </div>
                    <div class="gift-coupon-right">
                        <p class="coupon-shop">{{lottery_data.store_name || '暂无'}}</p>
                        <p class="coupon-time">{{lottery_data.name || '暂无'}}</p>
                        <p class="coupon-text">领取后{{lottery_data.expire_day}}日内有效</p>
                    </div>
                </div>
                <div class="coupon" v-else-if="lottery_data.youhui_type == 1">
                    <div class="coupon-left">
                        <p class="sum"><i>￥</i>{{lottery_data.return_money}}</p>
                        <p class="manjian">满{{lottery_data.total_fee}}可用</p>
                    </div>
                   
                    <div class="coupon-right">
                        <p class="coupon-shop">{{lottery_data.store_name}}</p>
                        <p class="coupon-time">领取后{{lottery_data.expire_day}}日内有效</p>
                        <p class="coupon-text">随时用/免预约</p>
                    </div>
                </div>
                
                <p class="order_text">可在“订单”中查看</p>
                <div class="receive" @click="getCoupon"></div>
            </div>

            <div class="thankYou" v-if="is_thanks">
                <h2>感谢您的参与</h2>
                <p>超值大礼包等您下次来拿</p>
                <div class="close" @click="thanks"></div>
            </div>
            

        </div>
        <!-- <div class="loading-box" v-if="is_loading">
            <van-loading color="#fff"  class="loading" vertical>Loading...</van-loading>
        </div> -->
    </div>    
</template>
<script>
import '../assets/iconfont/iconfont.css';
import { requestLotterys, requestGetResult, requestGetCoupon, requestOrderCoupons } from '../api/api';
import { Loading, Dialog } from 'vant'
import { constants } from 'crypto';
import { Cookie } from '../utils/common';
import { getUrlParams, getBrowserType } from "../utils/get_info";
export default {
    data(){
        return{
            isshow:false,
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
            success_icon: require('../assets/success_icon.png'),
            // loading定时器
            loading: null,
            // 是否显示实付金额
            is_result_money: true
        }
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
      
    },
    created(){
        this.data = this.$route.query
        let message = sessionStorage.getItem('message');
        this.store_id = this.data.store_id
        if(!message){
            sessionStorage.setItem('message', JSON.stringify(this.data))
        }
    },
    mounted(){
        this.getList();
        this.move();
        
       
    },
    
    methods:{
        // 关闭支付返券
        closeOrderCoupon(){
            this.is_get = false;
            this.is_show = false;
        },

        getStopIndex(){// 获取服务器返回的index
            requestGetResult().then(res => {
                // console.log(res);
                let data = res.data
                this.lottery_data = data;
                if (res.data == '谢谢参与！'){
                    for( let a = 0; a < this.list.length; a ++ ){
                        if(this.list[a].youhui_type == '3'){
                            this.stopIndex = a;
                        }
                    }
                }else{
                    for( let a = 0; a < this.list.length; a ++ ){
                        if(this.list[a].id == data.win_id){
                            this.stopIndex = a;
                        }
                    }
                    
                }
                if (this.lastIndex !== this.stopIndex || this.lastIndex === this.stopIndex) {
                    this.ajaxEnd = true;
                }
               
            })
            .catch(() => {
                clearInterval(this.timer1);
                this.list.map((e) => {
                    e.active = false;
                });
                this.lastIndex = 0;
                this.isMoving = false;
                this.lastIndex = 0;
                this.times = 0;
            })
        },
        play(){//点击开始游戏
            let is_ok = sessionStorage.getItem('is_ok')
                if(is_ok){
                     Dialog.alert({
                message: '您已抽奖',
                confirmButtonColor: '#fc4833'
              })
                    return
            }else{
                sessionStorage.setItem('is_ok',1)
            }
              _hmt.push(['_trackEvent', '抽奖', '点击抽奖']);
            if (this.isMoving) {
                return false;
            }
            if(!this.is_one){
                 Dialog.alert({
                message: '您已抽奖',
                confirmButtonColor: '#fc4833'
              })
                return false
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
                this.times ++;
                i++;
                if (i === 8) {
                i = 0;
                }

                this.list.map((e) => {
                e.active = false;
                });
                this.$set(this.list[i], 'active', true);
                // 当获取到服务器数据 index
                if (this.timerEnd) {
                // console.log('服务器返回的停止位置: ', this.stopIndex);
                clearInterval(this.timer1);
                this.enter(i, this.stopIndex);
                }
            }, 100);

        },
        enter(cur, stop) { // 计算需要停止的index
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
                this.list.map((e) => {
                e.active = false;
                });
                this.$set(this.list[i], 'active', true);
                if (count === 4) {
                clearInterval(this.timer2);
                this.stop(i);
                }
            }, 100);
        },
        stop(cur) { // 计算需要停止的index
            let count = 0;
            let i = cur;
            this.timer3 = setInterval(() => {
                count++;
                i++;
                if (i === 8) {
                i = 0;
                }
                this.list.map((e) => {
                e.active = false;
                });
                this.$set(this.list[i], 'active', true);
                if (count === 4) {
                    clearInterval(this.timer3);
                    this.isMoving = false;
                    this.lastIndex = this.stopIndex;
                    this.luckyTimes--;
                    // 结束后-----
                    if(this.lottery_data == '谢谢参与！'){
                        this.is_show = true;
                        this.is_thanks = true;
                    }else{
                        this.is_show = true;
                        this.is_lottery = true;
                    }
                
                }
            }, 300);
        },
        showOrder(){
            this.isshow = !this.isshow;
        },
        thanks(){
            this.is_show = false;
            let message = JSON.parse(sessionStorage.getItem('message'))
            // console.log(message.store_id)
            window.location.href = process.env.VUE_APP_SHOP+'store_id='+message.store_id
             sessionStorage.removeItem('message')
        },
        getList(){
            let message = JSON.parse(sessionStorage.getItem('message'))
            let params = {
               ...message,
               type: 2
            }
            requestLotterys(params).then(res => {
                let list = res.data.lottery_info;
                for (let i = 0; i < list.length; i ++){
                    list[i].active = false
                }
                this.list = list;
            })
            .catch(err => {
               let message = JSON.parse(sessionStorage.getItem('message'))
                if(err.status == 401){
                    if(process.env.NODE_ENV == 'development'){
                        Cookie.set('test_token_auth','eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vdGVzdC5hcGkudGRpYW55aS5jb20vYXBpL3dhcC9kb0xvZ2luIiwiaWF0IjoxNTY3MTkzNzQwLCJleHAiOjE1NjcyODM3NDAsIm5iZiI6MTU2NzE5Mzc0MCwianRpIjoiRXlyVjgwd0xHVUFLdzhlNCIsInN1YiI6NzIsInBydiI6ImY2YjcxNTQ5ZGI4YzJjNDJiNzU4MjdhYTQ0ZjAyYjdlZTUyOWQyNGQifQ.d2HP4KYQx8gDTmf65cz_2u_vowd97x9G5C6VzFBdpDU')
                        return
                    }
                    let from = window.location.href
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
                    let url = process.env.VUE_APP_BASE_DOMAIN + "ali/getZfbUserInfo";
                    url = encodeURIComponent(url);
                    window.location.href =
                        process.env.VUE_APP_BASE_DOMAIN +
                        "ali/zfbUserAuth?code_id=0&store_id="+message.store_id+"&from=" +
                        from +
                        "&url=" +
                        url;
                    }
                }
            });
        },

        // 滚动播报
        move(){
            // 获取文字text 的计算后宽度  （由于overflow的存在，直接获取不到，需要独立的node计算）
            let width = document.getElementById('node').getBoundingClientRect().width 
            let scroll = document.getElementById('scroll')
            // let copy = document.getElementById('copy')
            let distance = 0 // 位移距离
            this.timer5 = setInterval(function () {
                distance = distance - 1
                // 如果位移超过文字宽度，则回到起点
                if (-distance >= width) {
                distance = 16
                }
                scroll.style.transform = 'translateX(' + distance + 'px)'
            }, 20)
        },

        // 立即领取
        async getCoupon(){
             _hmt.push(['_trackEvent', '领取', '领取奖品']);
            let data = await requestGetCoupon();
            // 还需要操作
            let message = JSON.parse(sessionStorage.getItem('message'))
            this.is_show = false;
            window.location.href = process.env.VUE_APP_SHOP +'id='+ this.lottery_data.store_id+'store_id='+message.store_id
            // window.location.href = 'http://user.tdianyi.com/'
            sessionStorage.removeItem('message')
        }

    },
    beforeDestroy() { // 组件销毁前
        // 清除定时器
        clearInterval(this.timer1);
        clearInterval(this.timer2);
        clearInterval(this.timer3);
        clearInterval(this.timer);

    },
}
</script>
<style scoped>
.loading-box {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, .7);
    z-index: 999;
}
.loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    color: #fff;
}
.van-loading__text {
    color: #fff;
}

.activity-left{
    float: left;
    font-size: 17px;
}

.header {
    width: 100%;
    height: .55rem;
    background: #FFF2E6;
    text-align: center;
    font-size: .17rem;
    color: #FF7F0E;
    font-weight: bold;
    line-height: .55rem;
}
.header img {
    width: .24rem;
    height: .24rem;
}
.xiangqing {
    font-size: .13rem;
    color: #FF6654;
    padding-right: .1rem;
}



/* 订单号部分 */
.order-num-zhanwei{
    height: 42px;
}
.order-num{
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
.order-num1{
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
.order-num1 div{
    height: 23px;
}
.ordernum{
    display: block;
    position: absolute;
    left: 13px;
    top: 10px;
    height: 23px;
}
.ordernum::after{
    content: '';
    display: block;
    height: 0;
    clear: both;
}
.bottom-arro{
    position: absolute;
    top: 10px;
    right: 13px;
}
.order_text {
    color: #FFFFFF;
    font-size: 12px;
}

/* 头部滚动条 */
.scroll-top{
    height: 35px;
    background: #a73008;
    font-size: 13px;
    color: #fff;
    line-height: 35px;
    overflow: hidden;
}
.scroll-sum{
    color: #ffcf5b;
}
.scroll-list{
    width: 1500px;
}
.scroll-list div{
     float: left;
}
#marquee {
   margin: 0 16px 0 0;
}
.scroll-item{
    padding-right: 26px;
    float: left;
}


/* 主体内容 */
main{
    width: 100vw;
    height: 9.11rem;
    background: url('../assets/activity-bg.png') no-repeat;
    background-size: 100%;
    position: relative;
    background-position-y: -35px;
}
.prizeWheels{
    width: 3.48rem;
    height: 2.82rem;
    position: absolute;
    top: 2.15rem;
    left: .11rem;
    background: url('../assets/biaopan.png') no-repeat;
    background-size: 100%;
    padding: .2rem;
}
.item{
    width: 1.03rem;
    height: .78rem;
    position: absolute;
    border-radius:7px;
}
.item img {
    width: .43rem;
    height: .31rem;
    position: absolute;
    top: .15rem;
    left: 50%;
    transform: translateX(-50%);
}
.item_text {
    font-size: .12rem;
    position: absolute;
    top: .5rem;
    display: block;
    width: 1.03rem;
    text-align: center;
}
.item0{
    top: .2rem;
    left: .175rem;
}
.item1{
    top: .2rem;
    left: 1.22rem;
}
.item2{
    top: .2rem;
    left: 2.265rem;
}
.item7{
    top: .99rem;
    left: .175rem;
}
.item3{
    top: .99rem;
    left: 2.265rem;
}
.item6{
    top: 1.78rem;
    left: .175rem;
}
.item5{
    top: 1.78rem;
    left: 1.22rem;
}
.item4{
    top: 1.78rem;
    left: 2.265rem;
}
.item .active {
    background: none;
    position: absolute;
    width: 1.03rem;
    height: .785rem;
    z-index: 2;
    border-radius:7px;
}
.item .active2 {
    position: absolute;
    width: 1.03rem;
    height: .785rem;
    z-index: 2;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, .27);
    border-radius:7px;
}

.play{
    top: .99rem;
    left: 1.22rem;
    background: none
}
.play:active{
    background: #313131;
    opacity: .3;
}

/* 遮罩层 */
.mask{
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, .8);
    position: fixed;
    top: 0;
    z-index: 10;
}
.getCoupon,.drawCoupon,.thankYou{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    height: 2.61rem;
    width: 3.2rem;
}
.mask h2{
    color: #fff;
    font-size: .18rem;
    line-height: .28rem;
    text-align: center;
    height: .645rem;
}
.mask h2 span {
    font-size: .28rem;
    color: #FFF600;
}
.coupon{
    width: 3.2rem;
    height: .98rem;
    background: url('../assets/coupon.png') no-repeat;
    background-size: 100%;
    position: relative;
}
.gift-coupon {
    width: 3.2rem;
    height: .98rem;
    background: #fff;
    background-size: 100%;
    position: relative;
}
.gift-coupon-right {
    position: absolute;
    left: 1.23rem;
    top: 0;
    height: .98rem;
    width: 1.96rem;
}
.mask p{
    font-size: .15rem;
    color: #fff;
    text-align: center;
    line-height: .2rem;
}
.mask .close{
    width: .33rem;
    height: .33rem;
    background: url('../assets/close.png') no-repeat;
    background-size: 100%;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
}
.receive{
    width: 2.14rem;
    height: .45rem;
    background: url('../assets/lijilingqu.png') no-repeat;
    background-size: 100%;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
}

.coupon-left{
        color: #fff;
        width: 1.1rem;
        height: .59rem;
        position: absolute;
        /* left: .2rem; */
        top: .17rem;
        text-align: center;
    }
    .coupon-left-img {
        height: .98rem;
        width: 1.1rem;
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
   .mask .coupon-left i{
        font-size: .17rem;
    }
   .mask .coupon-left .sum{
        font-size: .36rem;
        line-height: .36rem;
        height: .36rem;
    }
   .mask .coupon-left .manjian{
        font-size: .12rem;
        line-height: .24rem;
    }
   .mask .coupon-right{
        position: absolute;
        left: 1.23rem;
        top: 0;
        height: .98rem;
        width: 1.96rem;
    }
   .mask .coupon-shop{
        font-size: .14rem;
        color: #313131;
        font-weight: bold;
        position: absolute;
        top: .1rem;
        left: .1rem;
    }
    .mask .coupon-text{
        font-size: .12rem;
        color: #999999;
        position: absolute;
        left: .1rem;
        top: .55rem;
    }
   .mask .coupon-time{
        font-size: .12rem;
        color: #999999;
        position: absolute;
        top: .29rem;
        left: .1rem;
    }
    .thankYou h2{
        margin-bottom: .2rem;
        font-size: .3rem;
        line-height: .3rem;
        height: .3rem;
    }
    .thankYou .close{
        bottom: 110px;
    }

    .guize {
        width: 3.48rem;
        height: 3.16rem;
        position: absolute;
        left: 50%;
        top: 5.29rem;
        transform: translateX(-50%);
        background: url('../assets/guize.png') no-repeat;
        background-size: 100%;
        font-size: .12rem;
        padding-top: .6rem;
        padding-left: .15rem;
        padding-right: .15rem;
        line-height: .2rem;
    }

</style>
