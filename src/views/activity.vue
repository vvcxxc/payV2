<template>
    <div class="activity">
            <div class="order-num" ref="order" @click="showOrder" v-if="!isshow">
                <div><p class="ordernum">订单号：{{message.order_sn}}</p></div>
                <i class="iconfont bottom-arro">&#xe62c;</i>   
            </div>
            <div class="order-num1" ref="order" @click="showOrder" v-if="isshow">
                <div><p class="ordernum">订单号：{{message.order_sn}}</p></div>
                <p>店铺：{{message.store_name}}</p>
                <p>支付方式：{{message.browsertype}}</p>
                <p>金额：{{message.amount}}</p>
                <p style="padding-bottom:5px">实付：{{message.result_money}}</p>
                <i class="iconfont bottom-arro">&#xe61f;</i>   
            </div>

        <div class="order-num-zhanwei"></div>

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
            
        </main>

        <!-- 遮罩层 -->
        <div class="mask" style="display:block" v-if="is_show" @touchmove.prevent>

            <div class="getCoupon" v-if="is_get">
                <h2>恭喜您抽中<span>{{order_coupon.store_name}}</span>到店红包</h2>
                <div class="coupon">
                    <div class="coupon-left">
                        <p class="sum"><i>￥</i>{{order_coupon.return_money}}</p>
                        <p class="manjian">满{{order_coupon.total_fee}}可用</p>
                    </div>
                    <div class="coupon-right">
                        <p class="coupon-shop">{{order_coupon.store_name}}</p>
                        <p class="coupon-time">领取后{{order_coupon.expire_day}}日内有效</p>
                        <p class="coupon-text">极速退/免预约</p>
                        
                    </div>
                </div>
                <p>可在卡包中查看</p>
                <div class="close" @click="closeOrderCoupon"></div>
            </div>


            <div class="drawCoupon" v-if="is_lottery">
                <h2>恭喜您抽中<span>{{lottery_data.store_name}}</span>到店红包</h2>
                <div class="coupon">
                    <div class="coupon-left">
                        <p class="sum"><i>￥</i>{{lottery_data.return_money}}</p>
                        <p class="manjian">满{{lottery_data.total_fee}}可用</p>
                    </div>
                    <div class="coupon-right">
                        <p class="coupon-shop">{{lottery_data.store_name}}</p>
                        <p class="coupon-time">领取后{{lottery_data.expire_day}}日内有效</p>
                        <p class="coupon-text">极速退/免预约</p>
                    </div>
                </div>
                <p>可在卡包中查看</p>
                <div class="receive" @click="getCoupon"></div>
            </div>


        </div>

    </div>    
</template>
<script>
import '../assets/iconfont/iconfont.css';
import { requestLotterys, requestGetResult, requestGetCoupon, requestOrderCoupons } from '../api/api';
export default {
    data(){
        return{
            message:{},
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
            order_coupon: {}
        }
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
        let message = this.$route.params;
        if(message.browsertype == 'wechat'){
            message.browsertype = '微信支付'
        }else{
            message.browsertype = '支付宝支付'
        }
        this.message = message;
    },
    mounted(){
        this.getList();
        this.move();
        this.getOrderCoupon();
    },
    
    methods:{

        //获取支付返券
        async getOrderCoupon(){
            let order_sn = this.message.order_sn;
            let params = {
                order_sn
            }
            let { data } = await requestOrderCoupons(params);
            if(data == []){
                this.is_show = false;
            }else{
                this.order_coupon = data;
                this.is_show = true;
                this.is_get = true;
            }
            
        },
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
            if (this.isMoving) {
                return false;
            }
            if(!this.is_one){
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
                       return
                    }else{
                        // console.log(this.lottery_data)
                        this.is_show = true;
                        this.is_lottery = true;
                    }
                
                }
            }, 300);
        },
        showOrder(){
            this.isshow = !this.isshow;
        },
        async getList(){
            let params = {
                xpoint: '113.450163',
                ypoint: '23.107527',
                order_sn: this.message.order_sn
                // order_sn: (new Date()).getTime()
            }
            let list = await requestLotterys(params);
            list = list.data.lottery_info;
            for (let i = 0; i < list.length; i ++){
                list[i].active = false
            }
            this.list = list;
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
            let data = await requestGetCoupon();
            // 还需要操作
            this.is_show = false;
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


.activity-left{
    float: left;
    font-size: 17px;
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
    height: 135px;
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
    top: 16px;
    right: 13px;
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
    border-radius:10px;
}
.item img {
    width: .58rem;
    height: .42rem;
    position: absolute;
    top: .08rem;
    left: .25rem;
}
.item_text {
    font-size: .12rem;
    position: absolute;
    top: .54rem;
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
    height: .78rem;
    z-index: 2;
    border-radius:10px;
}
.item .active2 {
    position: absolute;
    width: 1.03rem;
    height: .78rem;
    z-index: 2;
    background: rgba(0, 0, 0, .27);
    border-radius:10px;
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
.getCoupon,.drawCoupon{
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

</style>
