<template>
    <div class="activity">
        <header>
            <span class="activity-left">
                <i class="iconfont">&#xe617;</i>
            </span>
            <span>团卖物联支付</span>
        </header>
        <div class="order-num">
            <div><p class="ordernum">订单号：CB78521369123124</p></div>
            <p>订单号：CB78521369123124</p>
            <p>订单号：CB78521369123124</p>
            <p style="padding-bottom:5px">订单号：CB78521369123124</p>
            <i class="iconfont bottom-arro">&#xe62c;</i>   
        </div>
        <div class="order-num-zhanwei"></div>

        <!-- 文字轮播 -->
        <div class="scroll-top">
            <div class="scroll-list">
                <div class="scroll-item">恭喜xxx获得<i class="scroll-sum">￥20</i>无门槛红包</div>
                <div class="scroll-item">恭喜xxx获得<i class="scroll-sum">￥20</i>无门槛红包</div>
                <div class="scroll-item">恭喜xxx获得<i class="scroll-sum">￥20</i>无门槛红包</div>
            </div>
        
        </div>

        <!-- 主题内容 -->
        <main>
            <div class=" prizeWheels">
                <div class="item item1"></div>
                <div class="item item2"></div>
                <div class="item item3"></div>
                <div class="item item4"></div>
                <div class="item item5"></div>
                <div class="item item6"></div>
                <div class="item item7"></div>
                <div class="item item8"></div>
                <div class="item play"></div>
            </div>
            
        </main>

        <!-- 遮罩层 -->
        <div class="mask" style="display:none">

            <!-- <div class="getCoupon">
                <h2>恭喜您获得</h2>
                <div class="coupon">
                    <div class="coupon-left">
                        <p class="sum"><i>￥</i>50</p>
                        <p class="manjian">满199可用</p>
                    </div>
                    <div class="coupon-right">
                        <p class="coupon-shop">洛西路店</p>
                        <p class="coupon-time">领取后6日有效</p>
                        <span class="coupon-choose"></span>
                        
                    </div>
                </div>
                <p>可在卡包中查看</p>
                <div class="close"></div>
            </div> -->


            <div class="drawCoupon">
                <h2>恭喜您抽中</h2>
                <div class="coupon">
                    <div class="coupon-left">
                        <p class="sum"><i>￥</i>50</p>
                        <p class="manjian">满199可用</p>
                    </div>
                    <div class="coupon-right">
                        <p class="coupon-shop">洛西路店</p>
                        <p class="coupon-time">领取后6日有效</p>
                        <span class="coupon-choose"></span>
                        
                    </div>
                </div>
                <p>可在卡包中查看</p>
                <div class="receive"></div>
            </div>


        </div>

    </div>    
</template>
<script>
import '../assets/iconfont/iconfont.css'
export default {
    data(){
        return{

        }
    },
}
</script>
<style scoped>
header{
    height: 44px;
    font-size: 17px;
    text-align: center;
    line-height: 44px;
    padding-left: 13px;
}

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
    padding-top: 15px;
    text-align: left;
    line-height: 23px;
    padding-left: 13px;
    padding-right: 19px;
    background: #fff;
    z-index: 4;
}
.order-num div{
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
    width: 1000px;
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
}
.item1{
    top: .2rem;
    left: .175rem;
}
.item2{
    top: .2rem;
    left: 1.22rem;
}
.item3{
    top: .2rem;
    left: 2.265rem;
}
.item4{
    top: .99rem;
    left: .175rem;
}
.item5{
    top: .99rem;
    left: 2.265rem;
}
.item6{
    top: 1.78rem;
    left: .175rem;
}
.item7{
    top: 1.78rem;
    left: 1.22rem;
}
.item8{
    top: 1.78rem;
    left: 2.265rem;
}
.play{
    top: .99rem;
    left: 1.22rem;
}



/* 遮罩层 */
.mask{
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, .8);
    position: fixed;
    top: 0;
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
    color: #fff600;
    font-size: .28rem;
    line-height: .15rem;
    text-align: center;
    height: .645rem;
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
        width: .73rem;
        height: .59rem;
        position: absolute;
        left: .2rem;
        top: .17rem;
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
        left: .5rem;
    }
   .mask .coupon-time{
        font-size: .12rem;
        color: #999999;
        position: absolute;
        top: .29rem;
        left: .1rem;
    }

</style>
